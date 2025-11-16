"use client"

import React, { useState, useEffect, useRef } from "react"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { ttsService } from "../../services/tts-service"
import { 
  getStructuredQuestions, 
  getAnchoredQuestions,
  getSeededShuffledQuestions,
  getStratifiedQuestions,
  getWeightedQuestions,
  getAdaptiveQuestion, 
  type Question 
} from "../../data/interview-questions"
import { ComprehensiveAnalysisResult } from "./services/analysis"
import { formatTime, getOverallScore } from "./utils/scoring-utils"
import { MediaDevices, setupVoiceDetection } from "./lib/interview-core"

// Import split components
import SetupPhase from "./components/SetupPhase"
import PermissionsPhase from "./components/PermissionsPhase"
import dynamic from 'next/dynamic'

// Dynamically load heavy interview modules (splits the JS bundle and speeds up first paint)
const InterviewPhaseComponent = dynamic(() => import('./components/InterviewPhase'), {
  ssr: false,
  loading: () => (<div className="flex justify-center items-center py-20 text-gray-500">Loading interview module...</div>)
})
const AnalyzingPhase = dynamic(() => import('./components/AnalyzingPhase'), {
  ssr: false,
  loading: () => (<div className="flex justify-center items-center py-20 text-gray-500">Analyzing...</div>)
})
const ResultsPhase = dynamic(() => import('./components/ResultsPhase'), {
  ssr: false,
  loading: () => (<div className="flex justify-center items-center py-20 text-gray-500">Loading results...</div>)
})

type InterviewType = "technical" | "behavioral" | "general"
type InterviewPhase = "setup" | "permissions" | "interview" | "analyzing" | "results"
type DifficultyLevel = "easy" | "medium" | "hard"

