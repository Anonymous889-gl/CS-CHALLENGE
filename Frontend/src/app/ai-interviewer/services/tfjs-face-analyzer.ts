import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

type AnalysisResult = {
  facialExpressions: {
    smileConfidence: number;
    eyeContact: number;
    headPose: {
      yaw: number;
      pitch: number;
      roll: number;
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
    processingLag?: number;
  };
};

// EWMA smoother
function makeSmoother(alpha = 0.2) {
  const mem = new Map<string, number>();
  return (key: string, v: number) => {
    const prev = mem.get(key);
    const next = prev == null ? v : prev + alpha * (v - prev);
    mem.set(key, next);
    return next;
  };
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export class TFJSFaceAnalyzer {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private videoElement: HTMLVideoElement;
  private onResultsCallback: (results: AnalysisResult) => void;
  private isAnalyzing = false;
  private rafId: number | null = null;
  private smooth = makeSmoother(0.2);
  private previousResult?: AnalysisResult;
  private lastProcessTime = 0;
  private targetMs = 1000 / 30; // 30 FPS

  constructor(
    videoElement: HTMLVideoElement,
    onResults: (results: AnalysisResult) => void
  ) {
    this.videoElement = videoElement;
    this.onResultsCallback = onResults;
  }

  async initialize() {
    console.log('🔄 Initializing TensorFlow.js Face Detector...');
    
    try {
      // Ensure backend is ready before creating detector
      await tf.ready();
      console.log('✅ TensorFlow.js backend ready:', tf.getBackend());
      
      // Use MediaPipeFaceMesh model (lightweight and accurate)
      this.detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: 'tfjs',
          refineLandmarks: true,
          maxFaces: 1
        }
      );
      
      console.log('✅ TensorFlow.js Face Detector ready');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize face detector:', error);
      return false;
    }
  }

  startAnalysis() {
    if (this.isAnalyzing || !this.detector) return;
    this.isAnalyzing = true;
    console.log('🎬 Starting face analysis loop');

    const loop = async () => {
      if (!this.isAnalyzing) return;

      const now = performance.now();
      const dt = now - this.lastProcessTime;

      if (dt >= this.targetMs && 
          this.videoElement.readyState >= 2 && 
          this.videoElement.videoWidth > 0) {
        
        this.lastProcessTime = now;

        try {
          const faces = await this.detector!.estimateFaces(this.videoElement, {
            flipHorizontal: false
          });

          if (faces && faces.length > 0) {
            const result = this.analyzeFace(faces[0], now);
            this.previousResult = result;
            
            // Sample logging
            if (Math.random() < 0.1) {
              console.log('📊 Face detected:', {
                smile: result.facialExpressions.smileConfidence.toFixed(2),
                eyeContact: result.facialExpressions.eyeContact.toFixed(2),
                engagement: result.gestures.engagement.toFixed(2)
              });
            }
            
            this.onResultsCallback(result);
          }
        } catch (error) {
          console.warn('Frame processing error:', error);
        }
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private analyzeFace(face: any, timestamp: number): AnalysisResult {
    const keypoints = face.keypoints;
    
    // Get key facial landmarks
    const leftEye = this.getKeypointByName(keypoints, 'leftEye') || keypoints[33];
    const rightEye = this.getKeypointByName(keypoints, 'rightEye') || keypoints[263];
    const nose = this.getKeypointByName(keypoints, 'noseTip') || keypoints[1];
    const leftMouth = this.getKeypointByName(keypoints, 'leftMouth') || keypoints[61];
    const rightMouth = this.getKeypointByName(keypoints, 'rightMouth') || keypoints[291];
    const upperLip = keypoints[13];
    const lowerLip = keypoints[14];

    // Calculate smile confidence (mouth width relative to face width)
    const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    const mouthWidth = Math.hypot(rightMouth.x - leftMouth.x, rightMouth.y - leftMouth.y);
    const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
    
    // Smile is detected when mouth corners are wide and slightly open
    const mouthRatio = mouthWidth / (eyeDistance + 0.01);
    const smileRaw = clamp01((mouthRatio - 0.32) * 4);
    const smile = this.smooth('smile', smileRaw);

    // Calculate eye contact (looking at camera = pupils centered)
    // Simple heuristic: if eyes are roughly at same Y level and face is frontal
    const eyeLevelness = 1 - Math.abs(leftEye.y - rightEye.y) / (eyeDistance + 0.01);
    const eyeContactRaw = clamp01(eyeLevelness * 0.8 + 0.2); // Base 0.2 + bonus for level eyes
    const eyeContact = this.smooth('eyeContact', eyeContactRaw);

    // Simple head pose estimation
    const midEyeX = (leftEye.x + rightEye.x) / 2;
    const yaw = ((nose.x - midEyeX) / eyeDistance) * 30; // Rough degree estimation
    const pitch = ((nose.y - leftEye.y) / eyeDistance) * 20;
    const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

    // Engagement combines smile and eye contact
    const engagementRaw = smile * 0.4 + eyeContact * 0.6;
    const engagement = this.smooth('engagement', engagementRaw);

    const result: AnalysisResult = {
      facialExpressions: {
        smileConfidence: smile,
        eyeContact: eyeContact,
        headPose: { yaw, pitch, roll }
      },
      gestures: {
        handGestures: ['neutral'],
        posture: 'good_posture', // Default since we don't have pose detection
        engagement: engagement
      },
      metrics: {
        confidence: 0.85, // High confidence when face is detected
        timestamp: timestamp,
        processingLag: performance.now() - timestamp
      }
    };

    return result;
  }

  private getKeypointByName(keypoints: any[], name: string) {
    return keypoints.find((kp: any) => kp.name === name);
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resetSmoothing() {
    this.smooth = makeSmoother(0.2);
    this.previousResult = undefined;
  }

  dispose() {
    this.stopAnalysis();
    this.resetSmoothing();
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
  }

  getLatest(): AnalysisResult | undefined {
    return this.previousResult;
  }
}
