// Interview flow handlers and business logic
import { ttsService } from '../../../services/tts-service'
import { Question, getAdaptiveQuestion } from '../../../data/interview-questions'
import { analyzeIndividualAnswer } from '../services/analysis'
import { stopMedia } from '../utils/media-utils'
import { calculateContentScore } from '../utils/scoring-utils'
import { MediaDevices } from './interview-core'

// Safe next question handler with lock to prevent double-advance
export const createSafeNext = (
  advancingRef: React.MutableRefObject<boolean>,
  handleNextQuestion: () => Promise<void>
) => {
  return async () => {
    if (advancingRef.current) return
    if (advancingRef.current !== null) advancingRef.current = true
    try {
      await handleNextQuestion()
    } finally {
      if (advancingRef.current !== null) advancingRef.current = false
    }
  }
}

// Main question progression handler
export const createHandleNextQuestion = (
  // State getters
  getCurrentTranscription: () => string,
  getCurrentAnswer: () => string,
  getAnswers: () => string[],
  getCurrentQuestionIndex: () => number,
  getQuestions: () => Question[],
  getScores: () => number[],
  getSelectedType: () => "technical" | "behavioral" | "general",
  getDifficulty: () => "easy" | "medium" | "hard",
  getMediaDevices: () => MediaDevices,
  getIsAdaptiveMode: () => boolean,
  getUsedQuestionIds: () => number[],
  getQuestionAnalyses: () => string[],
  
  // State setters
  setAnswers: (answers: string[]) => void,
  setScores: (scores: number[]) => void,
  setCurrentQuestionIndex: (index: number) => void,
  setTranscription: (transcription: string) => void,
  setCurrentAnalysis: (analysis: string) => void,
  setCurrentScore: (score: number | null) => void,
  setShowSpeakNow: (show: boolean) => void,
  setIsAISpeaking: (speaking: boolean) => void,
  setIsTimerRunning: (running: boolean) => void,
  setIsRecording: (recording: boolean) => void,
  setPhase: (phase: string) => void,
  setIsAnalyzing: (analyzing: boolean) => void,
  setQuestions: (questions: Question[]) => void,
  setUsedQuestionIds: (ids: number[]) => void,
  setQuestionAnalyses: (analyses: string[]) => void,
  
  // Refs
  showSpeakNowRef: React.MutableRefObject<boolean>,
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  
  // Functions
  speakQuestion: (text: string) => Promise<void>
) => {
  return async () => {
    const transcription = getCurrentTranscription()
    const currentAnswer = getCurrentAnswer()
    const answers = getAnswers()
    const currentQuestionIndex = getCurrentQuestionIndex()
    const questions = getQuestions()
    const scores = getScores()
    const selectedType = getSelectedType()
    const difficulty = getDifficulty()
    const mediaDevices = getMediaDevices()
    
    // Check if we have any transcribed text
    if (!transcription || transcription.trim() === '') {
      console.warn('⚠️ WARNING: No speech was transcribed for this question!')
      console.log('🔴 This means either:')
      console.log('   1. You clicked Next without speaking')
      console.log('   2. Voice detection failed to trigger')
      console.log('   3. ElevenLabs transcription failed')
    } else {
      console.log('✅ TRANSCRIPTION CAPTURED:', transcription.length, 'characters')
    }
    
    // Save current transcription as answer
    const currentResponse = transcription || currentAnswer
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = currentResponse
    setAnswers(newAnswers)
    
    console.log('📊 Interview Progress:', currentQuestionIndex + 1, 'of', questions.length, 'questions')
    
    // Calculate preliminary score using content analysis
    if (currentResponse && currentResponse.trim()) {
      const preliminaryScore = calculateContentScore(currentResponse.trim())
      const newScores = [...scores]
      newScores[currentQuestionIndex] = preliminaryScore
      setScores(newScores)
      
      console.log(`⚡ Preliminary score assigned: ${preliminaryScore}% (based on content analysis)`)
    } else {
      // Set score to 0 for no response
      const newScores = [...scores]
      newScores[currentQuestionIndex] = 0
      setScores(newScores)
    }

    // Check if adaptive mode AND we need real-time analysis
    const isAdaptiveMode = getIsAdaptiveMode()
    const usedQuestionIds = getUsedQuestionIds()
    const questionAnalyses = getQuestionAnalyses()
    
    if (currentQuestionIndex < questions.length - 1) {
      console.log('➡️ Moving to next question:', currentQuestionIndex + 2)
      
      // Stop any current AI reading immediately
      try {
        await ttsService.stop()
      } finally {
        setIsAISpeaking(false)
      }
      
      // ADAPTIVE MODE: Real-time AI analysis for question just answered
      if (isAdaptiveMode && currentResponse && currentResponse.trim()) {
        console.log('🧠 ADAPTIVE: Analyzing answer in real-time...')
        setIsAnalyzing(true)
        
        try {
          const currentQuestion = questions[currentQuestionIndex]
          const result = await analyzeIndividualAnswer(
            currentQuestion.text,
            currentResponse,
            selectedType,
            difficulty
          )
          
          // Update with real AI score
          const newScores = [...scores]
          newScores[currentQuestionIndex] = result.score
          setScores(newScores)
          
          // Store analysis
          const newAnalyses = [...questionAnalyses]
          newAnalyses[currentQuestionIndex] = result.feedback
          setQuestionAnalyses(newAnalyses)
          
          console.log(`✅ ADAPTIVE: Real score = ${result.score}%`)
          
          // Select next adaptive question based on performance
          if (currentQuestionIndex < 4) { // Still have room for more questions
            const currentDiff = currentQuestion.difficulty
            const nextQuestion = getAdaptiveQuestion(
              selectedType,
              currentDiff,
              result.score,
              usedQuestionIds
            )
            
            if (nextQuestion) {
              console.log(`🎯 ADAPTIVE: Next question difficulty adjusted to ${nextQuestion.difficulty}`)
              
              // Add new question to array
              const updatedQuestions = [...questions]
              updatedQuestions[currentQuestionIndex + 1] = nextQuestion
              setQuestions(updatedQuestions)
              
              // Track used question
              setUsedQuestionIds([...usedQuestionIds, nextQuestion.id])
            }
          }
          
        } catch (error) {
          console.error('❌ ADAPTIVE: Real-time analysis failed:', error)
        } finally {
          setIsAnalyzing(false)
        }
      }
      
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setTranscription("")
      setCurrentAnalysis("") // Clear previous analysis
      setCurrentScore(null) // Clear previous score
      setShowSpeakNow(false)
      showSpeakNowRef.current = false // Also update ref
      
      // Speak the next question
      setTimeout(async () => {
        console.log(`🗣️ Speaking question ${currentQuestionIndex + 2}...`)
        await speakQuestion(questions[currentQuestionIndex + 1]?.text || "")
      }, 1000)
    } else {
      // Interview completed - immediately transition to analyzing phase
      console.log('🏁 Interview completed! Moving to analysis...')
      
      // Stop everything immediately
      try {
        await ttsService.stop()
      } finally {
        setIsAISpeaking(false)
      }
      setIsTimerRunning(false)
      setIsRecording(false)
      
      // Stop all media tracks properly
      stopMedia(mediaDevices, audioContextRef)
      
      // Immediate transition to analyzing phase
      setPhase('analyzing')
      
      // Background analysis (non-blocking)
      setTimeout(async () => {
        try {
          console.log('📊 Starting comprehensive AI analysis in background...')
          
          // Set analyzing state once for the entire batch to avoid flicker
          setIsAnalyzing(true)
          
          // Snapshot answers and questions to avoid mutations during async processing
          const answersSnapshot = [...newAnswers]
          const questionsSnapshot = [...questions]
          
          // Analyze all questions including final one
          const allAnalyses = await Promise.all(
            answersSnapshot.map(async (answer, index) => {
              if (!answer.trim()) {
                return { score: 0, feedback: 'No response provided for this question.' }
              }
              
              const question = questionsSnapshot[index]
              try {
                const result = await analyzeIndividualAnswer(question.text, answer, selectedType, difficulty)
                return result
              } catch (error) {
                console.error(`Analysis failed for question ${index}:`, error)
                return { score: 0, feedback: 'Analysis failed for this question.' }
              }
            })
          )
          
          // Update scores with AI results
          const aiScores = allAnalyses.map(analysis => analysis.score)
          setScores(aiScores)
          
          console.log('✅ All individual analyses completed')
          console.log('📊 Final AI Scores:', aiScores)
          
          // Move to results
          setPhase('results')
          
        } catch (error) {
          console.error('❌ Background analysis failed:', error)
          // Still move to results even if analysis fails
          setPhase('results')
        } finally {
          setIsAnalyzing(false)
        }
      }, 1000)
    }
  }
}

