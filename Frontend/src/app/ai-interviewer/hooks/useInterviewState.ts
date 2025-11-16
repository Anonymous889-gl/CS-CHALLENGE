import { useState, useRef } from 'react'
import { Question } from '../../../data/interview-questions'

export type InterviewType = "technical" | "behavioral" | "general"
export type InterviewPhase = "setup" | "permissions" | "interview" | "analyzing" | "results"
export type DifficultyLevel = "easy" | "medium" | "hard"

export interface MediaDevices {
  video: MediaStream | null
  audio: MediaStream | null  // Derived from video stream's audio tracks
}

export function useInterviewState() {
  // Phase and setup state
  const [phase, setPhase] = useState<InterviewPhase>("setup")
  const [selectedType, setSelectedType] = useState<InterviewType>("technical")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium")
  const [duration, setDuration] = useState(10)
  const [ttsVoiceGender, setTtsVoiceGender] = useState<'male' | 'female'>('female')
  
  // Interview progress state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [scores, setScores] = useState<number[]>([])
  const [questionAnalyses, setQuestionAnalyses] = useState<string[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  
  // Media and UI state
  const [mediaDevices, setMediaDevices] = useState<MediaDevices>({ video: null, audio: null })
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [showSpeakNow, setShowSpeakNow] = useState(false)
  
  // Analysis state
  const [transcription, setTranscription] = useState("")
  const [currentScore, setCurrentScore] = useState<number | null>(null)
  const [currentAnalysis, setCurrentAnalysis] = useState("")
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const voiceDetectionRef = useRef<boolean>(false)
  const advancingRef = useRef<boolean>(false) // Prevent double-advance
  const voiceThresholdRef = useRef<number>(25) // Dynamic threshold
  const lastStateChangeRef = useRef<number>(0) // For VAD hysteresis
  const showSpeakNowRef = useRef(false)
  const wasListeningBeforePause = useRef(false)

  // Utility functions
  const getOverallScore = (): number => {
    const validScores = scores.filter(score => score > 0)
    if (validScores.length === 0) return 0
    return Math.round(validScores.reduce((acc, score) => acc + score, 0) / validScores.length)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex)
      } else {
        newSet.add(questionIndex)
      }
      return newSet
    })
  }

  return {
    // State
    phase, setPhase,
    selectedType, setSelectedType,
    difficulty, setDifficulty,
    duration, setDuration,
    ttsVoiceGender, setTtsVoiceGender,
    currentQuestionIndex, setCurrentQuestionIndex,
    questions, setQuestions,
    answers, setAnswers,
    currentAnswer, setCurrentAnswer,
    scores, setScores,
    questionAnalyses, setQuestionAnalyses,
    expandedQuestions, setExpandedQuestions,
    timeLeft, setTimeLeft,
    isTimerRunning, setIsTimerRunning,
    mediaDevices, setMediaDevices,
    permissionsGranted, setPermissionsGranted,
    isRecording, setIsRecording,
    isAnalyzing, setIsAnalyzing,
    isAISpeaking, setIsAISpeaking,
    isPaused, setIsPaused,
    isTranscribing, setIsTranscribing,
    isListening, setIsListening,
    isCalibrating, setIsCalibrating,
    showSpeakNow, setShowSpeakNow,
    transcription, setTranscription,
    currentScore, setCurrentScore,
    currentAnalysis, setCurrentAnalysis,
    
    // Refs
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
    
    // Utility functions
    getOverallScore,
    formatTime,
    toggleQuestionExpansion
  }
}
