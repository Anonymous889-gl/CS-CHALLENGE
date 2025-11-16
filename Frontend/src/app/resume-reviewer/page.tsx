"use client"

import { useState } from "react"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { useToast, ToastContainer } from "../../components/toast"

interface ResumeAnalysis {
  overallScore: number
  strengths: string[]
  improvements: string[]
  sections: Array<{
    title: string
    content: string
    score: number
    feedback: string[]
  }>
  atsCompatibility: number
  suggestions: Array<{
    type: string
    before: string
    after: string
    explanation: string
  }>
}

export default function ResumeReviewer() {
  const { success, error, warning, toasts, removeToast } = useToast()
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error("File Too Large", "Please upload a file smaller than 10MB")
        return
      }
      
      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        error("Invalid File Type", "Please upload a PDF file")
        return
      }
      
      setUploadedFile(file)
      success("File Ready", `${file.name} is ready for analysis`)
      
      // Reset previous analysis
      setAnalysis(null)
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      warning("No File", "Please upload a resume first")
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 500)

      console.log('🔄 Starting resume analysis...')
      
      const formData = new FormData()
      formData.append('resume', uploadedFile)

      // Get auth token for saving score to database
      const token = localStorage.getItem('authToken')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/resume-analysis', {
        method: 'POST',
        headers: headers,
        body: formData
      })

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (!response.ok) {
        let errorMessage = `Analysis failed (${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, it's likely an HTML error page
          errorMessage = `Server error (${response.status}). Please refresh and try again.`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysis(result.analysis)
        success("Analysis Complete", "Your resume has been analyzed successfully!")
        console.log('Analysis result:', result.analysis)
        console.log('Strengths count:', result.analysis.strengths?.length || 0)
        console.log('Improvements count:', result.analysis.improvements?.length || 0)
      } else {
        throw new Error(result.error || 'Unknown error occurred')
      }

    } catch (err) {
      console.error('❌ Resume analysis error:', err)
      error("Analysis Failed", err instanceof Error ? err.message : "Please try again")
      setAnalysisProgress(0)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const CircularProgress = ({ percentage = 75 }: { percentage?: number }) => {
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative h-24 w-24">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-indigo-600 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{percentage}</span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Upload */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 font-[Manrope]">
                  Upload Your Resume
                </h2>
                <p className="mt-2 text-gray-600 font-[Manrope]">
                  Drag and drop your resume or browse to upload. We support PDF and DOC formats.
                </p>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer hover:border-indigo-600 transition-colors bg-gray-50">
                <span className="material-symbols-outlined text-5xl text-gray-400">
                  upload_file
                </span>
                <p className="mt-4 font-bold text-gray-900 font-[Manrope]">
                  Drag & drop your resume here
                </p>
                <p className="mt-1 text-sm text-gray-500 font-[Manrope]">or</p>
                <label className="mt-4 bg-white border border-gray-300 text-gray-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer font-[Manrope]">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* File Status */}
              {uploadedFile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600">description</span>
                    <div>
                      <p className="font-medium text-green-800 font-[Manrope]">{uploadedFile.name}</p>
                      <p className="text-sm text-green-600 font-[Manrope]">
                        {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Ready for analysis
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-[Manrope]">
                    <span className="text-gray-600">Analyzing resume...</span>
                    <span className="text-indigo-600">{Math.round(analysisProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!uploadedFile || isAnalyzing}
                className="w-full bg-indigo-600 text-white font-bold text-base px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-[Manrope]"
              >
                <span className="material-symbols-outlined">
                  {isAnalyzing ? "hourglass_empty" : "psychology"}
                </span>
                <span>{isAnalyzing ? "Analyzing..." : "Analyze Resume"}</span>
              </button>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 font-[Manrope]">
                  AI Analysis Results
                </h2>
                <p className="mt-2 text-gray-600 font-[Manrope]">
                  {analysis ? "Here's your comprehensive resume analysis." : "Upload a resume to see detailed AI-powered insights."}
                </p>
              </div>

              {analysis ? (
                <>
                  {/* Results Card */}
                  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl space-y-6 border border-gray-200 shadow-sm">
                    {/* Resume Score */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 font-[Manrope]">
                          Overall Score
                        </h3>
                        <p className="text-sm text-gray-600 font-[Manrope] mt-1">
                          AI-powered resume evaluation
                        </p>
                      </div>
                      <CircularProgress percentage={analysis.overallScore} />
                    </div>

                    {/* ATS Compatibility */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <h4 className="font-semibold text-gray-900 font-[Manrope]">ATS Compatibility</h4>
                        <p className="text-xs text-gray-500 font-[Manrope]">Applicant Tracking System readiness</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600 font-[Manrope]">{analysis.atsCompatibility}%</div>
                        <div className="text-xs text-gray-500 font-[Manrope]">
                          {analysis.atsCompatibility >= 80 ? 'Excellent' : analysis.atsCompatibility >= 60 ? 'Good' : 'Needs Work'}
                        </div>
                      </div>
                    </div>

                    {/* Section Evaluation */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h4 className="text-md font-bold text-gray-900 font-[Manrope]">
                        Section Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {analysis.sections.map((section, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                            <span className={`material-symbols-outlined ${
                              section.score >= 80 ? 'text-green-500' : 
                              section.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {section.score >= 80 ? 'check_circle' : 
                               section.score >= 60 ? 'warning' : 'error'}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-sm font-[Manrope]">{section.title}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 font-[Manrope]">{section.score}%</p>
                                <div className="flex-1 bg-gray-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full ${
                                      section.score >= 80 ? 'bg-green-500' : 
                                      section.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${section.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900 font-[Manrope]">
                        Strengths
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.strengths.map((strength, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                            <p className="text-sm text-gray-700 font-[Manrope] leading-relaxed">{strength}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-900 font-[Manrope]">
                        Areas for Improvement
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {analysis.improvements.map((improvement, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            </div>
                            <p className="text-sm text-gray-700 font-[Manrope] leading-relaxed">{improvement}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specific Suggestions */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-gray-900 font-[Manrope]">
                          Specific Suggestions
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {analysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="bg-white p-5 rounded-lg border-l-4 border-indigo-600 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-800 font-[Manrope] mb-2">
                                  {suggestion.explanation}
                                </p>
                                <div className="space-y-2">
                                  <p className="text-sm text-gray-600 font-[Manrope]">
                                    <span className="font-semibold text-red-600">Before:</span> {suggestion.before}
                                  </p>
                                  <p className="text-sm text-green-600 font-[Manrope]">
                                    <span className="font-semibold text-green-700">After:</span> {suggestion.after}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button 
                    onClick={() => {
                      // TODO: Generate PDF report
                      success("Report Generated", "Your analysis report is ready!")
                    }}
                    className="w-full bg-indigo-600 text-white font-bold text-base px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-[Manrope]"
                  >
                    <span className="material-symbols-outlined">download</span>
                    <span>Download Detailed Analysis Report (PDF)</span>
                  </button>
                </>
              ) : (
                // Empty state
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-gray-400 text-4xl">psychology</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-2">Ready for AI Analysis</h3>
                  <p className="text-gray-600 font-[Manrope] mb-6 max-w-md">
                    Upload your resume to get comprehensive insights powered by advanced AI algorithms.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">check</span>
                      <span className="font-[Manrope]">ATS Compatibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">check</span>
                      <span className="font-[Manrope]">Content Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">check</span>
                      <span className="font-[Manrope]">Skill Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-indigo-600">check</span>
                      <span className="font-[Manrope]">Industry Insights</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 text-indigo-600">
                  <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-[Manrope]">
                  © 2024 UtopiaHire. All rights reserved.
                </p>
              </div>
              <nav className="flex gap-6 items-center">
                <a className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-[Manrope]" href="#">
                  Help Center
                </a>
                <a className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-[Manrope]" href="#">
                  Privacy Policy
                </a>
                <a className="text-sm text-gray-500 hover:text-indigo-600 transition-colors font-[Manrope]" href="#">
                  Terms of Service
                </a>
              </nav>
            </div>
          </div>
        </footer>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </PageTransition>
  )
}
