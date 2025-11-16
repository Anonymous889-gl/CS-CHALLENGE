"use client"

import Header from "../components/header"
import PageTransition from "../components/page-transition"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and redirect to dashboard
    const token = localStorage.getItem('authToken')
    if (token) {
      router.push('/dashboard')
    }
  }, [])
  return (
    <PageTransition>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f8] font-[Manrope] text-[#1f2937]">
        <div className="flex h-full grow flex-col">
          <Header />

          <main className="flex-1">
            <section className="bg-gradient-to-br from-white via-indigo-50/30 to-white py-28 sm:py-36">
              <div className="w-full px-4 sm:px-5 lg:px-6">
                <div className="mx-auto max-w-4xl text-center">
                  <div className="flex flex-col gap-8 items-center">
                    <div className="flex flex-col gap-6 animate-fade-in">
                      <h1 className="text-5xl font-extrabold tracking-tight text-[#1f2937] sm:text-6xl lg:text-7xl font-[Manrope] leading-tight">
                        AI-Powered Career Architect for an <span className="text-indigo-600">Inclusive Future</span> of Work
                      </h1>
                      <p className="mx-auto max-w-2xl text-xl text-[#4b5563] font-[Manrope] leading-relaxed">
                        UtopiaHire is your AI-powered career assistant, designed to help job seekers in Africa and the
                        MENA region navigate the job market with fairness, accessibility, and trust.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                      <Link
                        href="/sign-up"
                        className="flex h-14 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 px-8 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.02] font-[Manrope]"
                      >
                        <span className="truncate">Upload Your Resume</span>
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex h-14 items-center justify-center overflow-hidden rounded-xl bg-white px-8 text-lg font-bold text-indigo-600 transition-all duration-200 hover:bg-indigo-50 hover:shadow-lg hover:scale-[1.02] border-2 border-indigo-600/20 hover:border-indigo-600 font-[Manrope]"
                      >
                        <span className="truncate">Try the AI Interview</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 sm:py-28 bg-[#f6f8f8]">
              <div className="w-full px-4 sm:px-5 lg:px-6">
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="text-3xl font-extrabold text-[#1f2937] sm:text-4xl font-[Manrope]">
                    Empowering Your Career Journey
                  </h2>
                  <p className="mt-4 text-lg text-[#4b5563] font-[Manrope]">
                    UtopiaHire offers a suite of AI-powered tools to help you succeed in your job search.
                  </p>
                </div>
                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-600/40 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '0ms'}}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <svg
                        fill="currentColor"
                        height="24"
                        viewBox="0 0 256 256"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0-16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Resume Reviewer</h3>
                    <p className="text-sm text-[#4b5563] font-[Manrope]">
                      Get instant feedback on your resume to improve its impact.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-600/40 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '150ms'}}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <svg
                        fill="currentColor"
                        height="24"
                        viewBox="0 0 256 256"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm40,143.6V232a8,8,0,0,1-16,0V207.6A80.11,80.11,0,0,1,48,128a8,8,0,0,1,16,0,64,64,0,0,0,128,0,8,8,0,0,1,16,0A80.11,80.11,0,0,1,136,207.6Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">AI Interviewer</h3>
                    <p className="text-sm text-[#4b5563] font-[Manrope]">
                      Practice your interview skills with our AI-powered interviewer.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-600/40 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <svg
                        fill="currentColor"
                        height="24"
                        viewBox="0 0 256 256"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Job Matcher</h3>
                    <p className="text-sm text-[#4b5563] font-[Manrope]">
                      Find the best job opportunities that match your skills and experience.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:border-indigo-600/40 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up" style={{animationDelay: '450ms'}}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
                      <svg
                        fill="currentColor"
                        height="24"
                        viewBox="0 0 256 256"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M208.06,184H152a8,8,0,0,0-8,8v12a36,36,0,0,0,72.05,0V192A8,8,0,0,0,208.06,184Zm-8,20a20,20,0,0,1-40,0v-4h40ZM104,160h-56a8,8,0,0,0-8,8v12A36,36,0,0,0,112,180V168A8,8,0,0,0,104,160Zm-8,20a20,20,0,0,1-40,0v-4H96ZM76,16C64.36,16,53.07,26.31,44.2,45c-13.93,29.38-18.56,73,.29,96a8,8,0,0,0,6.2,2.93h50.55a8,8,0,0,0,6.2-2.93c18.85-23,14.22-66.65,.29-96C98.85,26.31,87.57,16,76,16ZM97.15,128H54.78c-11.4-18.1-7.21-52.7,3.89-76.11C65.14,38.22,72.17,32,76,32s10.82,6.22,17.3,19.89C104.36,75.3,108.55,109.9,97.15,128Zm57.61,40h50.55a8,8,0,0,0,6.2-2.93c18.85-23,14.22-66.65,.29-96C202.93,50.31,191.64,40,180,40s-22.89,10.31-31.77,29c-13.93,29.38-18.56,73,.29,96A8.05,8.05,0,0,0,154.76,168Zm8-92.11C169.22,62.22,176.25,56,180,56s10.82,6.22,17.29,19.89c11.1,23.41,15.29,58,3.9,76.11H158.85C147.45,133.9,151.64,99.3,162.74,75.89Z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1f2937] font-[Manrope]">Footprint Scanner</h3>
                    <p className="text-sm text-[#4b5563] font-[Manrope]">
                      Understand your digital footprint and how it impacts your career prospects.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white py-20 sm:py-28">
              <div className="w-full px-4 sm:px-5 lg:px-6">
                <div className="mx-auto max-w-3xl text-center mb-16">
                  <h2 className="text-3xl font-extrabold text-[#1f2937] sm:text-4xl font-[Manrope]">Trusted by Job Seekers Across Africa & MENA</h2>
                  <p className="mt-4 text-lg text-[#4b5563] font-[Manrope]">
                    Hear from professionals who transformed their careers with UtopiaHire
                  </p>
                </div>
                <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl">
                        A
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 font-[Manrope]">Aisha Mohammed</h3>
                        <p className="text-sm text-gray-600 font-[Manrope]">Software Engineer, Lagos</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-indigo-600 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-[Manrope] leading-relaxed italic">
                      "The Resume Reviewer helped me identify gaps I never knew existed. Within two weeks, I landed interviews at 3 top tech companies!"
                    </p>
                    <div className="mt-6 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl">
                        O
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 font-[Manrope]">Omar El-Sayed</h3>
                        <p className="text-sm text-gray-600 font-[Manrope]">Senior Manager, Cairo</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-indigo-600 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-[Manrope] leading-relaxed italic">
                      "The AI Interviewer gave me the confidence I needed. Practicing with real-time feedback made all the difference in my final interviews."
                    </p>
                    <div className="mt-6 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl">
                        F
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 font-[Manrope]">Fatima Al-Rashid</h3>
                        <p className="text-sm text-gray-600 font-[Manrope]">Marketing Lead, Beirut</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-indigo-600 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <p className="text-gray-700 font-[Manrope] leading-relaxed italic">
                      "Job Matcher connected me with opportunities I would have never found. It's like having a personal career advisor 24/7!"
                    </p>
                    <div className="mt-6 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#f6f8f8] py-20 sm:py-28">
              <div className="w-full px-4 sm:px-5 lg:px-6">
                <div className="mx-auto max-w-2xl text-center">
                  <h2 className="text-3xl font-extrabold tracking-tighter text-[#1f2937] sm:text-4xl font-[Manrope]">
                    Ready to take the next step in your career?
                  </h2>
                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/sign-up"
                      className="flex h-12 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-8 text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.03] font-[Manrope]"
                    >
                      <span className="truncate">Get Started</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="bg-white border-t border-gray-200">
            <div className="w-full px-4 py-6 sm:px-5 lg:px-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex flex-wrap justify-center gap-4">
                  <a className="text-xs text-gray-500 hover:text-indigo-600 font-[Manrope] transition-colors" href="/privacy">
                    Privacy Policy
                  </a>
                  <a className="text-xs text-gray-500 hover:text-indigo-600 font-[Manrope] transition-colors" href="/terms">
                    Terms of Service
                  </a>
                  <a className="text-xs text-gray-500 hover:text-indigo-600 font-[Manrope] transition-colors" href="/contact">
                    Contact Us
                  </a>
                </div>
                <div className="text-xs text-gray-400">
                  <p className="font-[Manrope]">© 2025 UtopiaHire</p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </PageTransition>
  )
}
