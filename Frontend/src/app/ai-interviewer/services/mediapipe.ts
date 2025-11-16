import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { Hands, Results as HandsResults } from '@mediapipe/hands';
import { Pose, Results as PoseResults } from '@mediapipe/pose';

// Type-safe landmark definition
type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type AnalysisResult = {
  facialExpressions: {
    smileConfidence: number;
    eyeContact: number;
    headPose: {
      yaw: number;   // horizontal rotation (degrees)
      pitch: number; // vertical tilt (degrees)
      roll: number;  // lateral tilt (degrees)
    };
  };
  gestures: {
    handGestures: string[];
    posture: string;
    engagement: number;
  };
  metrics: {
    confidence: number;
    timestamp: number;
    processingLag?: number; // ms since frame capture
  };
};

type ModalityCache = {
  face?: FaceMeshResults;
  hands?: HandsResults;
  pose?: PoseResults;
  ts?: number;
};

// Utility functions
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothStep = (x: number) => clamp01(x);
const toDeg = (r: number) => r * 180 / Math.PI;

function centroid(pts: Landmark[]) {
  const n = pts.length || 1; // Guard against empty arrays
  return {
    x: pts.reduce((s, p) => s + p.x, 0) / n,
    y: pts.reduce((s, p) => s + p.y, 0) / n,
  };
}

function minVis(pts: Landmark[], thr: number) {
  return pts.every(p => (p.visibility ?? 1) >= thr);
}

// EWMA smoother for temporal consistency
function makeSmoother({ alpha = 0.2 } = {}) {
  const mem = new Map<string, number>();
  return (key: string, v: number) => {
    const prev = mem.get(key);
    const next = prev == null ? v : prev + alpha * (v - prev);
    mem.set(key, next);
    return next;
  };
}

// Dead-zone helper to reduce jitter near neutral values
function deadzone(x: number, zone = 0.03): number {
  return Math.abs(x - 0.5) < zone ? 0.5 : x;
}

export class MediaPipeAnalyzer {
  private faceMesh!: FaceMesh;
  private hands!: Hands;
  private pose!: Pose;
  private videoElement: HTMLVideoElement;
  private onResultsCallback: (results: AnalysisResult) => void;
  private isAnalyzing: boolean = false;
  private rafId: number | null = null;
  private cache: ModalityCache = {};
  private smooth = makeSmoother({ alpha: 0.2 });
  private previousResult?: AnalysisResult;
  private mirrorX: boolean;
  private lastSent = 0;
  private busy = false;
  private targetMs = 1000 / 30; // ~30 FPS cap
  private scheduledEmit = false; // Coalesce multiple model results per frame
  private visHandler = () => document.hidden ? this.stopAnalysis() : this.startAnalysis();
  private initializing = true; // block processing until warmup completes
  private readyFlags = { face: false, hands: false, pose: false };
  private readyResolvers: { face?: () => void; hands?: () => void; pose?: () => void } = {};
  private frameCounter = 0;
  private initPromise: Promise<void> | null = null;
  private attached = { face: false, hands: false, pose: false };

  constructor(
    videoElement: HTMLVideoElement,
    onResults: (results: AnalysisResult) => void,
    mirrorX = true // Default true for selfie mode
  ) {
    this.videoElement = videoElement;
    this.onResultsCallback = onResults;
    this.mirrorX = mirrorX;

    // SSR guard - only run in browser
    if (typeof window === 'undefined') {
      throw new Error('MediaPipe can only be initialized in the browser');
    }

    try {
      // Kick off sequential initialization with warmup
      this.initPromise = this.initModels();
    } catch (error) {
      console.error('❌ MediaPipe initialization failed:', error);
      console.warn('⚠️ MediaPipe disabled - interview will continue without body language analysis');
    }
  }

