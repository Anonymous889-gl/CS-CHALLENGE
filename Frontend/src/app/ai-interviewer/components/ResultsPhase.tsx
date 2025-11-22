"use client";
import React from 'react'
import { Question } from '../../../data/interview-questions'
import { analyzeCompleteInterview, ComprehensiveAnalysisResult } from '../services/analysis'

type InterviewType = "technical" | "behavioral" | "general"

interface ResultsPhaseProps {
  // Data props
  questions: Question[]
  answers: string[]
  scores: number[]
  questionAnalyses: string[]
  currentAnalysis: string | ComprehensiveAnalysisResult
  expandedQuestions: Set<number>
  selectedType: InterviewType
  difficulty: "easy" | "medium" | "hard"
  isAnalyzing: boolean
  
  // State setters
  setCurrentAnalysis: (analysis: string | ComprehensiveAnalysisResult) => void
  setQuestionAnalyses: (analyses: string[]) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setExpandedQuestions: (expanded: Set<number>) => void
  
  // Utility functions
  toggleQuestionExpansion: (index: number) => void
  formatTime: (seconds: number) => string
  getOverallScore: () => number
}

export default function ResultsPhase({
  questions,
  answers,
  scores,
  questionAnalyses,
  currentAnalysis,
  expandedQuestions,
  selectedType,
  difficulty,
  isAnalyzing,
  setCurrentAnalysis,
  setIsAnalyzing,
  toggleQuestionExpansion,
  getOverallScore
}: ResultsPhaseProps) {
  // Generate comprehensive analysis function
  const generateComprehensiveAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeCompleteInterview(
        questions,
        answers,
        scores,
        selectedType,
        difficulty
      )
      setCurrentAnalysis(analysis)
    } catch (error) {
      console.error('Comprehensive analysis failed:', error)
      setCurrentAnalysis('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  const overallScore = getOverallScore()

  // Get AI analysis or fallback to basic insight
  const getQuestionInsight = (questionIndex: number, score: number, answerLength: number) => {
    // If we have AI feedback, use it
    if (questionAnalyses[questionIndex] && questionAnalyses[questionIndex] !== "") {
      return questionAnalyses[questionIndex]
    }
    
    // Show loading if currently analyzing
    if (isAnalyzing) {
      return `🔍 Multi-dimensional analysis in progress...
      
• Content accuracy & depth
• Communication clarity  
• ${selectedType === 'behavioral' ? 'STAR structure' : selectedType === 'technical' ? 'Problem-solving approach' : 'Motivation & fit'}
• Evidence & specificity`
    }
    
    // Generate realistic fallback feedback based on answer content
    const answer = answers[questionIndex] || ''
    if (answerLength === 0 || answer.trim() === '') {
      return "No response provided for this question."
    }
    
    // Content-based feedback (more specific than generic)
    const hasNumbers = /\d+/.test(answer)
    const hasExamples = /example|experience|project|team/i.test(answer)
    const isShort = answer.split(' ').length < 15
    
    if (score >= 80) {
      return hasNumbers ? "Excellent response with specific metrics." : "Great answer! Next time try adding specific numbers or dates."
    }
    if (score >= 65) {
      return isShort ? "Good start! Try expanding with a specific example next time." : "Good response. Consider adding measurable outcomes."
    }
    if (score >= 45) {
      return hasExamples ? "Try adding specific details like timeline and team size." : "Try: 'I worked on X project for Y months and achieved Z result.'"
    }
    if (score >= 25) {
      return "Consider using the STAR method: Situation, Task, Action, Result."
    }
    return "Try providing a complete example with specific details and outcomes."
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
      <main className="container mx-auto px-6 py-10 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[Manrope]">Interview Complete!</h1>
            <p className="text-gray-600 font-[Manrope]">Here's how you performed</p>
          </div>

          {/* Overall Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600 mb-2 font-[Manrope]">{overallScore}</div>
              <p className="text-gray-600 font-[Manrope] mb-4">Overall Interview Score</p>
              <div className="w-full bg-gray-200 rounded-full h-3 max-w-md mx-auto">
                <div 
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${overallScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-3 font-[Manrope]">
                {overallScore >= 90 ? "Outstanding performance!" : 
                 overallScore >= 80 ? "Great job overall!" :
                 overallScore >= 70 ? "Good effort, room for improvement!" :
                 "Keep practicing, you'll improve!"}
              </p>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-gray-600 text-xl">quiz</span>
              <h3 className="text-xl font-bold text-gray-900 font-[Manrope]">Question Breakdown</h3>
            </div>
            <div className="space-y-3">
              {questions.map((question, index) => {
                const score = scores[index] || 0
                const answer = answers[index] || ''
                const isExpanded = expandedQuestions.has(index)
                
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                            Q{index + 1}
                          </span>
                          {question.category === 'technical' && <span className="text-xs">🔧</span>}
                          {question.category === 'behavioral' && <span className="text-xs">🤝</span>}
                          {question.category === 'general' && <span className="text-xs">💼</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 font-[Manrope] text-sm leading-relaxed">
                            {question.text}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ml-4 ${
                        score >= 80 ? 'bg-green-100 text-green-700' : 
                        score >= 60 ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {score}%
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-2 text-xs text-gray-600 font-[Manrope]">
                        <span className="mt-0.5">📝</span>
                        <div className="whitespace-pre-wrap italic leading-relaxed max-w-md">
                          {getQuestionInsight(index, score, answer.length)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleQuestionExpansion(index)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        <span>{isExpanded ? 'Hide' : 'View'} Answer</span>
                        <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-600">Your Response:</span>
                            <span className="text-xs text-gray-500">
                              {answer.length} characters
                            </span>
                          </div>
                          <div className="text-sm text-gray-800 font-[Manrope] leading-relaxed">
                            {answer || <span className="italic text-gray-500">No response recorded</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Comprehensive AI Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-900 font-[Manrope]">AI Interview Analysis</h3>
                <div className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium font-[Manrope] mt-1">
                  {selectedType === 'technical' && '🔧 Technical Interview'}
                  {selectedType === 'behavioral' && '🤝 Behavioral Interview'}
                  {selectedType === 'general' && '💼 General Interview'}
                </div>
              </div>
              
              {!currentAnalysis && !isAnalyzing && (
                <button
                  onClick={generateComprehensiveAnalysis}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Generate Comprehensive Analysis
                  </span>
                </button>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-[Manrope]">Generating comprehensive analysis...</span>
                </div>
              </div>
            ) : currentAnalysis ? (
              <div className="space-y-8 animate-fade-in">
                {/* Parse structured analysis data */}
                {(() => {
                  // Handle the analysis data - it's already an object from the API
                  const analysisData: ComprehensiveAnalysisResult | null = 
                    typeof currentAnalysis === 'string' 
                      ? null // Old string format (shouldn't happen with new code)
                      : currentAnalysis as ComprehensiveAnalysisResult;

                  if (!analysisData) {
                    // Fallback for string format (legacy)
                    return (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="whitespace-pre-wrap text-gray-700 font-[Manrope] leading-relaxed">
                          {typeof currentAnalysis === 'string' ? currentAnalysis : 'Analysis format error'}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Overall Score Header */}
                      <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 text-center">
                        <div className="inline-flex items-center gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-3xl font-bold text-gray-900">{analysisData.score}</span>
                          </div>
                          <div className="text-left">
                            <h2 className="text-3xl font-bold text-gray-900 font-[Manrope]">Interview Performance</h2>
                            <p className="text-xl font-semibold text-gray-900 font-[Manrope]">{analysisData.verdict}</p>
                          </div>
                        </div>
                        <p className="mt-6 text-lg text-gray-700 font-[Manrope] leading-relaxed">
                          {analysisData.rationale}
                        </p>
                      </div>

                      {/* Three Column Layout */}
                      <div className="flex flex-col gap-6">
                        
                        {/* Strengths */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-4">
                            What You Did Well
                          </h3>
                          <div className="space-y-4">
                            {(analysisData.strengths || []).map((strength: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                                </div>
                                <p className="text-sm text-gray-800 font-[Manrope] leading-relaxed">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Areas for Improvement */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-4">
                            Areas to Improve
                          </h3>
                          <div className="space-y-4">
                            {(analysisData.areas_for_improvement || []).map((area: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                                </div>
                                <p className="text-sm text-gray-800 font-[Manrope] leading-relaxed">{area}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Plan */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-4">
                            Action Plan
                          </h3>
                          <div className="space-y-4">
                            {(analysisData.next_steps || []).map((step: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-purple-600">{idx + 1}</span>
                                </div>
                                <p className="text-sm text-gray-800 font-[Manrope] leading-relaxed">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Motivational Footer */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 text-center">
                        <p className="text-lg font-medium text-gray-800 font-[Manrope]">
                          Focus on these improvement areas while continuing to leverage your strengths. 
                          <br />
                          <span className="text-blue-600">Consistent practice will build confidence and skill!</span>
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 font-[Manrope]">Click "Generate Analysis" to see your comprehensive feedback.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
