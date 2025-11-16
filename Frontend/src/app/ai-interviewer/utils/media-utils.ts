// Media and voice detection utilities

export interface MediaDevices {
  video: MediaStream | null
  audio: MediaStream | null
}

// Setup voice detection threshold based on noise floor
export const calibrateVoiceThreshold = async (analyser: AnalyserNode): Promise<number> => {
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
  
  console.log(`🎯 Voice threshold calibrated: ${calibratedThreshold.toFixed(1)} (noise floor: ${mean.toFixed(1)}, std: ${stdDev.toFixed(1)})`)
  return calibratedThreshold
}

// Voice activity detection
export const detectVoiceActivity = (
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  isPaused: boolean,
  isAISpeaking: boolean,
  showSpeakNowRef: React.MutableRefObject<boolean>,
  voiceDetectionRef: React.MutableRefObject<boolean>,
  voiceThresholdRef: React.MutableRefObject<number>,
  lastStateChangeRef: React.MutableRefObject<number>,
  setIsListening: (listening: boolean) => void
) => {
  const analyser = analyserRef.current
  const mediaRecorder = mediaRecorderRef.current
  
  // Only listen for voice when user's turn AND not paused - use refs to avoid closure issues
  if (!analyser || !mediaRecorder || isPaused || isAISpeaking || !showSpeakNowRef.current) {
    return // Don't schedule - let useEffect handle timing
  }
  
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)
  
  // Calculate average volume
  const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
  const threshold = voiceThresholdRef.current || 25 // Use calibrated threshold
  
  // Only log audio levels occasionally when actively monitoring
  if (Math.random() < 0.05) { // 5% of the time to reduce spam
    console.log('🔍 MONITORING: Audio level =', Math.round(average), '| Threshold =', Math.round(threshold), '| Speaking =', (average > threshold))
  }
  
  const isCurrentlySpeaking = average > threshold
  
  // VAD hysteresis to reduce false starts and rapid toggling
  const MIN_SPEAK_MS = 200
  const MIN_SILENCE_MS = 400
  const now = performance.now()
  
  if (isCurrentlySpeaking && !voiceDetectionRef.current && showSpeakNowRef.current && 
      now - (lastStateChangeRef.current || 0) > MIN_SILENCE_MS) {
    // User started speaking - check MediaRecorder state first
    if (mediaRecorder.state === 'inactive') {
      try {
        console.log('\n🎤 VOICE DETECTION: User started speaking')
        console.log('📊 Audio level:', Math.round(average), '(threshold:', threshold + ')')
        console.log('⏺️ Starting audio recording...')
        voiceDetectionRef.current = true
        setIsListening(true)
        lastStateChangeRef.current = now // Update timestamp
        
        // Guard against multiple start() calls
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start()
        }
      } catch (error) {
        console.error('❌ MediaRecorder start failed:', error)
        // Reset state if recording fails
        voiceDetectionRef.current = false
        setIsListening(false)
      }
    } else {
      console.warn('⚠️ MediaRecorder already active, state:', mediaRecorder.state)
    }
  } else if (!isCurrentlySpeaking && voiceDetectionRef.current && 
             now - (lastStateChangeRef.current || 0) > MIN_SPEAK_MS) {
    // User stopped speaking - check MediaRecorder state
    if (mediaRecorder.state === 'recording') {
      try {
        console.log('\n🔇 VOICE DETECTION: User stopped speaking')
        console.log('📊 Audio level dropped to:', Math.round(average), '(threshold:', threshold + ')')
        console.log('⏹️ Stopping recording and sending to ElevenLabs...')
        voiceDetectionRef.current = false
        setIsListening(false)
        lastStateChangeRef.current = now // Update timestamp
        // Keep voice detection active - user might want to add more to their answer
        if (mediaRecorder.state === 'recording') {
          try {
            mediaRecorder.stop()
          } catch (e) {
            console.warn('MediaRecorder stop() ignored:', e)
          }
        }
      } catch (error) {
        console.error('❌ MediaRecorder stop failed:', error)
        // Reset state if stopping fails
        voiceDetectionRef.current = false
        setIsListening(false)
      }
    } else {
      console.warn('⚠️ MediaRecorder not recording, state:', mediaRecorder.state)
      voiceDetectionRef.current = false
      setIsListening(false)
    }
  }
}

// Enhanced media cleanup function
export const stopMedia = (mediaDevices: MediaDevices, audioContextRef: React.MutableRefObject<AudioContext | null>) => {
  // Stop all video tracks
  if (mediaDevices.video) {
    mediaDevices.video.getTracks().forEach(track => {
      track.stop()
      console.log('🔇 Stopped video track:', track.kind)
    })
  }
  
  // Stop all audio tracks (might be separate from video)
  if (mediaDevices.audio && mediaDevices.audio !== mediaDevices.video) {
    mediaDevices.audio.getTracks().forEach(track => {
      track.stop()
      console.log('🔇 Stopped audio track:', track.kind)
    })
  }
  
  // Close AudioContext properly
  if (audioContextRef.current) {
    audioContextRef.current.close().catch((error) => {
      console.warn('⚠️ Error closing AudioContext:', error)
    })
    audioContextRef.current = null
  }
  
  console.log('✅ Media cleanup completed')
}
