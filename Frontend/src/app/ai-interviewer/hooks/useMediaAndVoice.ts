import { useCallback } from 'react'
import { MediaDevices } from './useInterviewState'

interface UseMediaAndVoiceProps {
  setMediaDevices: (devices: MediaDevices) => void
  setPermissionsGranted: (granted: boolean) => void
  setPhase: (phase: any) => void
  setIsTimerRunning: (running: boolean) => void
  setIsRecording: (recording: boolean) => void
  setIsCalibrating: (calibrating: boolean) => void
  videoRef: React.RefObject<HTMLVideoElement>
  audioContextRef: React.MutableRefObject<AudioContext | null>
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  voiceThresholdRef: React.MutableRefObject<number>
}

export function useMediaAndVoice({
  setMediaDevices,
  setPermissionsGranted,
  setPhase,
  setIsTimerRunning,
  setIsRecording,
  setIsCalibrating,
  videoRef,
  audioContextRef,
  analyserRef,
  voiceThresholdRef
}: UseMediaAndVoiceProps) {

  // Media permissions handler
  const requestMediaPermissions = useCallback(async (enableCamera: boolean = true) => {
    try {
      console.log('Requesting camera and microphone permissions...')
      
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true },
        video: enableCamera ? { width: 1280, height: 720, facingMode: 'user' } : false
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      const videoStream = enableCamera ? new MediaStream(mediaStream.getVideoTracks()) : null
      
      console.log('Media stream obtained:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks())
      console.log('Audio tracks:', mediaStream.getAudioTracks())

      // Create separate audio-only stream
      const audioStream = new MediaStream(mediaStream.getAudioTracks())
      setMediaDevices({ video: videoStream, audio: audioStream })
      setPermissionsGranted(true)
      
      // Move to interview phase first so video element renders
      setPhase("interview")
      
      // Wait for video element to render, then set source
      const setVideoSource = (attempt = 1) => {
        if (videoStream && videoRef.current) {
          console.log('✅ Video element found, setting source...')
          videoRef.current.srcObject = videoStream
          videoRef.current.muted = true
          videoRef.current.playsInline = true
          
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded')
            console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
            
            videoRef.current?.play()
              .then(() => console.log('✅ Video playing successfully'))
              .catch(err => {
                console.error('❌ Video play failed:', err)
                setTimeout(() => {
                  videoRef.current?.play()
                    .then(() => console.log('✅ Video playing on retry'))
                    .catch(err2 => console.error('❌ Video retry failed:', err2))
                }, 1000)
              })
          }
          
        } else {
          console.warn(`⚠️ Video ref still null (attempt ${attempt}/10), retrying...`)
          if (attempt < 10) {
            setTimeout(() => setVideoSource(attempt + 1), 200)
          } else {
            console.error('❌ Failed to find video element after 10 attempts')
          }
        }
      }
      
      // Start trying to set video source if camera is enabled
      if (videoStream) {
        setTimeout(() => setVideoSource(), 100)
      }
      
      // Start interview and voice detection
      setIsTimerRunning(true)
      setIsRecording(true)
      setupVoiceDetection(mediaStream)
    } catch (error) {
      console.error('Media permissions denied:', error)
      
      let errorMessage = 'Camera and microphone access is required for the interview.'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone access was denied. Please click the camera icon in your browser\'s address bar and allow access.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a camera and microphone.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera or microphone is already in use by another application.'
        }
      }
      
      alert(errorMessage)
    }
  }, [setMediaDevices, setPermissionsGranted, setPhase, setIsTimerRunning, setIsRecording, videoRef])

  // Setup voice detection threshold based on noise floor
  const calibrateVoiceThreshold = async (analyser: AnalyserNode) => {
    console.log('🎚️ Calibrating voice detection threshold...')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const samples: number[] = []
    
    // Collect 1 second of silence samples
    const startTime = Date.now()
    while (Date.now() - startTime < 1000) {
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
      samples.push(average)
      await new Promise(resolve => setTimeout(resolve, 10)) // 10ms intervals
    }
    
    // Calculate noise floor statistics
    const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length
    const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length
    const stdDev = Math.sqrt(variance)
    
    // Set threshold as mean + 2 * standard deviation (catches 95% of voice)
    const calibratedThreshold = Math.max(15, Math.min(50, mean + 2 * stdDev))
    voiceThresholdRef.current = calibratedThreshold
    
    console.log(`🎯 Voice threshold calibrated: ${calibratedThreshold.toFixed(1)} (noise floor: ${mean.toFixed(1)}, std: ${stdDev.toFixed(1)})`)
  }

  // Voice detection and speech-to-text setup
  const setupVoiceDetection = async (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Calibrate threshold before starting detection
      setIsCalibrating(true)
      await calibrateVoiceThreshold(analyser)
      setIsCalibrating(false)
      
      console.log('✅ Voice detection setup completed')
      
    } catch (error) {
      console.error('❌ Voice detection setup failed:', error)
    }
  }

  return {
    requestMediaPermissions,
    calibrateVoiceThreshold,
    setupVoiceDetection
  }
}