  private setupModels() {
    // Configure Face Mesh if available
    if (this.faceMesh) {
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      if (!this.attached.face) {
        this.faceMesh.onResults((r) => {
          if (!this.readyFlags.face) {
            this.readyFlags.face = true;
            this.readyResolvers.face?.();
          }
          this.cache.face = r;
          this.cache.ts = performance.now();
          this.maybeEmit();
        });
        this.attached.face = true;
      }
    }

    // Configure Hands if available
    if (this.hands) {
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      if (!this.attached.hands) {
        this.hands.onResults((r) => {
          if (!this.readyFlags.hands) {
            this.readyFlags.hands = true;
            this.readyResolvers.hands?.();
          }
          this.cache.hands = r;
          this.cache.ts = performance.now();
          this.maybeEmit();
        });
        this.attached.hands = true;
      }
    }

    // Configure Pose if available
    if (this.pose) {
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      if (!this.attached.pose) {
        this.pose.onResults((r) => {
          if (!this.readyFlags.pose) {
            this.readyFlags.pose = true;
            this.readyResolvers.pose?.();
          }
          this.cache.pose = r;
          this.cache.ts = performance.now();
          this.maybeEmit();
        });
        this.attached.pose = true;
      }
    }
  }

  private async waitForVideoReady(timeoutMs = 5000) {
    const start = performance.now();
    while ((this.videoElement.readyState < 2 || this.videoElement.videoWidth === 0)) {
      if (performance.now() - start > timeoutMs) break;
      await new Promise(r => setTimeout(r, 50));
    }
  }

  private async initModels() {
    // Route assets to local public folder by filename
    const locateAsset = (file: string) => {
      // Extract just the filename from the path
      const fileName = file.split('/').pop() || file;
      
      // Determine which model folder based on filename patterns
      if (fileName.includes('face_mesh') || fileName.includes('face_') || fileName === 'face_mesh.binarypb') {
        return `/mediapipe/face_mesh/${fileName}`;
      } else if (fileName.includes('hands') || fileName.includes('hand_') || fileName === 'hands.binarypb') {
        return `/mediapipe/hands/${fileName}`;
      } else if (fileName.includes('pose') || fileName === 'pose_web.binarypb' || fileName.includes('pose_landmark')) {
        return `/mediapipe/pose/${fileName}`;
      }
      
      // Fallback - return the filename with a warning
      if (fileName !== file) {
        console.warn(`⚠️ Unknown MediaPipe file: ${fileName}`);
      }
      return `/mediapipe/${fileName}`;
    };

    // Ensure video is ready before any sends
    await this.waitForVideoReady();

    // FaceMesh: construct -> setup -> warmup -> wait ready
    try {
      console.log('🔄 Initializing FaceMesh...');
      this.faceMesh = new FaceMesh({ locateFile: locateAsset });
      this.setupModels();
      let faceReady = new Promise<void>(res => (this.readyResolvers.face = res));
      await this.faceMesh.send({ image: this.videoElement });
      await faceReady;
      console.log('✅ FaceMesh ready');
    } catch (e) {
      console.warn('⚠️ FaceMesh init failed, continuing without face analysis:', e);
      this.faceMesh = undefined as unknown as FaceMesh;
    }

    // Hands: TEMPORARILY DISABLED due to WASM compatibility issues
    // Uncomment when resolved
    /*
    try {
      console.log('🔄 Initializing Hands...');
      this.hands = new Hands({ locateFile: locateAsset });
      this.setupModels();
      let handsReady = new Promise<void>(res => (this.readyResolvers.hands = res));
      await this.hands.send({ image: this.videoElement });
      await handsReady;
      console.log('✅ Hands ready');
    } catch (e) {
      console.warn('⚠️ Hands init failed, continuing without hand analysis:', e);
      this.hands = undefined as unknown as Hands;
    }
    */
    console.log('⏭️ Skipping Hands initialization (disabled)');
    this.hands = undefined as unknown as Hands;

    // Pose: TEMPORARILY DISABLED due to WASM compatibility issues
    // Uncomment when resolved
    /*
    try {
      console.log('🔄 Initializing Pose...');
      this.pose = new Pose({ locateFile: locateAsset });
      this.setupModels();
      let poseReady = new Promise<void>(res => (this.readyResolvers.pose = res));
      await this.pose.send({ image: this.videoElement });
      await poseReady;
      console.log('✅ Pose ready');
    } catch (e) {
      console.warn('⚠️ Pose init failed, continuing without posture analysis:', e);
      this.pose = undefined as unknown as Pose;
    }
    */
    console.log('⏭️ Skipping Pose initialization (disabled)');
    this.pose = undefined as unknown as Pose;

    this.initializing = false;
    const successfulModels = [
      this.faceMesh ? 'FaceMesh' : null,
      this.hands ? 'Hands' : null,
      this.pose ? 'Pose' : null
    ].filter(Boolean);
    console.log('✅ MediaPipe warmup complete. Active models:', successfulModels.join(', ') || 'NONE');
  }

