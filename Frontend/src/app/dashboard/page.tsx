"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { SkeletonCard, SkeletonStats, SkeletonActivity } from "../../components/skeleton-loader"

interface Activity {
  type: 'interview' | 'resume' | 'job' | 'profile' | 'footprint'
  action: string
  time: string
}

export default function Dashboard() {
  const [greeting, setGreeting] = useState<string>(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  })
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [careerTip, setCareerTip] = useState<string>("")

  // Fetch real user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/login'
          return
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUserData({
            name: data.user.name,
            resumeScore: data.user.resumeScore || 0,
            interviewScore: data.user.interviewScore || 0,
            jobMatches: data.user.jobMatches || 0,
            applications: data.user.applications || 0,
            footprintScore: data.user.footprintScore || 0,
            overallScore: data.user.overallScore || 0,
            completedSteps: data.user.completedSteps || 1,
            totalSteps: 4,
            recentActivity: data.user.recentActivity || [],
            primarySkills: data.user.primarySkills || []
          })
        } else {
          // Token might be invalid, redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Use fallback data for development
        setUserData({
          name: "User",
          resumeScore: 0,
          interviewScore: 0,
          jobMatches: 0,
          applications: 0,
          footprintScore: 0,
          overallScore: 0,
          completedSteps: 1,
          totalSteps: 4,
          recentActivity: [],
          primarySkills: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Animation effects
  useEffect(() => {
    if (!userData) return
    // fetch tip when userData available
    fetchTip(userData.primarySkills || [])

    // Simulate loading time
    const loadTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)
    
    // Use overallScore directly from the database (default 0 if not present)
    const overallScore = userData.overallScore || 0

    // If the score is 0, skip animation to prevent infinite incrementing
    if (overallScore === 0) {
      setAnimatedScore(0)
      return () => {
        clearTimeout(loadTimer)
      }
    }

    // Animate the overall score counter only when score > 0
    let start = 0
    const end = overallScore
    const duration = 2000
    const stepTime = duration / end

    const timer = setInterval(() => {
      start += 1
      setAnimatedScore(start)
      if (start >= end) clearInterval(timer)
    }, stepTime)
    
    return () => {
      clearTimeout(loadTimer)
      clearInterval(timer)
    }
  }, [userData])

  const completionPercentage = userData ? (userData.completedSteps / userData.totalSteps) * 100 : 0

  const fetchTip = async (primarySkills: string[]) => {
    try {
      // Check cache by date
      const today = new Date().toISOString().split('T')[0]
      const cached = localStorage.getItem('careerTip-'+today)
      if (cached) {
        setCareerTip(cached)
        return
      }

      const res = await fetch('/api/career-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: primarySkills })
      })
      const data = await res.json()
      if (data.tip) {
        setCareerTip(data.tip)
        localStorage.setItem('careerTip-'+today, data.tip)
      }
    } catch (e) { console.error('Tip fetch error', e) }
  }

  if (loading || !userData) {
    return (
      <PageTransition>
        <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
          <Header />
          <main className="container mx-auto px-6 py-8 flex-grow">
            <SkeletonStats />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonActivity />
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
        <Header />
        
        <main className="container mx-auto px-6 py-8 flex-grow">
          {/* Hero Welcome Section */}
          <div className={`bg-gradient-to-br from-indigo-600 to-[#0ea5e9] rounded-2xl p-12 mb-12 text-white transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4 font-[Manrope]">
                {greeting}, {userData.name}!
              </h1>
              <p className="text-xl text-white/90 mb-6 font-[Manrope]">
                Your career journey is looking great! You've completed {userData.completedSteps} of {userData.totalSteps} core tools.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold font-[Manrope]">{animatedScore}%</div>
                  <div className="text-sm text-white/80 font-[Manrope]">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-[Manrope]">{userData.jobMatches}</div>
                  <div className="text-sm text-white/80 font-[Manrope]">Job Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold font-[Manrope]">{userData.applications || 0}</div>
                  <div className="text-sm text-white/80 font-[Manrope]">Applications</div>
                </div>
              </div>
            </div>
          </div>

          {/* What would you like to do today? */}
          <div className="mb-12">
            <h2 className={`text-3xl font-bold text-gray-900 mb-2 font-[Manrope] transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              What would you like to do today?
            </h2>
            <p className={`text-gray-600 mb-8 font-[Manrope] transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Choose a tool to continue your career journey
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {!isLoaded ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  {/* Resume Reviewer Card */}
                  <Link href="/resume-reviewer">
                <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group text-center duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <span className="material-symbols-outlined text-blue-600 text-3xl">description</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">Resume Reviewer</h3>
                  <p className="text-gray-600 mb-4 font-[Manrope]">Get AI-powered feedback on your resume</p>
                  <div className="inline-flex items-center text-blue-600 font-medium text-sm font-[Manrope]">
                    Start Review <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* AI Interviewer Card */}
              <Link href="/ai-interviewer">
                <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group text-center duration-700 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <span className="material-symbols-outlined text-purple-600 text-3xl">psychology</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">AI Interviewer</h3>
                  <p className="text-gray-600 mb-4 font-[Manrope]">Practice interviews with AI feedback</p>
                  <div className="inline-flex items-center text-purple-600 font-medium text-sm font-[Manrope]">
                    Start Practice <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Job Matcher Card */}
              <Link href="/job-matcher">
                <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group text-center duration-700 delay-1100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <span className="material-symbols-outlined text-green-600 text-3xl">work</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">Job Matcher</h3>
                  <p className="text-gray-600 mb-4 font-[Manrope]">Find jobs that match your profile</p>
                  <div className="inline-flex items-center text-green-600 font-medium text-sm font-[Manrope]">
                    Browse Jobs <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Digital Footprint Card */}
              <Link href="/settings">
                <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group text-center duration-700 delay-1300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <span className="material-symbols-outlined text-orange-600 text-3xl">fingerprint</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">Digital Footprint</h3>
                  <p className="text-gray-600 mb-4 font-[Manrope]">Link accounts & analyze your footprint</p>
                  <div className="inline-flex items-center text-orange-600 font-medium text-sm font-[Manrope]">
                    Link Accounts <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                  </div>
                </div>
              </Link>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity - Simplified */}
          <div className={`bg-white rounded-xl p-8 shadow-sm border border-gray-200 transition-all duration-700 delay-1500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-[Manrope]">Recent Activity</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {!isLoaded ? (
                <>
                  <SkeletonActivity />
                  <SkeletonActivity />
                  <SkeletonActivity />
                  <SkeletonActivity />
                </>
              ) : (
                userData.recentActivity.map((activity: Activity, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'interview' ? 'bg-purple-100' :
                    activity.type === 'resume' ? 'bg-blue-100' :
                    activity.type === 'job' ? 'bg-green-100' :
                    activity.type === 'profile' ? 'bg-sky-100' :
                    'bg-orange-100'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      activity.type === 'interview' ? 'text-purple-600' :
                      activity.type === 'resume' ? 'text-blue-600' :
                      activity.type === 'job' ? 'text-green-600' :
                      activity.type === 'profile' ? 'text-sky-600' :
                      'text-orange-600'
                    }`}>
                      {activity.type === 'interview' ? 'psychology' :
                       activity.type === 'resume' ? 'description' :
                       activity.type === 'job' ? 'work' :
                       activity.type === 'profile' ? 'person' :
                       'fingerprint'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-[Manrope]">{activity.action}</p>
                    <p className="text-xs text-gray-500 font-[Manrope]">{new Date(activity.time).toLocaleString()}</p>
                  </div>
                </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Tip */}
          {careerTip && (
          <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mt-8 transition-all duration-700 delay-1700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-yellow-600 text-2xl">lightbulb</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 font-[Manrope]">Today's Career Tip</h3>
                <p className="text-gray-700 font-[Manrope]">
                  {careerTip}
                </p>
              </div>
            </div>
          </div>
          )}
          <div className="text-xs text-gray-400">
            <p className="font-[Manrope]"> 2025 UtopiaHire</p>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}