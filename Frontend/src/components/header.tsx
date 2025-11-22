"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import AvatarDropdown from "./avatar-dropdown"
import logo from '@/assets/logo.png';   


export default function Header() {
  const pathname = usePathname()
  const [isReady, setIsReady] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInitial, setUserInitial] = useState("U")
  const [credits, setCredits] = useState<number | null>(null)
  useEffect(() => {
    const handler = (e: any) => setCredits(e.detail)
    window.addEventListener('credits-update', handler)
    return () => window.removeEventListener('credits-update', handler)
  }, [])

  useEffect(() => {
    setIsReady(true)
    // Check if user is logged in and get user data
    const token = localStorage.getItem('authToken')
    setIsLoggedIn(!!token)
    
    if (token) {
      // Fetch user data for initial
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        if (data.user?.name) {
          setUserInitial(data.user.name.charAt(0).toUpperCase())
        }
        if (typeof data.user?.creditsBalance !== 'undefined') {
          setCredits(data.user.creditsBalance)
        }
      })
      .catch(error => console.error('Error fetching user data:', error))
    }
  }, [])

  // Different header styles for different page types
  const isAuthPage = pathname === "/login" || pathname === "/sign-up"
  const isCompleteProfile = pathname === "/complete-profile"
  const isProfilePage = pathname === "/profile"
  const isDashboard = pathname === "/dashboard"
  const isResumeReviewer = pathname === "/resume-reviewer"
  const isJobMatcher = pathname === "/job-matcher"
  const isAIInterviewer = pathname === "/ai-interviewer"
  const isSavedJobs = pathname === "/saved-jobs"
  const isSettings = pathname === "/settings"
  const isHowItWorks = pathname === "/how-it-works"
  const isFeaturesPage = pathname === "/features"
  const isPricingPage = pathname === "/pricing"

  return (
    <header className="w-full border-b border-gray-200 bg-white relative z-40">
      <div className="w-full px-4">
        <div className="flex items-center h-14 w-full">
          {/* Logo - Left side - Fixed width to match right side */}
          <div className="flex-shrink-0 pr-4">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image
                src={logo}
                alt="UtopiaHire Logo"
                height={160}
                width={700}
                className="h-40 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          {isReady && !isAuthPage && !isCompleteProfile && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-8 h-8 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}

          {/* Spacer to push content to edges */}
          <div className="flex-1 flex justify-center">
            {/* Navigation - centered */}
            <nav className="hidden md:flex items-center gap-8 justify-center">
              {isReady && !isAuthPage && !isCompleteProfile && (
                isLoggedIn ? (
                <>
                  <Link
                    href="/resume-reviewer"
                    onClick={() => console.log('🔗 Navigating to Resume Reviewer')}
                    className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                      isResumeReviewer ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                      isResumeReviewer ? "after:w-full" : ""
                    }`}
                  >
                    Resume Reviewer
                  </Link>
                  <Link
                    href="/ai-interviewer"
                    onClick={() => console.log('🔗 Navigating to AI Interviewer')}
                    className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                      isAIInterviewer ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                      isAIInterviewer ? "after:w-full" : ""
                    }`}
                  >
                    AI Interviewer
                  </Link>
                  <Link
                    href="/job-matcher"
                    className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                      isJobMatcher ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                    } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                      isJobMatcher ? "after:w-full" : ""
                    }`}
                  >
                    Job Matcher
                  </Link>
                </>
                ) : (
                  <>
                    <Link
                      href="/how-it-works"
                      className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                        isHowItWorks ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                        isHowItWorks ? "after:w-full" : ""
                      }`}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/features"
                      className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                        isFeaturesPage ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                        isFeaturesPage ? "after:w-full" : ""
                      }`}
                    >
                      Features
                    </Link>
                    <Link
                      href="/pricing"
                      className={`relative text-sm font-semibold transition-colors font-[Manrope] pb-1 ${
                        isPricingPage ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"
                      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full ${
                        isPricingPage ? "after:w-full" : ""
                      }`}
                    >
                      Pricing
                    </Link>
                  </>
                )
              )}

            </nav>
          </div>

          {/* Right side actions - Fixed width to keep navigation centered */}
          <div className="flex items-center gap-4 flex-shrink-0 justify-end">
            {credits !== null && (
              <div className="hidden md:inline-block px-3 py-0.5 rounded-full border border-indigo-600 bg-indigo-50 text-indigo-600 text-xs font-semibold">
                {credits === -1 ? '∞' : `${credits} Credits`}
              </div>
            )}
            {!isAuthPage && !isCompleteProfile && !isProfilePage && !isDashboard && !isResumeReviewer && !isJobMatcher && !isAIInterviewer && !isSavedJobs && !isSettings && (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-all duration-200 font-[Manrope]"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] font-[Manrope]"
                >
                  Get Started
                </Link>
              </>
            )}

            {isAuthPage && <div className="w-full"></div>}

            {isCompleteProfile && <div className="w-full"></div>}

            {(isDashboard || isResumeReviewer || isJobMatcher || isAIInterviewer || isSavedJobs || isSettings || isProfilePage) && (
              <>
                {/* Avatar with Dropdown */}
                <div className="relative" id="avatar-container">
                  <button 
                    id="avatar-button"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center transition-colors hover:from-orange-500 hover:to-pink-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDropdownOpen(prev => !prev)
                    }}
                  >
                    <span className="text-white text-sm font-medium">{userInitial}</span>
                  </button>
                  
                  <AvatarDropdown 
                    isOpen={isDropdownOpen} 
                    onClose={() => setIsDropdownOpen(false)} 
                  />
                </div>

              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && !isAuthPage && !isCompleteProfile && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <nav className="px-4 py-4 space-y-1">
            {isLoggedIn ? (
            <>
            <Link
              href="/resume-reviewer"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                isResumeReviewer ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              Resume Reviewer
            </Link>
            <Link
              href="/ai-interviewer"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                isAIInterviewer ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              AI Interviewer
            </Link>
            <Link
              href="/job-matcher"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                isJobMatcher ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
              }`}
            >
              Job Matcher
            </Link>
            </>
            ) : (
              <>
                <Link
                  href="/how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                    isHowItWorks ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  How It Works
                </Link>
                <Link
                  href="/features"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                    isFeaturesPage ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] ${
                    isPricingPage ? "text-indigo-600 bg-indigo-600/10" : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  Pricing
                </Link>
              </>
            )}
            
            {/* Mobile Avatar Section */}
            {(isDashboard || isResumeReviewer || isJobMatcher || isAIInterviewer || isSavedJobs || isSettings || isProfilePage) && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors font-[Manrope] text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{userInitial}</span>
                  </div>
                  Profile
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