// Toggle pause functionality
export const createTogglePause = (
  isPaused: boolean,
  wasListeningBeforePause: React.MutableRefObject<boolean>,
  showSpeakNowRef: React.MutableRefObject<boolean>,
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>,
  
  setIsPaused: (paused: boolean) => void,
  setIsTimerRunning: (running: boolean) => void,
  setIsRecording: (recording: boolean) => void,
  setShowSpeakNow: (show: boolean) => void,
  setIsAISpeaking: (speaking: boolean) => void
) => {
  return () => {
    if (isPaused) {
      // Resume everything
      console.log('▶️ Resuming interview...')
      setIsPaused(false)
      setIsTimerRunning(true)
      setIsRecording(true)
      
      // Re-arm voice detection if it was active before pausing
      if (wasListeningBeforePause.current) {
        setShowSpeakNow(true)
        showSpeakNowRef.current = true
      }
    } else {
      // Pause everything but stay in interview
      console.log('⏸️ Pausing interview...')
      
      // Remember if user was able to speak before pausing
      wasListeningBeforePause.current = showSpeakNowRef.current || false
      
      setIsPaused(true)
      setIsTimerRunning(false)
      
      // Stop active MediaRecorder immediately to prevent chunk buffering
      if (mediaRecorderRef.current?.state === 'recording') {
        try { 
          mediaRecorderRef.current.stop() 
        } catch (e) {
          console.warn('MediaRecorder stop during pause ignored:', e)
        }
      }
      
      // Stop TTS voice
      ttsService.stop()
      
      setIsRecording(false)
      setIsAISpeaking(false)
      setShowSpeakNow(false)
      showSpeakNowRef.current = false
    }
  }
}

