"use client"

import Link from "next/link"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { useEffect, useState } from "react"

export default function FeaturesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsLoggedIn(!!token)
  }, [])
  return (
    <PageTransition>
      <div className="min-h-screen bg-white font-[Manrope] text-[#1f2937]">
        <Header />

        <main className="py-20 sm:py-28">
          <div className="w-full px-4 sm:px-5 lg:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-extrabold text-[#1f2937] sm:text-4xl font-[Manrope]">
                AI-Powered Career Assistance
              </h1>
              <p className="mt-4 text-lg text-[#4b5563] font-[Manrope]">
                Explore UtopiaHire's core features, designed to elevate your job search and help you land your dream
                role in Africa and the MENA region.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Resume Reviewer */}
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[indigo-600]/40 hover:shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[indigo-600] text-white">
                  <span className="material-symbols-outlined text-2xl">description</span>
                </div>
                <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Resume Reviewer</h3>
                <p className="text-sm text-[#4b5563] font-[Manrope]">
                  Get instant, AI-powered feedback to optimize your resume and increase your chances of landing an interview.
                </p>
                <Link href={isLoggedIn ? "/resume-reviewer" : "/sign-up"} className="text-[indigo-600] hover:text-[indigo-600]/80 font-medium inline-flex items-center font-[Manrope]">
                  Learn More →
                </Link>
              </div>

              {/* AI Interviewer */}
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[indigo-600]/40 hover:shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[indigo-600] text-white">
                  <span className="material-symbols-outlined text-2xl">psychology</span>
                </div>
                <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">AI Interviewer</h3>
                <p className="text-sm text-[#4b5563] font-[Manrope]">
                  Practice your interview skills with our AI, receiving personalized feedback on your responses and delivery.
                </p>
                <Link href={isLoggedIn ? "/ai-interviewer" : "/sign-up"} className="text-[indigo-600] hover:text-[indigo-600]/80 font-medium inline-flex items-center font-[Manrope]">
                  Try It Out →
                </Link>
              </div>

              {/* Job Matcher */}
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[indigo-600]/40 hover:shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[indigo-600] text-white">
                  <span className="material-symbols-outlined text-2xl">work</span>
                </div>
                <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Job Matcher</h3>
                <p className="text-sm text-[#4b5563] font-[Manrope]">
                  Find the perfect job match based on your skills, experience, and career goals with AI-driven recommendations.
                </p>
                <Link href={isLoggedIn ? "/job-matcher" : "/sign-up"} className="text-[indigo-600] hover:text-[indigo-600]/80 font-medium inline-flex items-center font-[Manrope]">
                  Find Jobs →
                </Link>
              </div>

              {/* Footprint Scanner */}
              <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[indigo-600]/40 hover:shadow-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[indigo-600] text-white">
                  <span className="material-symbols-outlined text-2xl">fingerprint</span>
                </div>
                <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Footprint Scanner</h3>
                <p className="text-sm text-[#4b5563] font-[Manrope]">
                  Scan and analyze your digital footprint to tailor job searches and recommendations even further.
                </p>
                <Link href={isLoggedIn ? "/footprint-scanner" : "/sign-up"} className="text-[indigo-600] hover:text-[indigo-600]/80 font-medium inline-flex items-center font-[Manrope]">
                  Discover →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
