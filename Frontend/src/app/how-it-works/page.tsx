"use client"

import Header from "../../components/header"
import PageTransition from "../../components/page-transition"

export default function HowItWorksPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white font-[Manrope] text-[#1f2937]">
        <Header />

        {/* Main Content */}
        <main className="py-20">
          <div className="w-full px-4 sm:px-5 lg:px-6">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 font-[Manrope]">
                Your Career Journey, Supercharged by AI
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto font-[Manrope]">
                Follow our simple, streamlined process to unlock your full potential and land your dream job in Africa
                and the MENA region.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left side - Image */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-gradient-to-br from-[indigo-600] to-[#0ea5e9] rounded-xl p-8 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="material-symbols-outlined text-6xl mb-4">trending_up</span>
                    <p className="text-xl font-bold font-[Manrope]">Your Career Journey</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">A Proven Path to Success</h3>
                  <p className="text-gray-600 font-[Manrope]">
                    Each step is meticulously designed to build upon the last, guiding you from resume optimization to a
                    successful job offer.
                  </p>
                </div>
              </div>

              {/* Right side - Steps */}
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[indigo-600] text-white rounded-full flex items-center justify-center font-semibold font-[Manrope]">
                      1
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">Upload Your Resume</h3>
                    <p className="text-gray-600 font-[Manrope]">
                      Begin by securely uploading your resume. Our platform supports various formats, and we prioritize
                      your data's confidentiality.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[indigo-600] text-white rounded-full flex items-center justify-center font-semibold font-[Manrope]">
                      2
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">AI-Powered Analysis</h3>
                    <p className="text-gray-600 font-[Manrope]">
                      Our advanced AI analyzes your resume against industry benchmarks, checking for optimization,
                      formatting, and keyword relevance.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[indigo-600] text-white rounded-full flex items-center justify-center font-semibold font-[Manrope]">
                      3
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">
                      Get Personalized Feedback
                    </h3>
                    <p className="text-gray-600 font-[Manrope]">
                      Receive a detailed report with actionable insights to improve your resume's effectiveness and
                      appeal to employers.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[indigo-600] text-white rounded-full flex items-center justify-center font-semibold font-[Manrope]">
                      4
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">Practice & Prepare</h3>
                    <p className="text-gray-600 font-[Manrope]">
                      Utilize our AI-driven interview simulator to hone your skills and get real-time feedback for
                      ultimate confidence.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-[indigo-600] text-white rounded-full flex items-center justify-center font-semibold font-[Manrope]">
                      5
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-[Manrope]">
                      Connect with Opportunities
                    </h3>
                    <p className="text-gray-600 font-[Manrope]">
                      Our intelligent system matches your profile with top job openings that align perfectly with your
                      skills and aspirations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8">
          <div className="w-full px-4 sm:px-5 lg:px-6">
            <div className="text-center">
              <p className="text-gray-500 text-sm font-[Manrope]">© 2025 UtopiaHire. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-1 font-[Manrope]">
                Building fair and accessible career paths across Africa & the MENA region.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
