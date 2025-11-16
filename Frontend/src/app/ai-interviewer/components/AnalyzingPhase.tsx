import React, { useEffect } from 'react'
import { Question } from '../../../data/interview-questions'
import { analyzeCompleteInterview, analyzeIndividualQuestions, ComprehensiveAnalysisResult } from '../services/analysis'

type InterviewType = "technical" | "behavioral" | "general"

interface AnalyzingPhaseProps {
  selectedType: InterviewType
  difficulty: "easy" | "medium" | "hard"
  questions: Question[]
  answers: string[]
  scores: number[]
  setCurrentAnalysis: (analysis: string | ComprehensiveAnalysisResult) => void
  setQuestionAnalyses: (analyses: string[]) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setPhase: (phase: string) => void
}

export default function AnalyzingPhase({
  selectedType,
  difficulty,
  questions,
  answers,
  scores,
  setCurrentAnalysis,
  setQuestionAnalyses,
  setIsAnalyzing,
  setPhase
}: AnalyzingPhaseProps) {
  // Start analysis when component mounts
  useEffect(() => {
    const runAnalysis = async () => {
      setIsAnalyzing(true)

      try {
        // Run both individual question analysis and comprehensive analysis
        const [questionAnalyses, comprehensiveAnalysis] = await Promise.all([
          analyzeIndividualQuestions(questions, answers, selectedType),
          analyzeCompleteInterview(questions, answers, scores, selectedType, difficulty)
        ])

        setQuestionAnalyses(questionAnalyses)
        setCurrentAnalysis(comprehensiveAnalysis)

        // Save interview score to database
        try {
          const token = localStorage.getItem('authToken')
          if (token && comprehensiveAnalysis.score) {
            const interviewScore = Math.round(comprehensiveAnalysis.score * 10) // Convert from /10 to /100 scale
            
            await fetch('http://localhost:5000/api/profile/update-metrics', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({
                interviewScore: interviewScore,
                interviewType: selectedType,
                difficulty: difficulty,
                questionsAnswered: answers.filter(a => a.trim().length > 0).length,
                totalQuestions: questions.length
              })
            })
            
            console.log(`✅ Interview score ${interviewScore} saved to database`)
          }
        } catch (saveError) {
          console.warn('Failed to save interview score:', saveError)
          // Don't fail the entire process if saving fails
        }

        // Move to results after analysis is complete
        setTimeout(() => {
          setPhase('results')
        }, 2000)

      } catch (error) {
        console.error('Analysis failed:', error)
        // Still move to results even if analysis fails
        setTimeout(() => {
          setPhase('results')
        }, 1000)
      } finally {
        setIsAnalyzing(false)
      }
    }

    runAnalysis()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
      <main className="container mx-auto px-6 py-10 flex-grow flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            
            {/* Analysis Animation */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {/* Outer pulse ring */}
                <div className="absolute inset-0 w-24 h-24 bg-indigo-600/20 rounded-full animate-ping"></div>
                {/* Middle pulse ring */}
                <div className="absolute inset-2 w-20 h-20 bg-indigo-600/30 rounded-full animate-pulse"></div>
                {/* Inner background */}
                <div className="absolute inset-4 w-16 h-16 bg-gradient-to-br from-indigo-600/40 to-indigo-600/20 rounded-full"></div>
                {/* Brain icon with smooth rotation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600 text-4xl animate-pulse" style={{
                    animation: 'pulse 2s ease-in-out infinite alternate'
                  }}>psychology</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[Manrope]">
              Analyzing Your Performance
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 mb-8 font-[Manrope] text-lg">
              Our AI is evaluating your responses and providing detailed feedback. 
              This may take 30-60 seconds to ensure comprehensive analysis.
            </p>

            {/* Analysis Progress Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-indigo-600/5 rounded-lg">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-gray-700 font-[Manrope]">Processing your {questions.length} responses</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-[Manrope]">Generating individual question scores</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-gray-500 font-[Manrope]">Creating comprehensive performance analysis</span>
              </div>
            </div>

            {/* Tip */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-[Manrope]">
                💡 <strong>Tip:</strong> Your results will include specific examples and actionable advice to improve your interview skills.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
