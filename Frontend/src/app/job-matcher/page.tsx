"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { CustomSelect } from "../../components/ui/custom-select"
import { useToast, ToastContainer } from "../../components/toast"
import { motion, AnimatePresence } from "framer-motion"
import { findMatchingJobsProduction, generateUserProfileFromData, JobMatch, UserSkillProfile } from "../../utils/job-matching"

export default function JobMatcher() {
  const { success, error, warning, toasts, removeToast } = useToast()
  
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserSkillProfile | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"match" | "salary" | "date">("match")
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([])

  // Footprint skills (e.g., StackOverflow tags, GitHub languages) not in primary skills
  const footprintSkills = useMemo(() => {
    if (!userProfile) return []
    const soTags = userProfile.stackOverflowTags || []
    const ghLangs = userProfile.githubLanguages ? Object.keys(userProfile.githubLanguages) : []
    const extras = [...soTags, ...ghLangs].filter(
      (skill) => !userProfile.primarySkills.includes(skill)
    )
    return Array.from(new Set(extras)).slice(0, 6)
  }, [userProfile])
  
  // Advanced filter states
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [remoteFilter, setRemoteFilter] = useState<"all" | "remote" | "onsite">("all")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [jobsPerPage] = useState(8)
  const [paginatedJobs, setPaginatedJobs] = useState<JobMatch[]>([])
  const [totalPages, setTotalPages] = useState(1)

  // Helper functions
  const extractCountryFromLocation = (location: string): string => {
    if (location.toLowerCase().includes('egypt') || location.toLowerCase().includes('cairo')) return 'Egypt'
    if (location.toLowerCase().includes('uk') || location.toLowerCase().includes('london')) return 'United Kingdom'
    if (location.toLowerCase().includes('remote')) return 'Global'
    if (location.toLowerCase().includes('germany') || location.toLowerCase().includes('berlin')) return 'Germany'
    if (location.toLowerCase().includes('france') || location.toLowerCase().includes('paris')) return 'France'
    if (location.toLowerCase().includes('netherlands') || location.toLowerCase().includes('amsterdam')) return 'Netherlands'
    return 'Global'
  }
  
  const capitalize = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase())

  const extractIndustryFromJob = (job: JobMatch): string => {
    const title = job.title.toLowerCase()
    const skills = job.skills.map(s => s.toLowerCase()).join(' ')
    
    if (title.includes('ai') || title.includes('machine learning') || skills.includes('ai') || skills.includes('ml')) return 'AI/ML'
    if (title.includes('fintech') || title.includes('finance')) return 'FinTech'
    if (title.includes('blockchain') || skills.includes('blockchain')) return 'Blockchain'
    return 'Technology'
  }

  // NUCLEAR OPTION: Prevent ALL double executions with timestamp tracking
  const lastBookmarkActionRef = useRef<{[key: string]: number}>({})
  
  const toggleBookmark = (jobId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const now = Date.now()
    const lastAction = lastBookmarkActionRef.current[jobId] || 0
    
    // If last action was less than 2 seconds ago, ignore
    if (now - lastAction < 2000) {
      console.log(`🚫 BLOCKED: Duplicate bookmark action for job ${jobId} (${now - lastAction}ms ago)`)
      return
    }

    // Update timestamp
    lastBookmarkActionRef.current[jobId] = now
    console.log(`🔄 ALLOWED: Processing bookmark toggle for job ${jobId}`)

    const job = jobs.find((j: JobMatch) => j.id === jobId)
    const isCurrentlySaved = bookmarkedJobs.includes(jobId)
    
    // Update state immediately
    if (isCurrentlySaved) {
      // Remove bookmark
      const newBookmarks = bookmarkedJobs.filter(id => id !== jobId)
      setBookmarkedJobs(newBookmarks)
      localStorage.setItem('savedJobs', JSON.stringify(newBookmarks))

      // Remove from savedJobsData
      const existingData = JSON.parse(localStorage.getItem('savedJobsData') || '[]') as JobMatch[]
      localStorage.setItem('savedJobsData', JSON.stringify(existingData.filter(j => j.id !== jobId)))
      
      console.log(`➖ REMOVED job ${jobId} from bookmarks`)
      if (job) {
        warning("Job Removed", `${job.title} removed from saved jobs`, { duration: 2000 })
      }
    } else {
      // Add bookmark
      const newBookmarks = [...bookmarkedJobs, jobId]
      setBookmarkedJobs(newBookmarks)
      localStorage.setItem('savedJobs', JSON.stringify(newBookmarks))

      // Persist full job data for Saved Jobs page
      if (job) {
        const existingData = JSON.parse(localStorage.getItem('savedJobsData') || '[]') as JobMatch[]
        const updatedData = [...existingData.filter(j => j.id !== jobId), job]
        localStorage.setItem('savedJobsData', JSON.stringify(updatedData))
        success("Job Saved", `${job.title} added to saved jobs`, { duration: 2000 })
      }
    }
  }

  // Track job application
  const trackApplication = async (jobTitle: string) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) return

      // Get current applications count and increment it
      const currentApplications = parseInt(localStorage.getItem('applicationsCount') || '0')
      const newApplicationsCount = currentApplications + 1
      
      // Update local storage
      localStorage.setItem('applicationsCount', newApplicationsCount.toString())
      
      // Update backend
      await fetch('http://localhost:5000/api/profile/update-metrics', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          applications: newApplicationsCount
        })
      })
      
      success("Application Tracked", `Applied to ${jobTitle}. Total applications: ${newApplicationsCount}`)
    } catch (error) {
      console.error('Failed to track application:', error)
    }
  }

  // Filter options
  const countries = ["Egypt", "United Kingdom", "Germany", "France", "Netherlands", "Global"]
  const industries = ["Technology", "AI/ML", "FinTech", "Blockchain"]

  // Pagination logic (simplified to avoid infinite loops)
  const updatePagination = (filteredJobs: JobMatch[]) => {
    const total = Math.ceil(filteredJobs.length / jobsPerPage)
    setTotalPages(total)
    
    // Reset to page 1 if current page is beyond total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(1)
    }
  }

  // Load profile data and jobs from backend
  useEffect(() => {
    const loadProfileAndJobs = async () => {
      setIsLoading(true)
      
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          warning("Authentication Required", "Please log in to access job matching")
          setIsLoading(false)
          return
        }

        // Fetch real user data from backend
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()
        const user = data.user
        
        // Store user data for display
        setUserData(user)
        
        // Generate base profile from database
        const baseProfile = generateUserProfileFromData({
          skills: user.skills || '',
          interests: user.interests || '',
          industries: user.industries || '',
          location: user.location || '',
          salaryAmount: user.salaryExpectation || user.salaryAmount || 0,
          salaryCurrency: user.salaryCurrency || 'USD',
          experience: user.experience || 'entry'
        })

        // Check if we have GitHub/StackOverflow analysis data to enhance the profile
        const profileAnalysisData = localStorage.getItem('recentProfileAnalysis')
        let realUserProfile = baseProfile
        
        if (profileAnalysisData) {
          try {
            const analysisData = JSON.parse(profileAnalysisData)
            const enhancedProfile = analysisData.userProfile
            
            // Merge database skills with GitHub/StackOverflow skills
            const combinedPrimarySkills = [
              ...baseProfile.primarySkills,           // Database skills first
              ...enhancedProfile.primarySkills        // GitHub/SO skills second
            ]
            
            const combinedSecondarySkills = [
              ...baseProfile.secondarySkills,
              ...enhancedProfile.secondarySkills
            ]
            
            const combinedTechnologies = [
              ...baseProfile.preferredTechnologies,
              ...enhancedProfile.preferredTechnologies
            ]
            
            // Create merged profile with deduplicated skills
            realUserProfile = {
              ...baseProfile,
              primarySkills: Array.from(new Set(combinedPrimarySkills)).slice(0, 10),      // Top 10 primary skills
              secondarySkills: Array.from(new Set(combinedSecondarySkills)).slice(0, 8),   // Top 8 secondary skills  
              preferredTechnologies: Array.from(new Set(combinedTechnologies)).slice(0, 8), // Top 8 technologies
              experienceLevel: enhancedProfile.experienceLevel || baseProfile.experienceLevel, // Use enhanced if available
              githubLanguages: enhancedProfile.githubLanguages,
              stackOverflowTags: enhancedProfile.stackOverflowTags
            }
            
            console.log('🔗 Merged database + GitHub/StackOverflow skills')
            console.log('📊 Database skills:', baseProfile.primarySkills)
            console.log('🔧 Enhanced skills:', enhancedProfile.primarySkills)
            console.log('✨ Final merged skills:', realUserProfile.primarySkills)
          } catch (error) {
            console.error('Failed to parse profile analysis data:', error)
            realUserProfile = baseProfile
            console.log('📝 Using database-only profile (failed to parse enhanced data)')
          }
        } else {
          console.log('📝 Using database-only profile (no GitHub/StackOverflow connected)')
        }
        
        setUserProfile(realUserProfile)
        
        console.log('👤 User Data:', user)
        console.log('📝 Raw Skills from DB:', user.skills)
        console.log('🎯 Generated Profile:', realUserProfile)
        console.log('🔍 Primary Skills Array:', realUserProfile.primarySkills)
        
        // Debug: Check if skills are empty and show helpful message
        if (!user.skills || user.skills.trim() === '') {
          console.log('⚠️ No skills found in user profile!')
          warning("No Skills Found", "Add skills to your profile for better job matching. Visit your profile page to add skills.")
        }
        
        // Load jobs based on real profile
        console.log('🔍 Loading jobs with real user profile:', realUserProfile)
        const jobResults = await findMatchingJobsProduction(realUserProfile)
        console.log('📋 Received jobs:', jobResults.length, 'jobs')
        setJobs(jobResults)
        
        // Update job matches count in backend
        if (jobResults.length > 0) {
          await fetch('http://localhost:5000/api/profile/update-metrics', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              jobMatches: jobResults.length
            })
          })
        }
        
      } catch (err) {
        console.error('Failed to load profile or jobs:', err)
        error("Loading Failed", "Unable to load your profile data for job matching")
        
        // Fallback: try localStorage as backup
        const recentAnalysis = localStorage.getItem('recentProfileAnalysis')
        if (recentAnalysis) {
          try {
            const parsed = JSON.parse(recentAnalysis)
            setUserProfile(parsed.userProfile)
            const jobResults = await findMatchingJobsProduction(parsed.userProfile)
            setJobs(jobResults)
            warning("Using Cached Data", "Using previously saved profile data")
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfileAndJobs()
  }, [])

  // Load saved jobs from localStorage
  useEffect(() => {
    const loadSavedJobs = () => {
      try {
        const saved = localStorage.getItem('savedJobs')
        if (saved && saved !== 'null' && saved !== 'undefined') {
          const savedIds = JSON.parse(saved)
          if (Array.isArray(savedIds)) {
            setBookmarkedJobs(savedIds)
          } else {
            // Reset if data is corrupted
            localStorage.setItem('savedJobs', '[]')
            setBookmarkedJobs([])
          }
        } else {
          // Initialize with empty array
          localStorage.setItem('savedJobs', '[]')
          setBookmarkedJobs([])
        }
      } catch (error) {
        console.error('Error loading saved jobs:', error)
        // Reset on error
        localStorage.setItem('savedJobs', '[]')
        setBookmarkedJobs([])
      }
    }
    
    loadSavedJobs()
  }, [])

  // Advanced filter and sort jobs (memoized to prevent infinite loops)
  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter(job => {
        // Apply search filter
        if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !job.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !job.location.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        
        // Apply country filters
        if (selectedCountries.length > 0) {
          const jobCountry = extractCountryFromLocation(job.location)
          if (!selectedCountries.includes(jobCountry)) {
            return false
          }
        }
        
        // Apply industry filters
        if (selectedIndustries.length > 0) {
          const jobIndustry = extractIndustryFromJob(job)
          if (!selectedIndustries.includes(jobIndustry)) {
            return false
          }
        }
        
        // Apply remote filter
        if (remoteFilter === "remote" && job.type !== "remote") return false
        if (remoteFilter === "onsite" && job.type === "remote") return false
        
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "match":
            return b.matchScore - a.matchScore
          case "salary":
            const aMax = a.salary?.max || 0
            const bMax = b.salary?.max || 0
            return bMax - aMax
          case "date":
            const aDate = new Date(a.posted).getTime()
            const bDate = new Date(b.posted).getTime()
            return bDate - aDate
          default:
            return 0
        }
      })
  }, [jobs, searchQuery, selectedCountries, selectedIndustries, remoteFilter, sortBy])

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const formatSalary = (salary: JobMatch['salary']) => {
    if (!salary) return 'Salary not specified'
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
  }

  // Update pagination when filters change (removed currentPage from deps to prevent loop)
  useEffect(() => {
    updatePagination(filteredAndSortedJobs)
  }, [filteredAndSortedJobs])
  
  // Separate effect for current page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    const endIndex = startIndex + jobsPerPage
    const paginated = filteredAndSortedJobs.slice(startIndex, endIndex)
    setPaginatedJobs(paginated)
  }, [currentPage, filteredAndSortedJobs])

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full flex-col bg-[#f6f8f8]">
        <Header />

        <main className="flex flex-1 gap-6 p-6 lg:p-8">
          {/* Compact User Profile Sidebar */}
          <aside className="hidden lg:flex w-72 flex-col gap-4">
            {/* User Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-600 to-[#0ea5e9] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-white text-2xl">person</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-[Manrope]">
                  {userData ? `${userData.name} ${userData.surname}` : 'User'}
                </h3>
                <p className="text-sm text-gray-600 font-[Manrope]">
                  {userProfile?.experienceLevel ? `${userProfile.experienceLevel.charAt(0).toUpperCase() + userProfile.experienceLevel.slice(1)} Developer` : 'Software Engineer'}
                </p>
                <p className="text-xs text-gray-500 font-[Manrope] flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-xs">place</span>
                  {userData?.location || userProfile?.location || 'Global'}
                </p>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 font-[Manrope]">Skills</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {userProfile?.primarySkills && userProfile.primarySkills.length > 0 ? (
                  userProfile.primarySkills.slice(0, 6).map((skill, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-indigo-600/10 text-indigo-600 px-2 py-1 rounded-full font-medium font-[Manrope]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <div className="text-center w-full py-2">
                    <p className="text-xs text-gray-500 font-[Manrope]">No skills added yet</p>
                    <p className="text-xs text-gray-400 font-[Manrope] mt-1">
                      <a href="/profile" className="text-indigo-600 hover:text-indigo-700">Add skills to your profile</a> for better job matching
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 font-[Manrope]">Job Match Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[Manrope]">Total Jobs</span>
                  <span className="font-medium text-gray-900 font-[Manrope]">{jobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[Manrope]">Filtered</span>
                  <span className="font-medium text-gray-900 font-[Manrope]">{filteredAndSortedJobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-[Manrope]">Saved</span>
                  <span className="font-medium text-gray-900 font-[Manrope]">{bookmarkedJobs.length}</span>
                </div>
              </div>
              
              {/* Debug: Clear saved jobs button */}
              {bookmarkedJobs.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.setItem('savedJobs', '[]')
                    setBookmarkedJobs([])
                    warning("Saved Jobs Cleared", "All saved jobs have been removed", { duration: 2000 })
                  }}
                  className="w-full mt-3 px-3 py-2 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-[Manrope]"
                >
                  Clear All Saved ({bookmarkedJobs.length})
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-[Manrope]">Job Matches</h1>
                <p className="text-gray-600 font-[Manrope] text-sm">
                  {userProfile && userProfile.primarySkills.length > 0 ? 
                    `AI-powered job recommendations based on your ${userProfile.primarySkills.slice(0, 3).join(', ')} skills` :
                    jobs.length > 0 ?
                      'Showing general job opportunities. Add skills to your profile for personalized recommendations.' :
                      'Add skills to your profile to get personalized AI-powered job recommendations'
                  }
                </p>
              </div>

              {/* Search Bar & Filter Button */}
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200">search</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs, companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 font-[Manrope] transition-all duration-200 focus:shadow-lg focus:shadow-indigo-600/10 hover:border-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 opacity-0 group-focus-within:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>
                
                {/* Filter Toggle Button */}
                <div className="relative">
                  <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-[Manrope]"
                  >
                    <span className="material-symbols-outlined text-gray-600">tune</span>
                    <span className="text-sm font-medium text-gray-700">
                      Filters
                      {(selectedCountries.length + selectedIndustries.length + (remoteFilter !== "all" ? 1 : 0)) > 0 && (
                        <span className="ml-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {selectedCountries.length + selectedIndustries.length + (remoteFilter !== "all" ? 1 : 0)}
                        </span>
                      )}
                    </span>
                  </button>
                  
                  {/* Filter Dropdown */}
                  {isFiltersOpen && (
                    <div className="absolute top-full right-0 mt-1 w-72 bg-white border-2 border-gray-300 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
                      <div className="p-3 space-y-3">
                        {/* Filter Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900 font-[Manrope]">Filters</h3>
                          <button 
                            onClick={() => {
                              setSelectedCountries([])
                              setSelectedIndustries([])
                              setRemoteFilter("all")
                              setSearchQuery("")
                            }}
                            className="text-xs text-indigo-600 hover:text-[#0ea5e9] font-medium font-[Manrope]"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        {/* Job Count */}
                        <div className="bg-indigo-600/10 rounded-md px-2 py-1">
                          <p className="text-xs font-medium text-indigo-600 font-[Manrope]">
                            {filteredAndSortedJobs.length} jobs found
                          </p>
                        </div>

                        {/* Countries */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 font-[Manrope] mb-2">Location</h4>
                          <div className="space-y-1">
                            {countries.map((country) => (
                              <label key={country} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedCountries.includes(country)}
                                  onChange={() => {
                                    setSelectedCountries(prev => 
                                      prev.includes(country) 
                                        ? prev.filter(c => c !== country)
                                        : [...prev, country]
                                    )
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="font-[Manrope] text-gray-700">{country}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Industries */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 font-[Manrope] mb-2">Industry</h4>
                          <div className="space-y-1">
                            {industries.map((industry) => (
                              <label key={industry} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedIndustries.includes(industry)}
                                  onChange={() => {
                                    setSelectedIndustries(prev => 
                                      prev.includes(industry) 
                                        ? prev.filter(i => i !== industry)
                                        : [...prev, industry]
                                    )
                                  }}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="font-[Manrope] text-gray-700">{industry}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Work Type */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 font-[Manrope] mb-2">Work Type</h4>
                          <div className="flex gap-1">
                            {[
                              { value: "all", label: "All" },
                              { value: "remote", label: "Remote" },
                              { value: "onsite", label: "On-site" }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setRemoteFilter(option.value as "all" | "remote" | "onsite")}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors font-[Manrope] ${
                                  remoteFilter === option.value
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-[Manrope]">
                  Showing {filteredAndSortedJobs.length} job{filteredAndSortedJobs.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-[Manrope]">Sort by:</span>
                  <CustomSelect
                    value={sortBy}
                    onChange={(value) => setSortBy(value as "match" | "salary" | "date")}
                    options={[
                      { value: "match", label: "Best Match" },
                      { value: "salary", label: "Highest Salary" },
                      { value: "date", label: "Most Recent" }
                    ]}
                    className="w-40 h-8"
                  />
                </div>
              </div>

              {/* Animated Job Grid */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 min-h-[400px]">
                <AnimatePresence>
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 4 }).map((_, index) => (
                      <motion.div
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="animate-pulse">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </motion.div>
                    ))
                  ) : !userProfile ? (
                    // No profile state
                    <motion.div 
                      key="no-profile"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center"
                    >
                      <div className="text-gray-400 mb-4">
                        <span className="material-symbols-outlined text-6xl">person_search</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">Browse Available Jobs</h3>
                      <p className="text-gray-600 font-[Manrope]">
                        Explore job opportunities that match your skills and experience.
                      </p>
                    </motion.div>
                  ) : paginatedJobs.length === 0 ? (
                    // No jobs found
                    <motion.div 
                      key="no-jobs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="col-span-full bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center"
                    >
                      <div className="text-gray-400 mb-4">
                        <span className="material-symbols-outlined text-6xl">search_off</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-[Manrope]">No Jobs Found</h3>
                      <p className="text-gray-600 font-[Manrope] mb-6">
                        {searchQuery ? 
                          `No jobs match your search "${searchQuery}". Try different keywords.` :
                          userProfile && userProfile.primarySkills.length === 0 ?
                            'Add skills to your profile to get personalized job recommendations.' :
                            'No job matches found for your profile. Try adjusting your filters.'
                        }
                      </p>
                      {userProfile && userProfile.primarySkills.length === 0 && (
                        <a 
                          href="/profile" 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-[Manrope]"
                        >
                          <span className="material-symbols-outlined text-sm">person_edit</span>
                          Complete Your Profile
                        </a>
                      )}
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity font-[Manrope]"
                        >
                          Clear Search
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    // Job cards with animation
                    paginatedJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-xl hover:border-indigo-600/50 hover:-translate-y-1 cursor-pointer group transition-all duration-300"
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <p className={`text-sm font-bold font-[Manrope] ${getMatchScoreColor(job.matchScore)} px-2 py-1 rounded-full`}>
                              {job.matchScore}% Match
                            </p>
                            <button
                              onClick={(e) => toggleBookmark(job.id, e)}
                              className={`transition-all duration-200 ${
                                bookmarkedJobs.includes(job.id) 
                                  ? 'text-indigo-600 hover:text-[#0ea5e9] scale-110' 
                                  : 'text-gray-400 hover:text-indigo-600 hover:scale-105'
                              }`}
                              title={bookmarkedJobs.includes(job.id) ? 'Remove from saved jobs' : 'Save job'}
                            >
                              <span className="material-symbols-outlined">
                                {bookmarkedJobs.includes(job.id) ? 'star' : 'star_border'}
                              </span>
                            </button>
                          </div>
                          <div className="cursor-pointer flex-1">
                            <div className="flex items-start gap-2 mb-2">
                              {/* Company Logo Placeholder */}
                              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-500 text-xs font-bold">
                                  {job.company.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-gray-900 font-[Manrope] group-hover:text-indigo-600 transition-colors duration-300 truncate">{job.title}</p>
                                <p className="text-sm text-gray-600 font-[Manrope] group-hover:text-gray-700 transition-colors duration-300 truncate">{job.company}</p>
                              </div>
                            </div>
                            
                            {/* Compact info row */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">place</span>
                                  {capitalize(job.location)}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {job.type}
                                </span>
                              </div>
                              <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                            </div>
                            
                            {/* Salary */}
                            <div className="mb-2">
                              <p className="text-sm font-semibold text-indigo-600 font-[Manrope] group-hover:text-[#0ea5e9] transition-colors duration-300">{formatSalary(job.salary)}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Skills and Apply Section */}
                        <div className="space-y-2">
                          {/* Skills */}
                          <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="px-1.5 py-0.5 bg-indigo-600/10 text-indigo-600 text-xs rounded font-medium">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                +{job.skills.length - 4}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (job.url && job.url !== '#') {
                                // Track the application before opening the link
                                trackApplication(job.title)
                                window.open(job.url, '_blank')
                              } else if (job.title.includes('[DEMO]')) {
                                warning("Demo Job", "This is a demo job. Real job links will appear when APIs are configured.", { duration: 3000 })
                              } else {
                                warning("No Link Available", "No application link available for this job.", { duration: 2000 })
                              }
                            }}
                            className={`w-full rounded-md py-1.5 text-sm font-bold transition-opacity hover:opacity-90 font-[Manrope] ${
                              job.title.includes('[DEMO]') 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-indigo-600 text-white'
                            }`}
                          >
                            {job.title.includes('[DEMO]') ? 'Demo Job' : 'Apply Now'}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && !isLoading && paginatedJobs.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-[Manrope]"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg font-[Manrope] ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-[Manrope]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </PageTransition>
  )
}
