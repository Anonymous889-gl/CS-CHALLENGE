import React, { useEffect, useRef, useCallback, useState } from 'react'
import { Question } from '../../../data/interview-questions'
import { ttsService } from '../../../services/tts-service'
import { speakQuestion, setupVoiceDetection, MediaDevices } from '../lib/interview-core'
import { createHandleNextQuestion, createTogglePause } from '../lib/interview-handlers'
import { TFJSFaceAnalyzer } from '../services/tfjs-face-analyzer'
import { ComprehensiveAnalysisResult } from '../services/analysis'

type InterviewType = "technical" | "behavioral" | "general"

interface InterviewPhaseProps {
  // Props for interview state
  currentQuestionIndex: number
  questions: Question[]
  setQuestions: (questions: Question[]) => void
  transcription: string
  setTranscription: (transcription: string | ((prev: string) => string)) => void
  currentScore: number | null
  setCurrentScore: (score: number | null) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  isAISpeaking: boolean
  setIsAISpeaking: (speaking: boolean) => void
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  isTranscribing: boolean
  setIsTranscribing: (transcribing: boolean) => void
  showSpeakNow: boolean
  setShowSpeakNow: (show: boolean) => void
  isListening: boolean
  setIsListening: (listening: boolean) => void
  isCalibrating: boolean
  setIsCalibrating: (calibrating: boolean) => void
  timeLeft: number
  setTimeLeft: (time: number | ((prev: number) => number)) => void
  isTimerRunning: boolean
  setIsTimerRunning: (running: boolean) => void
  selectedType: InterviewType
  difficulty: "easy" | "medium" | "hard"
  currentAnalysis: string | ComprehensiveAnalysisResult
  setCurrentAnalysis: (analysis: string | ComprehensiveAnalysisResult) => void
  answers: string[]
  setAnswers: (answers: string[]) => void
  scores: number[]
  setScores: (scores: number[]) => void
  mediaDevices: MediaDevices
  setMediaDevices: (devices: MediaDevices) => void
  ttsVoiceGender: 'male' | 'female'
  setCurrentQuestionIndex: (index: number) => void
  setPhase: (phase: string) => void
  isAdaptiveMode: boolean
  usedQuestionIds: number[]
  setUsedQuestionIds: (ids: number[]) => void
  questionAnalyses: string[]
  setQuestionAnalyses: (analyses: string[]) => void
  
  // Refs
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>
  audioContextRef: React.MutableRefObject<AudioContext | null>
  analyserRef: React.MutableRefObject<AnalyserNode | null>
  voiceDetectionRef: React.MutableRefObject<boolean>
  advancingRef: React.MutableRefObject<boolean>
  voiceThresholdRef: React.MutableRefObject<number>
  lastStateChangeRef: React.MutableRefObject<number>
  showSpeakNowRef: React.MutableRefObject<boolean>
  wasListeningBeforePause: React.MutableRefObject<boolean>
  
  // Event handlers
  handleNext: () => void
  handlePause: () => void
  handleResume: () => void
  finishInterview: () => void
  
  // Utility functions
  formatTime: (seconds: number) => string
  getOverallScore: () => number
}

