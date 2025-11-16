"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  })
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({ email: "", password: "" })

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        router.push("/dashboard")
      } else {
        setErrors({ email: data.error || "Login failed", password: "" })
      }
    } catch (error) {
      setErrors({ email: "Network error. Make sure backend is running.", password: "" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-white font-[Manrope] text-[#343A40]">
        <Header />

        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-20 sm:px-5 lg:px-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#212529]">Welcome Back</h1>
              <p className="mt-2 text-[#868E96]">Login to continue your journey with UtopiaHire.</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-[#F8F9FA] border-2 border-[#E9ECEF] hover:bg-[#F1F3F5] transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    ></path>
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    ></path>
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span className="font-medium text-[#495057]">Continue with Google</span>
                </button>
              </div>
              <div className="flex items-center">
                <hr className="flex-grow border-[#E9ECEF]" />
                <span className="px-4 text-sm text-[#ADB5BD]">OR</span>
                <hr className="flex-grow border-[#E9ECEF]" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#495057]" htmlFor="email">
                    Email address
                  </label>
                  <input
                    className="form-input w-full rounded-lg border-2 border-[#CED4DA] bg-[#F8F9FA] focus:border-indigo-600 focus:ring-indigo-600 focus:ring-opacity-50 transition py-3 px-4 text-base autofill:bg-[#F8F9FA] autofill:text-[#495057]"
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px #F8F9FA inset',
                      WebkitTextFillColor: '#495057'
                    }}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-[#495057]" htmlFor="password">
                    Password
                  </label>
                  <div className="relative overflow-visible">
                    <input
                      className="form-input w-full rounded-lg border-2 border-[#CED4DA] bg-[#F8F9FA] focus:border-indigo-600 focus:ring-indigo-600 focus:ring-opacity-50 transition py-3 px-4 pr-16 text-base autofill:bg-[#F8F9FA] autofill:text-[#495057]"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #F8F9FA inset',
                        WebkitTextFillColor: '#495057'
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 text-[#ADB5BD] hover:text-[#495057] transition-colors z-10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a10.053 10.053 0 00-1.563 3.029M9.878 9.878l4.242 4.242m0 0L16.536 16.536a10.053 10.053 0 001.563-3.029M14.12 14.12l1.414 1.414" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <a className="text-sm text-indigo-600 hover:underline" href="#">
                    Forgot password?
                  </a>
                </div>
                <button
                  className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging In..." : "Log In"}
                </button>
              </form>
              <p className="text-center text-sm text-[#868E96]">
                Don't have an account?{" "}
                <Link className="font-medium text-indigo-600 hover:underline" href="/sign-up">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
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
    </PageTransition>
  )
}
