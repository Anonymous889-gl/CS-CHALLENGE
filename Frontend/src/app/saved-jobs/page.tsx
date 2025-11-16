"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { useToast, ToastContainer } from "../../components/toast"
import { motion, AnimatePresence } from "framer-motion"
import { NoResultsEmpty } from "../../components/empty-state"
import { JobMatch, UserSkillProfile } from "../../utils/job-matching"

export default function SavedJobs() {
  const { success, warning, toasts, removeToast } = useToast()
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [savedJobs, setSavedJobs] = useState<JobMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load saved jobs data
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        // Get saved job data
        const savedJobsDataRaw = localStorage.getItem('savedJobsData')
        if (savedJobsDataRaw) {
          try {
            const parsed: JobMatch[] = JSON.parse(savedJobsDataRaw)
            setSavedJobs(parsed)
            setSavedJobIds(parsed.map(j => j.id))
            setIsLoading(false)
            return
          } catch (e) {
            console.warn('Corrupted savedJobsData, fallback to IDs')
          }
        }

        // Fallback to saved IDs list
        const savedIds = localStorage.getItem('savedJobs')
        if (!savedIds) {
          setSavedJobIds([])
          setSavedJobs([])
          setIsLoading(false)
          return
        }

        const jobIds: string[] = JSON.parse(savedIds)
        setSavedJobIds(jobIds)

        if (jobIds.length === 0) {
          setSavedJobs([])
          setIsLoading(false)
          return
        }

        // Get user profile to fetch jobs (needed for API call)
        const profileData = localStorage.getItem('recentProfileAnalysis')
        if (!profileData) {
          // If no profile, create a default one to get jobs
          const defaultProfile: UserSkillProfile = {
            primarySkills: ['JavaScript', 'Python', 'React'],
            secondarySkills: ['Node.js', 'CSS'],
            experienceLevel: 'mid',
            preferredTechnologies: ['React', 'Node.js'],
            remote: true
          }
          
          // Fetch jobs with default profile
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userProfile: defaultProfile })
          })
          
          if (response.ok) {
            const data = await response.json()
            const allJobs: JobMatch[] = data.jobs || []
            
            // Filter to only saved jobs
            const filteredSavedJobs = allJobs.filter(job => jobIds.includes(job.id))
            setSavedJobs(filteredSavedJobs)
          }
        } else {
          // Use existing profile to fetch jobs
          const parsed = JSON.parse(profileData)
          
          const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userProfile: parsed.userProfile })
          })
          
          if (response.ok) {
            const data = await response.json()
            const allJobs: JobMatch[] = data.jobs || []
            
            // Filter to only saved jobs
            const filteredSavedJobs = allJobs.filter(job => jobIds.includes(job.id))
            setSavedJobs(filteredSavedJobs)
          }
        }
        
      } catch (error) {
        console.error('Error loading saved jobs:', error)
        setSavedJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedJobs()
  }, [])

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

  const removeSavedJob = (jobId: string) => {
    const newSavedJobIds = savedJobIds.filter(id => id !== jobId)
    setSavedJobIds(newSavedJobIds)
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobIds))
    
    // Update displayed jobs
    const newSavedJobs = savedJobs.filter(job => job.id !== jobId)
    setSavedJobs(newSavedJobs)
    
    const job = savedJobs.find(j => j.id === jobId)
    if (job) {
      warning("Job Removed", `${job.title} removed from saved jobs`)
    }
  }

  const formatSalary = (salary: JobMatch['salary']) => {
    if (!salary) return 'Salary not specified'
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600' 
    return 'text-gray-600'
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full flex-col bg-[#f6f8f8]">
        <Header />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 font-[Manrope]">
                <Link href="/job-matcher" className="hover:text-[indigo-600] transition-colors">
                  Job Matcher
                </Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span>Saved Jobs</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-[Manrope]">My Saved Jobs</h1>
                  <p className="text-gray-600 font-[Manrope] mt-1">
                    {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
                  </p>
                </div>
                
                <Link
                  href="/job-matcher"
                  className="flex items-center gap-2 bg-[indigo-600] text-white px-4 py-2 rounded-lg hover:bg-[indigo-600]/90 transition-colors font-medium font-[Manrope]"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  Find More Jobs
                </Link>
              </div>
            </div>

            {/* Saved Jobs Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : savedJobs.length === 0 ? (
                // Empty state
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-gray-400 text-3xl">bookmark_border</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-2">No Saved Jobs</h3>
                  <p className="text-gray-600 font-[Manrope] mb-6 max-w-md">
                    You haven't saved any jobs yet. Browse jobs and click the bookmark icon to save them here.
                  </p>
                  <Link
                    href="/job-matcher"
                    className="bg-[indigo-600] text-white px-6 py-3 rounded-lg hover:bg-[indigo-600]/90 transition-colors font-medium font-[Manrope]"
                  >
                    Explore Jobs
                  </Link>
                </motion.div>
              ) : (
                // Saved jobs list
                <div className="space-y-4">
                  {savedJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:border-[indigo-600]/30 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold font-[Manrope] ${getMatchScoreColor(job.matchScore)} bg-gray-100 px-2 py-1 rounded-full`}>
                            {job.matchScore}% Match
                          </p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium font-[Manrope]">
                            Saved
                          </span>
                        </div>
                        
                        <button
                          onClick={() => removeSavedJob(job.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remove from saved jobs"
                        >
                          <span className="material-symbols-outlined text-xl">bookmark_remove</span>
                        </button>
                      </div>

                      {/* Job Info */}
                      <h3 className="text-xl font-bold text-gray-900 font-[Manrope] mb-2">
                        {job.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <span className="font-[Manrope]">{job.company}</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">place</span>
                          {job.location}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.type === 'remote' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {job.type}
                        </span>
                      </div>

                      <p className="text-lg font-semibold text-[indigo-600] font-[Manrope] mb-3">
                        {formatSalary(job.salary)}
                      </p>

                      <p className="text-gray-700 font-[Manrope] text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 4).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-[indigo-600]/10 text-[indigo-600] text-xs rounded font-medium">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            +{job.skills.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            if (job.url && job.url !== '#') {
                              // Track the application before opening the link
                              trackApplication(job.title)
                              window.open(job.url, '_blank')
                            } else {
                              warning("No Link Available", "No application link available for this job.")
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg font-medium transition-opacity font-[Manrope] ${
                            job.url && job.url !== '#' 
                              ? 'bg-[indigo-600] text-white hover:opacity-90' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={!job.url || job.url === '#'}
                        >
                          Apply Now
                        </button>
                        <Link
                          href={`/job-matcher`}
                          className="px-4 py-2 border border-[indigo-600] text-[indigo-600] rounded-lg hover:bg-[indigo-600]/10 transition-colors font-medium font-[Manrope]"
                        >
                          View Similar
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </PageTransition>
  )
}