// Request media permissions
export const createRequestMediaPermissions = (
  setMediaDevices: (devices: MediaDevices) => void,
  setPermissionsGranted: (granted: boolean) => void,
  setPhase: (phase: string) => void,
  setIsTimerRunning: (running: boolean) => void,
  setIsRecording: (recording: boolean) => void,
  setupVoiceDetection: (stream: MediaStream) => Promise<void>,
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
) => {
  return async () => {
    try {
      console.log('Requesting camera and microphone permissions...')
      
      const videoStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true }
      })
      
      console.log('Media stream obtained:', videoStream)
      console.log('Video tracks:', videoStream.getVideoTracks())
      console.log('Audio tracks:', videoStream.getAudioTracks())
      // Store video stream and create separate audio stream
      const audioStream = new MediaStream(videoStream.getAudioTracks())
      setMediaDevices({ video: videoStream, audio: audioStream })
      setPermissionsGranted(true)
      
      // Move to interview phase first so video element renders
      setPhase("interview")
      
      // Wait for video element to render, then set source
      const setVideoSource = (attempt = 1) => {
        if (videoRef.current) {
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
      
      // Start trying to set video source
      setTimeout(() => setVideoSource(), 100)
      
      // Start interview and voice detection
      setIsTimerRunning(true)
      setIsRecording(true)
      await setupVoiceDetection(videoStream)
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
  }
}
