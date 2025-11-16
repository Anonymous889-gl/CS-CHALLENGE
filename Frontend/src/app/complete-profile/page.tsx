"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { CustomSelect } from "../../components/ui/custom-select"
import SuccessPopup from "../../components/success-popup"

export default function CompleteProfile() {
  const router = useRouter()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [desiredJobs, setDesiredJobs] = useState<string[]>([])
  const [newDesiredJob, setNewDesiredJob] = useState("")
  const [industries, setIndustries] = useState<string[]>([])
  const [newIndustry, setNewIndustry] = useState("")
  const [locations, setLocations] = useState<string[]>([])
  const [newLocation, setNewLocation] = useState("")
  const [careerInterests, setCareerInterests] = useState<string[]>([])
  const [newCareerInterest, setNewCareerInterest] = useState("")
  const [salaryAmount, setSalaryAmount] = useState("")
  const [salaryCurrency, setSalaryCurrency] = useState("USD")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const addDesiredJob = () => {
    if (newDesiredJob.trim() && !desiredJobs.includes(newDesiredJob.trim())) {
      setDesiredJobs([...desiredJobs, newDesiredJob.trim()])
      setNewDesiredJob("")
    }
  }

  const removeDesiredJob = (jobToRemove: string) => {
    setDesiredJobs(desiredJobs.filter(job => job !== jobToRemove))
  }

  const addIndustry = () => {
    if (newIndustry.trim() && !industries.includes(newIndustry.trim())) {
      setIndustries([...industries, newIndustry.trim()])
      setNewIndustry("")
    }
  }

  const removeIndustry = (industryToRemove: string) => {
    setIndustries(industries.filter(industry => industry !== industryToRemove))
  }

  const addLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()])
      setNewLocation("")
    }
  }

  const removeLocation = (locationToRemove: string) => {
    setLocations(locations.filter(location => location !== locationToRemove))
  }

  const addCareerInterest = () => {
    if (newCareerInterest.trim() && !careerInterests.includes(newCareerInterest.trim())) {
      setCareerInterests([...careerInterests, newCareerInterest.trim()])
      setNewCareerInterest("")
    }
  }

  const removeCareerInterest = (interestToRemove: string) => {
    setCareerInterests(careerInterests.filter(interest => interest !== interestToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        router.push('/login')
        return
      }

      // Prepare profile completion data
      const profileData = {
        skills: skills.join(', '),
        desiredJobs: desiredJobs.join(', '),
        industries: industries.join(', '),
        preferredLocations: locations.join(', '),
        careerInterests: careerInterests.join(', '),
        salaryExpectation: parseInt(salaryAmount) || 0,
        salaryCurrency: salaryCurrency,
        isProfileComplete: true,
        completedSteps: 4 // Mark profile as fully completed
      }

      const response = await fetch('http://localhost:5000/api/profile/complete', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        setShowSuccessPopup(true)
        // Redirect to dashboard after showing success popup
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Profile completion error:', error)
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  const handleJobKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addDesiredJob()
    }
  }

  const handleIndustryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addIndustry()
    }
  }

  const handleLocationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLocation()
    }
  }

  const handleCareerInterestKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCareerInterest()
    }
  }

  // Currency options
  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "AED", label: "AED (د.إ)" },
    { value: "SAR", label: "SAR (﷼)" },
    { value: "EGP", label: "EGP (£)" },
    { value: "MAD", label: "MAD (DH)" },
    { value: "NGN", label: "NGN (₦)" },
    { value: "KES", label: "KES (KSh)" },
    { value: "ZAR", label: "ZAR (R)" }
  ]

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
        <Header />

        <main className="flex-grow px-4 py-20 sm:px-5 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              {/* Back Button */}
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6 font-[Manrope]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight font-[Manrope]">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-lg text-gray-600 font-[Manrope]">
                Let's build your profile to find you the best opportunities.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Skills Section */}
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-[Manrope]">Your Skills</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]"
                      htmlFor="skills-input"
                    >
                      Add your skills
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                        id="skills-input"
                        placeholder="e.g., Python, Marketing, Project Management"
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={handleSkillKeyPress}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 group hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-[Manrope]">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]"
                      htmlFor="industries-input"
                    >
                      Preferred Industries
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                      </svg>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                        id="industries-input"
                        placeholder="e.g., Technology, Healthcare"
                        type="text"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        onKeyPress={handleIndustryKeyPress}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {industries.map((industry, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 group hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                        >
                          {industry}
                          <button
                            type="button"
                            onClick={() => removeIndustry(industry)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]"
                      htmlFor="job-titles-input"
                    >
                      Desired Job Titles
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                        id="job-titles-input"
                        placeholder="e.g., Software Engineer, Product Manager"
                        type="text"
                        value={newDesiredJob}
                        onChange={(e) => setNewDesiredJob(e.target.value)}
                        onKeyPress={handleJobKeyPress}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {desiredJobs.map((job, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 group hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                        >
                          {job}
                          <button
                            type="button"
                            onClick={() => removeDesiredJob(job)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]"
                      htmlFor="location-input"
                    >
                      Location Preferences
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                        id="location-input"
                        placeholder="e.g., Lagos, Nairobi, Remote"
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={handleLocationKeyPress}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {locations.map((location, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 group hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                        >
                          {location}
                          <button
                            type="button"
                            onClick={() => removeLocation(location)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]"
                      htmlFor="career-interests-input"
                    >
                      Career Interests
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                        id="career-interests-input"
                        placeholder="e.g., AI, Fintech, EdTech"
                        type="text"
                        value={newCareerInterest}
                        onChange={(e) => setNewCareerInterest(e.target.value)}
                        onKeyPress={handleCareerInterestKeyPress}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {careerInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 group hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-200 shadow-sm"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeCareerInterest(interest)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-4 font-[Manrope]">
                      Desired Salary
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Salary Amount Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2 font-[Manrope]" htmlFor="salary-amount">
                          Amount
                        </label>
                        <div className="relative">
                          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <input
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#f6f8f8] border-2 border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 placeholder:text-gray-400 font-[Manrope] transition-colors"
                            id="salary-amount"
                            placeholder="e.g., 75000"
                            type="number"
                            min="0"
                            value={salaryAmount}
                            onChange={(e) => setSalaryAmount(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2 font-[Manrope]" htmlFor="salary-currency">
                          Currency
                        </label>
                        <CustomSelect
                          value={salaryCurrency}
                          onChange={setSalaryCurrency}
                          options={currencies.map(currency => ({
                            value: currency.value,
                            label: currency.label
                          }))}
                          placeholder="Select currency"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center h-12 px-8 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-white transition-all duration-300 font-[Manrope] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="truncate">Saving...</span>
                      <svg className="ml-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="truncate">Save and Continue</span>
                      <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="w-full px-4 py-6 sm:px-5 lg:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex flex-wrap justify-center gap-4">
                <a className="text-xs text-gray-500 hover:text-[indigo-600] font-[Manrope] transition-colors" href="/privacy">
                  Privacy Policy
                </a>
                <a className="text-xs text-gray-500 hover:text-[indigo-600] font-[Manrope] transition-colors" href="/terms">
                  Terms of Service
                </a>
                <a className="text-xs text-gray-500 hover:text-[indigo-600] font-[Manrope] transition-colors" href="/contact">
                  Contact Us
                </a>
              </div>
              <div className="text-xs text-gray-400">
                <p className="font-[Manrope]">© 2025 UtopiaHire</p>
              </div>
            </div>
          </div>
        </footer>

        <SuccessPopup isOpen={showSuccessPopup} onClose={() => setShowSuccessPopup(false)} />
      </div>
    </PageTransition>
  )
}
