import React from 'react'
import { getQuestionsByType } from '../../../data/interview-questions'
import { CustomSelect } from '../../../components/ui/custom-select'

type InterviewType = "technical" | "behavioral" | "general"
type DifficultyLevel = "easy" | "medium" | "hard"

interface SetupPhaseProps {
  selectedType: InterviewType
  setSelectedType: (type: InterviewType) => void
  difficulty: DifficultyLevel
  setDifficulty: (difficulty: DifficultyLevel) => void
  duration: number
  setDuration: (duration: number) => void
  ttsVoiceGender: 'male' | 'female'
  setTtsVoiceGender: (gender: 'male' | 'female') => void
  isAdaptiveMode: boolean
  setIsAdaptiveMode: (adaptive: boolean) => void
  startInterview: () => void
}

export default function SetupPhase({
  selectedType,
  setSelectedType,
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  ttsVoiceGender,
  setTtsVoiceGender,
  isAdaptiveMode,
  setIsAdaptiveMode,
  startInterview
}: SetupPhaseProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
      <main className="container mx-auto px-6 py-10 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-[Manrope]">AI Interview Practice</h1>
            <p className="text-gray-600 font-[Manrope]">Sharpen your interview skills with AI-powered mock interviews</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Setup Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[Manrope]">Interview Setup</h2>
              
              <div className="space-y-6">
                {/* Interview Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-[Manrope]">Interview Type</label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setSelectedType("technical")}
                      className={`group p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                        selectedType === "technical" 
                          ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                          : "border-gray-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          selectedType === "technical" 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        }`}>
                          <span className="material-symbols-outlined">code</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 font-[Manrope]">Technical Interview</p>
                          <p className="text-sm text-gray-600 font-[Manrope]">Programming, algorithms, system design</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedType("behavioral")}
                      className={`group p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                        selectedType === "behavioral" 
                          ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                          : "border-gray-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          selectedType === "behavioral" 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        }`}>
                          <span className="material-symbols-outlined">psychology</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 font-[Manrope]">Behavioral Interview</p>
                          <p className="text-sm text-gray-600 font-[Manrope]">Teamwork, leadership, problem-solving</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedType("general")}
                      className={`group p-4 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                        selectedType === "general" 
                          ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                          : "border-gray-200 hover:border-indigo-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                          selectedType === "general" 
                            ? "bg-indigo-600 text-white" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                        }`}>
                          <span className="material-symbols-outlined">chat</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 font-[Manrope]">General Interview</p>
                          <p className="text-sm text-gray-600 font-[Manrope]">Common questions, career goals</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Interview Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-[Manrope]">Interview Mode</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsAdaptiveMode(false)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        !isAdaptiveMode 
                          ? "border-indigo-600 bg-indigo-600/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-600">quiz</span>
                        <div>
                          <p className="font-semibold text-gray-900 font-[Manrope]">Standard Interview</p>
                          <p className="text-sm text-gray-600 font-[Manrope]">Fixed difficulty level throughout</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setIsAdaptiveMode(true)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isAdaptiveMode 
                          ? "border-indigo-600 bg-indigo-600/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-600">psychology</span>
                        <div>
                          <p className="font-semibold text-gray-900 font-[Manrope]">Adaptive Interview</p>
                          <p className="text-sm text-gray-600 font-[Manrope]">AI adjusts difficulty based on your performance</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Difficulty (only show for Standard mode) */}
                {!isAdaptiveMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 font-[Manrope]">Difficulty Level</label>
                    <div className="flex gap-2">
                      {(["easy", "medium", "hard"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-[Manrope] ${
                            difficulty === level
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label htmlFor="interview-duration" className="block text-sm font-medium text-gray-700 mb-3 font-[Manrope]">Duration</label>
                  <CustomSelect
                    value={duration.toString()}
                    onChange={(value) => setDuration(Number(value))}
                    options={[
                      { value: "5", label: "5 minutes (Quick)" },
                      { value: "10", label: "10 minutes (Standard)" },
                      { value: "15", label: "15 minutes (Comprehensive)" }
                    ]}
                    className="h-10"
                  />
                </div>

                {/* AI Voice Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-[Manrope]">AI Interviewer Voice</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTtsVoiceGender('female')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-[Manrope] ${
                        ttsVoiceGender === 'female'
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Female
                    </button>
                    <button
                      onClick={() => setTtsVoiceGender('male')}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-[Manrope] ${
                        ttsVoiceGender === 'male'
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Male
                    </button>
                  </div>
                </div>


                <button
                  onClick={startInterview}
                  className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] font-[Manrope]"
                >
                  Start AI Interview
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 font-[Manrope]">What to Expect</h2>
              
              {/* Question Preview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                {isAdaptiveMode ? (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-2 font-[Manrope]">Sample {selectedType} question (adapts to your performance):</p>
                    <p className="text-sm text-gray-900 font-[Manrope] italic">
                      "{getQuestionsByType(selectedType, 'medium')[0]?.text || 'Loading...'}"
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-[Manrope]">
                      <span className="font-semibold">Adaptive:</span> Questions get harder if you perform well, easier if you struggle
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 mb-2 font-[Manrope]">Sample {selectedType} question ({difficulty}):</p>
                    <p className="text-sm text-gray-900 font-[Manrope] italic">
                      "{getQuestionsByType(selectedType, difficulty)[0]?.text || 'Loading...'}"
                    </p>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-800 font-[Manrope] leading-relaxed">
                        <span className="font-semibold">Tip:</span> {getQuestionsByType(selectedType, difficulty)[0]?.tips || ''}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-[Manrope]">
                      {duration === 5 ? '3' : duration === 10 ? '5' : '7'} Voice Questions
                    </p>
                    <p className="text-sm text-gray-600 font-[Manrope]">AI interviewer asks questions using natural speech</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-[Manrope]">Video Analysis</p>
                    <p className="text-sm text-gray-600 font-[Manrope]">Real-time body language and speech analysis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-[Manrope]">Live Metrics</p>
                    <p className="text-sm text-gray-600 font-[Manrope]">See confidence, posture, and eye contact scores live</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-[Manrope]">Comprehensive Analysis</p>
                    <p className="text-sm text-gray-600 font-[Manrope]">Detailed report on communication and body language</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                
                <div className="p-4 bg-indigo-600/5 rounded-lg border border-indigo-600/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-indigo-600 text-sm">lightbulb</span>
                    <p className="font-semibold text-indigo-600 text-sm font-[Manrope]">Pro Tip</p>
                  </div>
                  <p className="text-sm text-gray-700 font-[Manrope]">
                    Make sure you're in a well-lit room and speak clearly. The AI analyzes your voice, posture, and facial expressions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