export default function AIInterviewer() {
  // Phase and core state
  const [phase, setPhase] = useState<InterviewPhase>("setup")
  const [selectedType, setSelectedType] = useState<InterviewType>("technical")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium")
  const [duration, setDuration] = useState(10)
  // New: allow disabling camera
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [isAdaptiveMode, setIsAdaptiveMode] = useState(false) // NEW: Adaptive mode toggle
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]) // NEW: Track used questions for adaptive
  const [answers, setAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [transcription, setTranscription] = useState("")
  const [currentAnalysis, setCurrentAnalysis] = useState<string | ComprehensiveAnalysisResult>("")
  const [questionAnalyses, setQuestionAnalyses] = useState<string[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  
  // Media and UI state
  const [mediaDevices, setMediaDevices] = useState<MediaDevices>({ video: null, audio: null })
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [currentScore, setCurrentScore] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showSpeakNow, setShowSpeakNow] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [ttsVoiceGender, setTtsVoiceGender] = useState<'male' | 'female'>('female')
  
  // Refs for interview functionality
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const voiceDetectionRef = useRef<boolean>(false)
  const advancingRef = useRef<boolean>(false)
  const voiceThresholdRef = useRef<number>(25)
  const lastStateChangeRef = useRef<number>(0)
  const showSpeakNowRef = useRef<boolean>(false)
  const wasListeningBeforePause = useRef<boolean>(false)

  // Start interview function
  const startInterview = () => {
    // Scale question count based on duration (safer timing)
    const questionCount = duration === 5 ? 3 : duration === 10 ? 5 : 7 // 5min=3q, 10min=5q, 15min=7q
    const seed = Date.now() // Unique seed per session
    
    let selectedQuestions: Question[]
    
    if (isAdaptiveMode) {
      // Adaptive mode: Start with weighted sampling (bias toward medium)
      console.log('🎯 Adaptive Mode: Weighted sampling starting at medium, will adapt based on performance')
      
      // Start with 1 question using weighted sampling (favors medium difficulty)
      selectedQuestions = getWeightedQuestions(
        selectedType,
        1,
        seed,
        { easy: 1, medium: 3, hard: 1.5 }, // Bias toward medium
        []
      )
      
      // Track first question ID
      setUsedQuestionIds(selectedQuestions.map(q => q.id))
    } else {
      // Standard mode: Choose shuffle strategy based on context
      if (duration >= 15) {
        // Long sessions (15+ minutes): Weighted sampling with controlled difficulty mix
        console.log('🎯 Standard Mode: Weighted sampling (balanced mix, max 2 hard questions)')
        selectedQuestions = getWeightedQuestions(
          selectedType,
          questionCount,
          seed,
          { easy: 2, medium: 4, hard: 1 }, // Bias toward medium, limit hard questions
          []
        )
      } else if (duration >= 10) {
        // Medium sessions (10-14 minutes): Anchored questions (structured flow)
        console.log('🎯 Standard Mode: Anchored questions (structured flow)')
        selectedQuestions = getAnchoredQuestions(selectedType, difficulty, questionCount, seed, [])
      } else {
        // Short sessions (5-9 minutes): Seeded shuffle (reproducible, consistent difficulty)
        console.log('🎯 Standard Mode: Seeded shuffle (short session)')
        selectedQuestions = getSeededShuffledQuestions(selectedType, difficulty, questionCount, seed, [])
      }
    }
    
    console.log('🎯 Interview setup:')
    console.log('Mode:', isAdaptiveMode ? 'ADAPTIVE (Weighted)' : `STANDARD (${duration >= 15 ? 'Weighted' : duration >= 10 ? 'Anchored' : 'Seeded'})`)
    console.log('Duration:', duration, 'minutes')
    console.log('Questions:', selectedQuestions.length)
    console.log('Seed:', seed)
    
    if (selectedQuestions.length === 0) {
      alert('No questions available for the selected criteria. Please try different settings.')
      return
    }
    
    setQuestions(selectedQuestions)
    setAnswers(new Array(questionCount).fill("")) // Reserve space for 5 answers
    setScores(new Array(questionCount).fill(0))
    setQuestionAnalyses(new Array(questionCount).fill(""))
    setCurrentQuestionIndex(0)
    const totalTimeInSeconds = duration * 60
    setTimeLeft(totalTimeInSeconds)
    
    // Move to permissions phase
    setPhase("permissions")
    console.log('✅ Moved to permissions phase')
  }
  
  // Media permissions handler
  const requestMediaPermissions = async () => {
    try {
      console.log('Requesting camera and microphone permissions...')
      
      const constraints: MediaStreamConstraints = {
        audio: { echoCancellation: true, noiseSuppression: true },
        video: cameraEnabled ? { width: 1280, height: 720, facingMode: 'user' } : false
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      console.log('Media stream obtained:', mediaStream)
      console.log('Video tracks:', mediaStream.getVideoTracks())
      console.log('Audio tracks:', mediaStream.getAudioTracks())
      // Create separate streams
      const videoStream = cameraEnabled ? new MediaStream(mediaStream.getVideoTracks()) : null
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
      
      // Setup voice detection for the stream
      await setupVoiceDetection(
        mediaStream,
        audioContextRef,
        analyserRef,
        mediaRecorderRef,
        voiceThresholdRef,
        setIsCalibrating,
        setIsTranscribing,
        setTranscription
      )
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

  // Safe next question handler
  const safeNext = async () => {
    if (advancingRef.current) return
    advancingRef.current = true
    try {
      // This would normally call handleNextQuestion, but that's now in the component
      console.log('Safe next called')
    } finally {
      advancingRef.current = false
    }
  }

  // Toggle question expansion
  const toggleQuestionExpansion = (questionIndex: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex)
    } else {
      newExpanded.add(questionIndex)
    }
    setExpandedQuestions(newExpanded)
  }

  // Get overall score from array of scores
  const getOverallScoreValue = () => {
    return getOverallScore(scores)
  }

  // Simple handler functions for component props
  const handlePause = () => {
    console.log('Handle pause called')
  }

  const handleResume = () => {
    console.log('Handle resume called')
  }

  const finishInterview = () => {
    // Finish interview and move to results
    setPhase('results')
  }

  // Format time helper
  const formatTimeValue = (seconds: number) => {
    return formatTime(seconds)
  }

  // Wrapper for setPhase to match expected signature
  const setPhaseString = (phase: string) => {
    setPhase(phase as InterviewPhase)
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      try { 
        ttsService.stop().catch(() => {}) 
      } catch {}
      
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      // Stop all media tracks
      if (mediaDevices.video) {
        mediaDevices.video.getTracks().forEach(track => {
          try { track.stop() } catch {}
        })
      }
      if (mediaDevices.audio && mediaDevices.audio !== mediaDevices.video) {
        mediaDevices.audio.getTracks().forEach(track => {
          try { track.stop() } catch {}
        })
      }
      
      // Cleanup audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close().catch(() => {})
        } catch {}
      }
    }
  }, [])

  // Main render with split components
  switch (phase) {
    case 'setup':
      return (
        <PageTransition>
          <Header />
          <SetupPhase
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            duration={duration}
            setDuration={setDuration}
            ttsVoiceGender={ttsVoiceGender}
            setTtsVoiceGender={setTtsVoiceGender}
            isAdaptiveMode={isAdaptiveMode}
            setIsAdaptiveMode={setIsAdaptiveMode}
            startInterview={startInterview}
          />
        </PageTransition>
      )

    case 'permissions':
      return (
        <PageTransition>
          <Header />
          <PermissionsPhase requestMediaPermissions={requestMediaPermissions} cameraEnabled={cameraEnabled} setCameraEnabled={setCameraEnabled} />
        </PageTransition>
      )
      
    case 'interview':
      return (
        <PageTransition>
          <Header />
          <InterviewPhaseComponent
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            setQuestions={setQuestions}
            transcription={transcription}
            setTranscription={setTranscription}
            currentScore={currentScore}
            setCurrentScore={setCurrentScore}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
            isAISpeaking={isAISpeaking}
            setIsAISpeaking={setIsAISpeaking}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            isTranscribing={isTranscribing}
            setIsTranscribing={setIsTranscribing}
            showSpeakNow={showSpeakNow}
            setShowSpeakNow={setShowSpeakNow}
            isListening={isListening}
            setIsListening={setIsListening}
            isCalibrating={isCalibrating}
            setIsCalibrating={setIsCalibrating}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            selectedType={selectedType}
            difficulty={difficulty}
            currentAnalysis={currentAnalysis}
            setCurrentAnalysis={setCurrentAnalysis}
            answers={answers}
            setAnswers={setAnswers}
            scores={scores}
            setScores={setScores}
            mediaDevices={mediaDevices}
            setMediaDevices={setMediaDevices}
            ttsVoiceGender={ttsVoiceGender}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setPhase={setPhaseString}
            isAdaptiveMode={isAdaptiveMode}
            usedQuestionIds={usedQuestionIds}
            setUsedQuestionIds={setUsedQuestionIds}
            questionAnalyses={questionAnalyses}
            setQuestionAnalyses={setQuestionAnalyses}
            videoRef={videoRef}
            canvasRef={canvasRef}
            mediaRecorderRef={mediaRecorderRef}
            audioContextRef={audioContextRef}
            analyserRef={analyserRef}
            voiceDetectionRef={voiceDetectionRef}
            advancingRef={advancingRef}
            voiceThresholdRef={voiceThresholdRef}
            lastStateChangeRef={lastStateChangeRef}
            showSpeakNowRef={showSpeakNowRef}
            wasListeningBeforePause={wasListeningBeforePause}
            handleNext={safeNext}
            handlePause={handlePause}
            handleResume={handleResume}
            finishInterview={finishInterview}
            formatTime={formatTimeValue}
            getOverallScore={getOverallScoreValue}
          />
        </PageTransition>
      )
      
    case 'analyzing':
      return (
        <PageTransition>
          <Header />
          <AnalyzingPhase 
            selectedType={selectedType}
            difficulty={difficulty}
            questions={questions}
            answers={answers}
            scores={scores}
            setCurrentAnalysis={setCurrentAnalysis}
            setQuestionAnalyses={setQuestionAnalyses}
            setIsAnalyzing={setIsAnalyzing}
            setPhase={setPhaseString}
          />
        </PageTransition>
      )
      
    case 'results':
      return (
        <PageTransition>
          <Header />
          <ResultsPhase
            questions={questions}
            answers={answers}
            scores={scores}
            questionAnalyses={questionAnalyses}
            currentAnalysis={currentAnalysis}
            expandedQuestions={expandedQuestions}
            selectedType={selectedType}
            difficulty={difficulty}
            isAnalyzing={isAnalyzing}
            setCurrentAnalysis={setCurrentAnalysis}
            setQuestionAnalyses={setQuestionAnalyses}
            setIsAnalyzing={setIsAnalyzing}
            setExpandedQuestions={setExpandedQuestions}
            toggleQuestionExpansion={toggleQuestionExpansion}
            formatTime={formatTimeValue}
            getOverallScore={getOverallScoreValue}
          />
        </PageTransition>
      )
      
    default:
      return null
  }
}