  // Helper to handle mirrored video (common in selfie mode)
  private maybeFlipX(x: number): number {
    return this.mirrorX ? (1 - x) : x;
  }

  // Public API: change mirror mode dynamically
  public setMirror(mirror: boolean) {
    this.mirrorX = mirror;
  }

  // Public API: adjust FPS cap dynamically
  public setFpsCap(fps: number) {
    this.targetMs = 1000 / Math.max(1, fps);
  }

  // Public API: get latest result (pull-based)
  public getLatest(): AnalysisResult | undefined {
    return this.previousResult;
  }

  // Public API: auto-pause when tab hidden (saves CPU)
  public attachVisibilityAutoPause() {
    document.addEventListener('visibilitychange', this.visHandler);
  }

  public detachVisibilityAutoPause() {
    document.removeEventListener('visibilitychange', this.visHandler);
  }

  public startAnalysis() {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    console.log('🎬 Starting MediaPipe analysis loop');

    const run = async () => {
      if (this.initPromise) {
        try { await this.initPromise; } catch {}
      }

      let loggedFirstFrame = false;
      const loop = async (t: number) => {
        if (!this.isAnalyzing) return;

        const dt = t - this.lastSent;
        
        // Frame-rate cap (~30 FPS) with backpressure
        // Also check video dimensions are available (not just readyState)
        if (!this.busy && dt >= this.targetMs &&
            this.videoElement.readyState >= 2 &&
            this.videoElement.videoWidth > 0) {
          this.busy = true;
          
          if (!loggedFirstFrame) {
            console.log('📹 Processing first frame:', {
              width: this.videoElement.videoWidth,
              height: this.videoElement.videoHeight,
              readyState: this.videoElement.readyState
            });
            loggedFirstFrame = true;
          }
          
          try {
            // Stagger and serialize sends per frame to reduce contention
            this.frameCounter++;
            if (this.faceMesh && typeof this.faceMesh.send === 'function') {
              await this.faceMesh.send({ image: this.videoElement });
            }
            if (this.hands && typeof this.hands.send === 'function' && this.frameCounter % 2 === 0) {
              await this.hands.send({ image: this.videoElement });
            }
            if (this.pose && typeof this.pose.send === 'function' && this.frameCounter % 3 === 0) {
              await this.pose.send({ image: this.videoElement });
            }
            this.lastSent = t;
          } catch (e) {
            console.warn('Frame processing error:', e);
          } finally {
            this.busy = false;
          }
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    };

    // Launch async runner
    void run();
  }

  // Reset smoothing for new session/user
  public resetSmoothing() {
    this.smooth = makeSmoother({ alpha: 0.2 });
    this.previousResult = undefined;
    this.cache = {};
    console.log('🔄 MediaPipe smoothing reset');
  }

  public stopAnalysis() {
    this.isAnalyzing = false;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Coalesced emit: multiple model results combine into one callback per frame
  private maybeEmit() {
    if (this.scheduledEmit) return;
    this.scheduledEmit = true;
    
    requestAnimationFrame(() => {
      this.scheduledEmit = false;
      const { face, hands, pose, ts } = this.cache;
      if (!face && !hands && !pose) return;

      // Compute fused metrics from available modalities
      const facial = face ? this.computeFace(face) : null;
      const gestData = hands ? this.computeHands(hands) : null;
      const postureData = pose ? this.computePose(pose) : null;

      // Merge and smooth results
      const merged = this.fuseResults(facial, gestData, postureData, ts ?? performance.now());

      this.previousResult = merged;
      
      // Wrap callback in try/catch to prevent user errors from breaking the loop
      try {
        this.onResultsCallback(merged);
      } catch (e) {
        console.error('❌ User callback error:', e);
      }
    });
  }

  // CORRECTED: Compute face metrics using iris landmarks for accurate eye contact
  // ALL ANGLES IN DEGREES for consistency with pose
  private computeFace(res: FaceMeshResults) {
    const lm = res.multiFaceLandmarks?.[0] as Landmark[] | undefined;
    if (!lm) {
      if (Math.random() < 0.05) console.log('⚠️ No face landmarks detected');
      return null;
    }

    // Use correct landmarks: outer eye corners (not ears!)
    const leftOuter = lm[33];
    const rightOuter = lm[263];
    const nose = lm[1];
    const upperLip = lm[13];
    const lowerLip = lm[14];

    // Apply mirror correction for X coordinates
    const leftOuterX = this.maybeFlipX(leftOuter.x);
    const rightOuterX = this.maybeFlipX(rightOuter.x);
    const noseX = this.maybeFlipX(nose.x);

    // Roll: angle of eye line (in degrees)
    const rollRad = Math.atan2(rightOuter.y - leftOuter.y, rightOuterX - leftOuterX);
    const roll = toDeg(rollRad);

    // Yaw: horizontal offset of nose from eye midpoint (in degrees)
    const midEyeX = (leftOuterX + rightOuterX) / 2;
    const eyeWidth = Math.abs(rightOuterX - leftOuterX);
    const yaw = toDeg(Math.atan((noseX - midEyeX) / (eyeWidth + 1e-6)));

    // Pitch: vertical nose position relative to eyes (in degrees)
    const midEyeY = (leftOuter.y + rightOuter.y) / 2;
    const eyeDist = Math.hypot(rightOuterX - leftOuterX, rightOuter.y - leftOuter.y);
    const pitch = toDeg(Math.atan((nose.y - midEyeY) / (eyeDist + 1e-6)));

    // IMPROVED: Smile detection with lip corner spread (not just mouth open)
    const leftCorner = lm[61];
    const rightCorner = lm[291];
    const cornerSpread = Math.abs(this.maybeFlipX(rightCorner.x) - this.maybeFlipX(leftCorner.x)) / (eyeDist + 1e-6);
    const mouthOpen = Math.hypot(lowerLip.y - upperLip.y, lowerLip.x - upperLip.x) / (eyeDist + 1e-6);
    
    const smileOpen = clamp01((mouthOpen - 0.18) * 6);
    const smileCorners = clamp01((cornerSpread - 0.32) * 5);
    const smile = 0.35 * smileOpen + 0.65 * smileCorners; // Weighted blend

    // IMPROVED: Eye contact with radial iris offset (horizontal + vertical)
    const leftIris = centroid([lm[468], lm[469], lm[470], lm[471]]);
    const rightIris = centroid([lm[473], lm[474], lm[475], lm[476]]);
    const leftIrisX = this.maybeFlipX(leftIris.x);
    const rightIrisX = this.maybeFlipX(rightIris.x);
    
    const irisOffsetX = Math.abs(((leftIrisX + rightIrisX) / 2) - midEyeX) / (eyeWidth + 1e-6);
    const irisOffsetY = Math.abs(((leftIris.y + rightIris.y) / 2) - midEyeY) / (eyeDist + 1e-6);
    const irisRad = Math.hypot(irisOffsetX, irisOffsetY);
    const eyeContact = clamp01(1 - irisRad * 3.5);

    return {
      facialExpressions: {
        smileConfidence: smoothStep(smile),
        eyeContact: eyeContact,
        headPose: { yaw, pitch, roll } // All in degrees
      }
    };
  }

  // CORRECTED: Hand gestures with visibility checks, handedness, and hand-size normalization
  private computeHands(res: HandsResults) {
    const gestures: string[] = [];
    for (let i = 0; i < (res.multiHandLandmarks?.length ?? 0); i++) {
      const lm = res.multiHandLandmarks![i] as Landmark[];
      const label = res.multiHandedness?.[i]?.label ?? "Unknown";
      const handScore = res.multiHandedness?.[i]?.score ?? 0;
      
      // Calculate hand size for scale-invariant detection
      const handSize = Math.hypot(lm[9].x - lm[0].x, lm[9].y - lm[0].y) + 1e-6;
      
      // Quality gates: handedness confidence + on-screen size
      if (handScore < 0.5 || handSize < 0.03) continue;

      if (this.isThumbsUp(lm, handSize, label)) {
        gestures.push('thumbs_up');
      } else if (this.isPointing(lm, handSize)) {
        gestures.push('pointing');
      }
    }

    return {
      gestures: {
        handGestures: gestures.length ? gestures : ['neutral'],
        posture: '',
        engagement: gestures.length ? 0.8 : 0.6
      }
    };
  }

  private visibleEnough(lm: Landmark[]): boolean {
    const vis = lm.reduce((a, p) => a + (p.visibility ?? 1), 0) / lm.length;
    return vis > 0.5;
  }

  // Scale-invariant thumbs up detection
  private isThumbsUp(lm: Landmark[], handSize: number, label: string): boolean {
    const thumbTip = lm[4];
    const thumbIp = lm[3];
    const indexPip = lm[6];
    
    // Normalize by hand size to be scale-invariant
    const thumbExtension = (thumbIp.y - thumbTip.y) / handSize;
    const aboveIndex = (indexPip.y - thumbTip.y) / handSize;
    
    return thumbExtension > 0.3 && aboveIndex > 0.2;
  }

  // Scale-invariant pointing detection
  private isPointing(lm: Landmark[], handSize: number): boolean {
    const indexTip = lm[8];
    const indexPip = lm[6];
    const middleTip = lm[12];
    const ringTip = lm[16];
    const pinkyTip = lm[20];
    
    // Normalize by hand size
    const indexExtension = (indexPip.y - indexTip.y) / handSize;
    const middleClosed = (middleTip.y - indexPip.y) / handSize;
    const ringClosed = (ringTip.y - indexPip.y) / handSize;
    const pinkyClosed = (pinkyTip.y - indexPip.y) / handSize;
    
    return (
      indexExtension > 0.3 &&
      middleClosed > 0 &&
      ringClosed > 0 &&
      pinkyClosed > 0
    );
  }

  // CORRECTED: Improved posture detection with shoulder–hip alignment and proper angles in degrees
  private computePose(res: PoseResults) {
    const lm = res.poseLandmarks as Landmark[] | undefined;
    if (!lm) return null;

    const Ls = lm[11]; // Left shoulder
    const Rs = lm[12]; // Right shoulder
    const Lh = lm[23]; // Left hip
    const Rh = lm[24]; // Right hip

    if (!minVis([Ls, Rs, Lh, Rh], 0.5)) {
      return {
        gestures: { posture: 'unknown', handGestures: [], engagement: 0.5 }
      };
    }

    const shoulderSlopeDeg = toDeg(Math.atan2(Rs.y - Ls.y, Rs.x - Ls.x));
    const torsoAngleDeg = toDeg(
      Math.atan2(
        ((Lh.y + Rh.y) / 2) - ((Ls.y + Rs.y) / 2),
        ((Lh.x + Rh.x) / 2) - ((Ls.x + Rs.x) / 2)
      )
    );

    // IMPROVED: Hysteresis to prevent flickering between slouching/good_posture
    const prev = this.previousResult?.gestures.posture;
    const slouchThreshold = prev === 'slouching' ? 78 : 82; // 4° dead zone
    
    const posture =
      Math.abs(shoulderSlopeDeg) > 15 ? 'uneven_shoulders' :
      torsoAngleDeg < slouchThreshold ? 'slouching' : 'good_posture';

    return {
      gestures: {
        posture,
        handGestures: [],
        engagement: posture === 'good_posture' ? 0.8 : 0.6
      }
    };
  }

  // CORRECTED: Fuse results with smoothing, dead-zones, and content-based confidence
  private fuseResults(
    face: any,
    hands: any,
    pose: any,
    ts: number
  ): AnalysisResult {
    const out: AnalysisResult = this.previousResult ?? {
      facialExpressions: { smileConfidence: 0, eyeContact: 0, headPose: { yaw: 0, pitch: 0, roll: 0 } },
      gestures: { handGestures: ['neutral'], posture: 'unknown', engagement: 0.6 },
      metrics: { confidence: 0, timestamp: ts }
    };

    // Update with face data if available
    if (face?.facialExpressions) {
      const f = face.facialExpressions;
      out.facialExpressions.smileConfidence = this.smooth('smile', f.smileConfidence);
      
      // Apply dead-zone to eye contact to prevent jitter
      const rawEyeContact = this.smooth('eye', f.eyeContact);
      out.facialExpressions.eyeContact = deadzone(rawEyeContact, 0.03);
      
      out.facialExpressions.headPose = {
        yaw: this.smooth('yaw', f.headPose.yaw),
        pitch: this.smooth('pitch', f.headPose.pitch),
        roll: this.smooth('roll', f.headPose.roll),
      };
    }

    // Update with hand data if available
    if (hands?.gestures) {
      out.gestures.handGestures = hands.gestures.handGestures;
    }

    // Update with pose data if available
    if (pose?.gestures?.posture) {
      out.gestures.posture = pose.gestures.posture;
    }

    // Calculate engagement heuristic from multiple signals
    const eFace = out.facialExpressions.eyeContact;
    const ePosture = out.gestures.posture === 'good_posture' ? 0.8 : 0.6;
    const eHands = (out.gestures.handGestures?.[0] ?? 'neutral') !== 'neutral' ? 0.75 : 0.6;
    const rawEngagement = eFace * 0.5 + ePosture * 0.3 + eHands * 0.2;
    
    // Apply dead-zone to engagement to prevent micro-fluctuations
    out.gestures.engagement = deadzone(this.smooth('eng', rawEngagement), 0.02);

    // SHARPER confidence: reflect actual content quality, not just "model ran"
    // Type-safe checks for optional properties
    const faceOk = !!face && (
      (typeof face.facialExpressions.eyeContact === 'number' && face.facialExpressions.eyeContact > 0.2) || 
      (typeof face.facialExpressions.smileConfidence === 'number' && face.facialExpressions.smileConfidence > 0.2)
    );
    const handsOk = !!hands && hands.gestures.handGestures[0] !== 'neutral';
    const poseOk = !!pose && pose.gestures.posture !== 'unknown';

    const cFace = faceOk ? 0.9 : (face ? 0.6 : 0);
    const cHands = handsOk ? 0.85 : (hands ? 0.6 : 0);
    const cPose = poseOk ? 0.88 : (pose ? 0.6 : 0);
    
    out.metrics.confidence = this.smooth('conf', (cFace + cHands + cPose) / 3);
    out.metrics.timestamp = ts;
    out.metrics.processingLag = performance.now() - ts;

    return out;
  }

  // Cleanup resources
  public dispose() {
    this.stopAnalysis();
    this.resetSmoothing(); // Clear memory on disposal
    
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    // Safely close MediaPipe models (they may not be fully initialized)
    try {
      if (this.faceMesh) {
        this.faceMesh.close();
      }
    } catch (e) {
      console.warn('FaceMesh cleanup warning:', e);
    }
    
    try {
      if (this.hands) {
        this.hands.close();
      }
    } catch (e) {
      console.warn('Hands cleanup warning:', e);
    }
    
    try {
      if (this.pose) {
        this.pose.close();
      }
    } catch (e) {
      console.warn('Pose cleanup warning:', e);
    }
  }
}
