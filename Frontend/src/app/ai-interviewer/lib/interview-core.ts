// Core interview business logic
import { ttsService } from '../../../services/tts-service'
import { transcribeWithElevenLabs } from '../services/transcription'
import { calibrateVoiceThreshold } from '../utils/media-utils'

export interface MediaDevices {
  video: MediaStream | null
  audio: MediaStream | null
}

// Enhanced Text-to-Speech with speech indicator
export const speakQuestion = async (
  text: string, 
  isPaused: boolean,
  ttsVoiceGender: 'male' | 'female',
  setIsAISpeaking: (speaking: boolean) => void,
  setShowSpeakNow: (show: boolean) => void,
  showSpeakNowRef: React.MutableRefObject<boolean>,
  setTranscription: (transcription: string) => void
) => {
  if (isPaused) return // Don't speak if paused
  
  try {
    setIsAISpeaking(true)
    console.log('🗣️ AI START SPEAKING:', text.substring(0, 100) + '...')
    
    const voiceOptions = {
      gender: ttsVoiceGender,
      voice: 'professional' as const
    }
    
    await ttsService.speak(text, voiceOptions)
    console.log('🔇 AI FINISHED SPEAKING')
    
    // Only enable user input if not paused
    if (!isPaused) {
      console.log('🟢 AI FINISHED - NOW YOU CAN SPEAK!')
      console.log('🎤 MICROPHONE ACTIVATED FOR USER RESPONSE')
      setShowSpeakNow(true)
      showSpeakNowRef.current = true // Always set the ref
      setTranscription('') // Clear previous transcription
    }
  } catch (error) {
    console.error('❌ TTS Error:', error)
    // Still enable user input even if TTS fails
    if (!isPaused) {
      console.log('🟢 AI FINISHED (ERROR FALLBACK) - NOW YOU CAN SPEAK!')
      console.log('🎤 MICROPHONE ACTIVATED FOR USER RESPONSE')
      setShowSpeakNow(true)
      showSpeakNowRef.current = true // Always set the ref
      setTranscription('') // Clear previous transcription
    }
  } finally {
    // Always clear speaking state, even if interrupted
    setIsAISpeaking(false)
  }
}

// Voice detection and speech-to-text setup
export const setupVoiceDetection = async (
  stream: MediaStream,
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  voiceThresholdRef: React.MutableRefObject<number>,
  setIsCalibrating: (calibrating: boolean) => void,
  setIsTranscribing: (transcribing: boolean) => void,
  setTranscription: (transcription: string | ((prev: string) => string)) => void
) => {
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
    const threshold = await calibrateVoiceThreshold(analyser)
    voiceThresholdRef.current = threshold
    setIsCalibrating(false)
    
    // Setup MediaRecorder for audio chunks - create audio-only stream
    const audioStream = new MediaStream(stream.getAudioTracks())
    
    // ElevenLabs STT API supports: WebM (Opus), MP3, WAV, FLAC, M4A
    // Priority order: WebM/Opus (best compression) > MP4 > WAV > OGG
    const supportedFormats = [
      { mime: 'audio/webm;codecs=opus', extension: 'webm' },
      { mime: 'audio/webm', extension: 'webm' },
      { mime: 'audio/mp4', extension: 'mp4' },
      { mime: 'audio/wav', extension: 'wav' },
      { mime: 'audio/ogg;codecs=opus', extension: 'ogg' }
    ]
    
    let selectedFormat = { mime: 'audio/webm', extension: 'webm' } // Default fallback
    
    for (const format of supportedFormats) {
      if (MediaRecorder.isTypeSupported(format.mime)) {
        selectedFormat = format
        break
      }
    }
    
    console.log('🎙️ Selected audio format:', selectedFormat.mime)
    console.log('📡 Server expects: WebM/Opus, MP3, WAV, FLAC, M4A (ElevenLabs compatible)')
    
    const mediaRecorder = new MediaRecorder(audioStream, { 
      mimeType: selectedFormat.mime,
      bitsPerSecond: 128000 // 128 kbps for good quality
    })
    
    let chunks: Blob[] = []
    const selectedMimeType = selectedFormat.mime // Capture for onstop closure
    const selectedExtension = selectedFormat.extension
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = async () => {
      if (chunks.length > 0) {
        const audioBlob = new Blob(chunks, { type: selectedMimeType })
        setIsTranscribing(true)
        
        try {
          const transcribedText = await transcribeWithElevenLabs(audioBlob, selectedExtension)
          console.log('✅ ElevenLabs transcription result:', transcribedText)
          // Append to existing transcription with deduplication
          setTranscription(prev => {
            if (!prev) return transcribedText
            
            // Remove duplicate sentences/phrases to prevent repetition
            const prevWords = prev.toLowerCase().split(' ')
            const newWords = transcribedText.toLowerCase().split(' ')
            
            // If the new text starts with words already at the end of prev, skip those words
            let skipWords = 0
            for (let i = 0; i < Math.min(10, newWords.length, prevWords.length); i++) {
              if (prevWords[prevWords.length - 1 - i] === newWords[i]) {
                skipWords = i + 1
              }
            }
            
            const uniqueNewText = newWords.slice(skipWords).join(' ')
            return uniqueNewText.trim() ? `${prev} ${uniqueNewText}`.trim() : prev
          })
        } catch (error) {
          console.error('❌ Transcription failed:', error)
        } finally {
          setIsTranscribing(false)
          chunks = [] // Reset chunks
        }
      }
    }
    
    mediaRecorderRef.current = mediaRecorder
    
    // Voice detection will be started by useEffect when phase is 'interview'
    console.log('🚀 Voice detection setup complete - analyser and mediaRecorder refs set!')
    
  } catch (error) {
    console.error('Voice detection setup failed:', error)
    throw error // Re-throw to handle in calling component
  }
}