export default function InterviewPhase({
  currentQuestionIndex,
  questions,
  setQuestions,
  transcription,
  setTranscription,
  currentScore,
  setCurrentScore,
  isRecording,
  setIsRecording,
  isAnalyzing,
  setIsAnalyzing,
  isAISpeaking,
  setIsAISpeaking,
  isPaused,
  setIsPaused,
  isTranscribing,
  setIsTranscribing,
  showSpeakNow,
  setShowSpeakNow,
  isListening,
  setIsListening,
  isCalibrating,
  setIsCalibrating,
  timeLeft,
  setTimeLeft,
  isTimerRunning,
  setIsTimerRunning,
  selectedType,
  difficulty,
  currentAnalysis,
  setCurrentAnalysis,
  answers,
  setAnswers,
  scores,
  setScores,
  mediaDevices,
  setMediaDevices,
  ttsVoiceGender,
  setCurrentQuestionIndex,
  setPhase,
  isAdaptiveMode,
  usedQuestionIds,
  setUsedQuestionIds,
  questionAnalyses,
  setQuestionAnalyses,
  videoRef,
  canvasRef,
  mediaRecorderRef,
  audioContextRef,
  analyserRef,
  voiceDetectionRef,
  advancingRef,
  voiceThresholdRef,
  lastStateChangeRef,
  showSpeakNowRef,
  wasListeningBeforePause,
  handleNext,
  handlePause,
  handleResume,
  finishInterview,
  formatTime,
  getOverallScore
}: InterviewPhaseProps) {
  // Track if first question has been spoken to prevent double reading
  const firstQuestionSpokenRef = useRef(false)
  // Track if we've logged that voice detection is active
  const voiceDetectionActiveLoggedRef = useRef(false)
  
  // TensorFlow.js Face Analyzer for real-time analysis
  const faceAnalyzerRef = useRef<TFJSFaceAnalyzer | null>(null)
  const [mediaPipeResults, setMediaPipeResults] = useState<{
    smileConfidence: number;
    eyeContact: number;
    posture: string;
    handGestures: string[];
    engagement: number;
  }>({
    smileConfidence: 0,
    eyeContact: 0,
    posture: 'neutral',
    handGestures: [],
    engagement: 0
  })
  
  const currentQuestion = questions[currentQuestionIndex]
  // Defensive progress calculation
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Create handlers with all the necessary dependencies
  const handleNextQuestion = createHandleNextQuestion(
    // State getters
    () => transcription,
    () => '',
    () => answers,
    () => currentQuestionIndex,
    () => questions,
    () => scores,
    () => selectedType,
    () => difficulty,
    () => mediaDevices,
    () => isAdaptiveMode,
    () => usedQuestionIds,
    () => questionAnalyses,
    
    // State setters
    setAnswers,
    setScores,
    setCurrentQuestionIndex,
    setTranscription,
    setCurrentAnalysis,
    setCurrentScore,
    setShowSpeakNow,
    setIsAISpeaking,
    setIsTimerRunning,
    setIsRecording,
    setPhase,
    setIsAnalyzing,
    setQuestions,
    setUsedQuestionIds,
    setQuestionAnalyses,
    
    // Refs
    showSpeakNowRef,
    audioContextRef,
    
    // Functions
    async (text: string) => {
      await speakQuestion(
        text,
        isPaused,
        ttsVoiceGender,
        setIsAISpeaking,
        setShowSpeakNow,
        showSpeakNowRef,
        setTranscription
      )
    }
  )

  const togglePause = createTogglePause(
    isPaused,
    wasListeningBeforePause,
    showSpeakNowRef,
    mediaRecorderRef,
    setIsPaused,
    setIsTimerRunning,
    setIsRecording,
    setShowSpeakNow,
    setIsAISpeaking
  )

  const finishResponse = async () => {
    await handleNextQuestion()
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time: number) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      handleNextQuestion() // Auto-advance when time runs out
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timeLeft])

  // Voice activity detection - using useCallback to access latest state
  const detectVoiceActivity = useCallback(() => {
    const analyser = analyserRef.current
    const mediaRecorder = mediaRecorderRef.current
    
    // Only listen for voice when user's turn AND not paused - use refs to avoid closure issues
    if (!analyser || !mediaRecorder || isPaused || isAISpeaking || !showSpeakNowRef.current) {
      return // Don't schedule - let useEffect handle timing
    }
    
    // If we get here, voice detection should be active (log once)
    if (!voiceDetectionActiveLoggedRef.current) {
      console.log('✅✅✅ Voice detection is NOW ACTIVE and monitoring audio levels!')
      voiceDetectionActiveLoggedRef.current = true
    }
    
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
    const threshold = voiceThresholdRef.current // Use calibrated threshold
    
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
        now - lastStateChangeRef.current > MIN_SILENCE_MS) {
      // User started speaking - check MediaRecorder state first
      if (mediaRecorder.state === 'inactive') {
        try {
          console.log('\n🎤 VOICE DETECTION: User started speaking')
          console.log('📊 Audio level:', Math.round(average), '(threshold:', threshold + ')')
          console.log('⏺️ Starting audio recording...')
          voiceDetectionRef.current = true
          setIsListening(true)
          lastStateChangeRef.current = now
          
          // Guard against multiple start() calls
          if (mediaRecorder.state === 'inactive') {
            mediaRecorder.start()
          }
        } catch (error) {
          console.error('❌ MediaRecorder start failed:', error)
          voiceDetectionRef.current = false
          setIsListening(false)
        }
      } else {
        console.warn('⚠️ MediaRecorder already active, state:', mediaRecorder.state)
      }
    } else if (!isCurrentlySpeaking && voiceDetectionRef.current && 
               now - lastStateChangeRef.current > MIN_SPEAK_MS) {
      // User stopped speaking - check MediaRecorder state
      if (mediaRecorder.state === 'recording') {
        try {
          console.log('\n🔇 VOICE DETECTION: User stopped speaking')
          console.log('📊 Audio level dropped to:', Math.round(average), '(threshold:', threshold + ')')
          console.log('⏹️ Stopping recording and sending to ElevenLabs...')
          voiceDetectionRef.current = false
          setIsListening(false)
          lastStateChangeRef.current = now
          
          if (mediaRecorder.state === 'recording') {
            try {
              mediaRecorder.stop()
            } catch (e) {
              console.warn('MediaRecorder stop() ignored:', e)
            }
          }
        } catch (error) {
          console.error('❌ MediaRecorder stop failed:', error)
          voiceDetectionRef.current = false
          setIsListening(false)
        }
      } else {
        console.warn('⚠️ MediaRecorder not recording, state:', mediaRecorder.state)
        voiceDetectionRef.current = false
        setIsListening(false)
      }
    }
  }, [isPaused, isAISpeaking, showSpeakNow, transcription]) // Dependencies that affect voice detection

  // Voice detection loop management with cleanup
  useEffect(() => {
    if (!isRecording) return

    let cancelled = false
    let timeoutId: NodeJS.Timeout

    const runDetection = () => {
      if (cancelled) return
      detectVoiceActivity()
      timeoutId = setTimeout(runDetection, 100)
    }

    console.log('🎤 Starting managed voice detection loop')
    runDetection()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      console.log('🔇 Voice detection loop cleaned up')
    }
  }, [isRecording, isPaused, isAISpeaking, detectVoiceActivity])

  // Speak first question when interview starts - FIXED: Guard with ref to prevent double reading
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex === 0 && !firstQuestionSpokenRef.current) {
      console.log('🎯 Starting first question TTS...')
      firstQuestionSpokenRef.current = true // Mark as spoken immediately
      setTimeout(async () => {
        await speakQuestion(
          questions[0].text,
          isPaused,
          ttsVoiceGender,
          setIsAISpeaking,
          setShowSpeakNow,
          showSpeakNowRef,
          setTranscription
        )
      }, 2000)
    }
    
    // Reset voice detection active log for new questions
    voiceDetectionActiveLoggedRef.current = false
  }, [questions, currentQuestionIndex])

  // Voice detection is now set up in the main page's requestMediaPermissions
  // This prevents duplicate setup calls

  // Initialize TensorFlow.js Face Analyzer for real-time facial analysis
  useEffect(() => {
    if (!videoRef.current || !mediaDevices.video) {
      console.log('⚠️ Face analyzer init skipped - video not ready yet')
      return
    }

    const video = videoRef.current
    
    // Wait for video to be fully loaded before initializing MediaPipe
    const waitForVideo = async () => {
      let attempts = 0
      while (video.readyState < 2 && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      if (video.readyState < 2) {
        console.error('❌ Video failed to load after 5 seconds')
        return false
      }
      
      console.log('✅ Video ready:', {
        readyState: video.readyState,
        width: video.videoWidth,
        height: video.videoHeight
      })
      return true
    }

    console.log('🎥 Initializing TensorFlow.js Face Analyzer...')
    
    const initAnalyzer = async () => {
      const videoReady = await waitForVideo()
      if (!videoReady) return
      
      try {
        const analyzer = new TFJSFaceAnalyzer(
          video,
          (results: any) => {
            // Update state with face analysis results
            setMediaPipeResults({
              smileConfidence: results.facialExpressions.smileConfidence,
              eyeContact: results.facialExpressions.eyeContact,
              posture: results.gestures.posture,
              handGestures: results.gestures.handGestures,
              engagement: results.gestures.engagement
            })
          }
        )
        
        // Initialize the TensorFlow.js models
        const initialized = await analyzer.initialize()
        
        if (initialized) {
          faceAnalyzerRef.current = analyzer
          
          // Start analysis immediately after initialization
          setTimeout(() => {
            if (faceAnalyzerRef.current) {
              faceAnalyzerRef.current.startAnalysis()
              console.log('✅ Face analysis started - monitoring smile and eye contact')
            }
          }, 500)
        } else {
          console.error('❌ Failed to initialize face analyzer')
        }
        
      } catch (error) {
        console.error('❌ Failed to initialize face analyzer:', error)
        console.warn('⚠️ Continuing without real-time facial analysis')
        // Set default values so UI doesn't break
        setMediaPipeResults({
          smileConfidence: 0.5,
          eyeContact: 0.5,
          posture: 'good_posture',
          handGestures: ['neutral'],
          engagement: 0.6
        })
      }
    }
    
    initAnalyzer()

    // Cleanup on unmount
    return () => {
      if (faceAnalyzerRef.current) {
        console.log('🛑 Stopping face analysis')
        faceAnalyzerRef.current.dispose()
        faceAnalyzerRef.current = null
      }
    }
  }, [mediaDevices.video]) // Re-initialize if video stream changes

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
      <main className="container mx-auto px-6 py-10 flex-grow">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 font-[Manrope]">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-700 font-[Manrope]">
                Time Left: {formatTime(timeLeft)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Screen Reader Status Announcements */}
          <div aria-live="polite" className="sr-only">
            {isCalibrating ? 'Calibrating microphone, please stay quiet' : 
             isAISpeaking ? 'AI is speaking' : 
             showSpeakNow ? 'Your turn to speak' : 
             isTranscribing ? 'Transcribing your response' : ''}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-indigo-600">videocam</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 font-[Manrope]">Video Interview</p>
                      <p className="text-sm text-gray-600 font-[Manrope]">Speak your answer naturally</p>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center gap-2">
                    {isCalibrating && (
                      <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium font-[Manrope]">Calibrating mic... please stay quiet</span>
                      </div>
                    )}
                    {isAISpeaking && (
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium font-[Manrope]">AI Speaking</span>
                      </div>
                    )}
                    {showSpeakNow && !isPaused && (
                      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm animate-pulse">mic</span>
                        <span className="text-sm font-medium font-[Manrope]">Your Turn - Start Speaking</span>
                      </div>
                    )}
                    {isListening && (
                      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium font-[Manrope]">Listening...</span>
                      </div>
                    )}
                    {isRecording && !isPaused && !isAISpeaking && (
                      <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium font-[Manrope]">Recording</span>
                      </div>
                    )}
                    {isPaused && (
                      <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm">pause</span>
                        <span className="text-sm font-medium font-[Manrope]">Paused</span>
                      </div>
                    )}
                    {isTranscribing && (
                      <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium font-[Manrope]">Transcribing...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                    style={{ transform: 'scaleX(-1)' }}
                    className="w-full h-96 object-cover"
                    onError={(e) => console.error('Video element error:', e)}
                    onLoadStart={() => console.log('🎥 Video loading started')}
                    onCanPlay={() => console.log('✅ Video can play')}
                  />
                  
                  {/* Debug info - remove in production */}
                  {/* Debug info - remove in production */}
                  {!mediaDevices?.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">videocam_off</span>
                        <p className="text-sm">No video stream</p>
                      </div>
                    </div>
                  )}
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ display: 'none' }}
                  />
                  
                  {/* Speaking Indicator */}
                  {isListening && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-sm">mic</span>
                      <span className="text-sm font-[Manrope]">Speaking</span>
                    </div>
                  )}
                </div>
                
                {/* Current Question Display */}
                <div className="bg-indigo-600/5 p-4 rounded-lg border border-indigo-600/20 relative">
                  
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-indigo-600 font-semibold font-[Manrope]">
                      {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} • {currentQuestion?.difficulty?.charAt(0).toUpperCase() + currentQuestion?.difficulty?.slice(1)}
                    </p>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 font-[Manrope]">
                    {currentQuestion?.text}
                  </h2>
                  <p className="text-sm text-gray-700 font-[Manrope]">
                    💡 {currentQuestion?.tips}
                  </p>
                  
                </div>
                
                {/* Transcribed Response Display */}
                {transcription && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-600 text-lg mt-0.5">mic</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-700 font-[Manrope] mb-2">Your Response:</p>
                        <p className="text-sm text-gray-800 font-[Manrope] bg-white p-3 rounded border italic">
                          "{transcription}"
                        </p>
                        <p className="text-xs text-blue-600 font-[Manrope] mt-2">✅ Transcription complete - You can continue speaking to add more</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Simple Controls */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={togglePause}
                    className="flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 px-6 py-3 rounded-lg transition-colors font-medium font-[Manrope]"
                  >
                    <span className="material-symbols-outlined text-sm">{isPaused ? 'play_arrow' : 'pause'}</span>
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  
                  <button
                    onClick={finishResponse}
                    disabled={isAISpeaking || isTranscribing}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium font-[Manrope] flex-grow transition-all ${
                      isAISpeaking || isTranscribing 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                        : 'bg-indigo-600 text-white hover:opacity-90'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    {isAISpeaking ? 'AI Speaking...' : isTranscribing ? 'Transcribing...' : 'Next'}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time MediaPipe Analysis Panel */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-fit">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">psychology</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 font-[Manrope] text-sm">Live Analysis</h3>
                </div>
                {faceAnalyzerRef.current ? (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 font-[Manrope]">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 font-[Manrope]">Initializing...</span>
                  </div>
                )}
              </div>
              
              {/* Facial Expressions */}
              <div className="space-y-3 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 font-[Manrope]">Smile</span>
                    <span className="text-xs font-bold text-green-600">{Math.round(mediaPipeResults.smileConfidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${mediaPipeResults.smileConfidence * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 font-[Manrope]">Eye Contact</span>
                    <span className="text-xs font-bold text-blue-600">{Math.round(mediaPipeResults.eyeContact * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${mediaPipeResults.eyeContact * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 font-[Manrope]">Engagement</span>
                    <span className="text-xs font-bold text-purple-600">{Math.round(mediaPipeResults.engagement * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${mediaPipeResults.engagement * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Posture & Gestures */}
              <div className="space-y-2 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700 font-[Manrope]">Posture</span>
                  <span className={`text-xs font-bold ${
                    mediaPipeResults.posture === 'good_posture' ? 'text-green-600' :
                    mediaPipeResults.posture === 'slouching' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {mediaPipeResults.posture === 'good_posture' ? 'Good' :
                     mediaPipeResults.posture === 'slouching' ? 'Slouching' :
                     mediaPipeResults.posture === 'uneven_shoulders' ? 'Uneven' :
                     'Neutral'}
                  </span>
                </div>

                {mediaPipeResults.handGestures.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 font-[Manrope]">Gestures</span>
                    <span className="text-xs text-gray-600 font-[Manrope]">
                      {mediaPipeResults.handGestures.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="mt-4 p-2 bg-gradient-to-r from-indigo-600/10 to-blue-50 rounded-lg border border-indigo-600/20">
                <p className="text-xs text-gray-700 font-[Manrope] text-center">
                  💡 Maintain eye contact & smile naturally
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
