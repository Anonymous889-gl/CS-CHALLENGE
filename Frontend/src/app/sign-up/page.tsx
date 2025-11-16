"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { CustomSelect } from "../../components/ui/custom-select"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    location: ""
  })
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    location: "",
    profilePhoto: null as File | null
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const router = useRouter()

  // Predefined locations for Africa and MENA region
  const locations = [
    { value: "cairo-egypt", label: "Cairo, Egypt" },
    { value: "alexandria-egypt", label: "Alexandria, Egypt" },
    { value: "lagos-nigeria", label: "Lagos, Nigeria" },
    { value: "nairobi-kenya", label: "Nairobi, Kenya" },
    { value: "cape-town-south-africa", label: "Cape Town, South Africa" },
    { value: "johannesburg-south-africa", label: "Johannesburg, South Africa" },
    { value: "casablanca-morocco", label: "Casablanca, Morocco" },
    { value: "tunis-tunisia", label: "Tunis, Tunisia" },
    { value: "algiers-algeria", label: "Algiers, Algeria" },
    { value: "dubai-uae", label: "Dubai, UAE" },
    { value: "abu-dhabi-uae", label: "Abu Dhabi, UAE" },
    { value: "riyadh-saudi", label: "Riyadh, Saudi Arabia" },
    { value: "jeddah-saudi", label: "Jeddah, Saudi Arabia" },
    { value: "doha-qatar", label: "Doha, Qatar" },
    { value: "kuwait-city-kuwait", label: "Kuwait City, Kuwait" },
    { value: "manama-bahrain", label: "Manama, Bahrain" },
    { value: "muscat-oman", label: "Muscat, Oman" },
    { value: "beirut-lebanon", label: "Beirut, Lebanon" },
    { value: "amman-jordan", label: "Amman, Jordan" },
    { value: "tehran-iran", label: "Tehran, Iran" },
    { value: "istanbul-turkey", label: "Istanbul, Turkey" },
    { value: "ankara-turkey", label: "Ankara, Turkey" },
    { value: "remote-africa", label: "Remote (Africa)" },
    { value: "remote-mena", label: "Remote (MENA)" },
    { value: "remote-global", label: "Remote (Global)" }
  ]

  // Simplified country list (no cities) as requested
  const countries = [
    { value: "egypt", label: "Egypt" },
    { value: "nigeria", label: "Nigeria" },
    { value: "kenya", label: "Kenya" },
    { value: "south-africa", label: "South Africa" },
    { value: "morocco", label: "Morocco" },
    { value: "tunisia", label: "Tunisia" },
    { value: "algeria", label: "Algeria" },
    { value: "uae", label: "United Arab Emirates" },
    { value: "saudi-arabia", label: "Saudi Arabia" },
    { value: "qatar", label: "Qatar" },
    { value: "kuwait", label: "Kuwait" },
    { value: "bahrain", label: "Bahrain" },
    { value: "oman", label: "Oman" },
    { value: "lebanon", label: "Lebanon" },
    { value: "jordan", label: "Jordan" },
    { value: "iran", label: "Iran" },
    { value: "turkey", label: "Turkey" },
    { value: "remote-africa", label: "Remote (Africa)" },
    { value: "remote-mena", label: "Remote (MENA)" },
    { value: "remote-global", label: "Remote (Global)" }
  ]

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB')
        return
      }

      setFormData(prev => ({ ...prev, profilePhoto: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }))
    setPhotoPreview(null)
  }

  const validateForm = () => {
    const newErrors = {
      name: "",
      surname: "",
      email: "",
      password: "",
      location: ""
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({
      name: "",
      surname: "",
      email: "",
      password: "",
      location: ""
    })

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('surname', formData.surname)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('role', 'job_seeker') // Default role
      formDataToSend.append('location', formData.location)
      
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto)
      }

      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token)
        }
        router.push("/complete-profile")
      } else {
        // Handle validation errors
        if (data.error) {
          setErrors({ 
            email: data.error.includes('email') ? data.error : "",
            password: data.error.includes('password') ? data.error : "",
            name: data.error.includes('name') ? data.error : "",
            surname: data.error.includes('surname') ? data.error : "",
            location: data.error.includes('location') ? data.error : ""
          })
        }
      }
    } catch (error) {
      setErrors({ 
        email: "Network error. Make sure backend is running.",
        name: "",
        surname: "",
        password: "",
        location: ""
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f8] font-[Manrope] text-gray-800">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-5 lg:px-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Join UtopiaHire</h1>
              <p className="mt-4 text-gray-600">
                Sign up to connect with top talent or find your dream job in Africa and the MENA region.
              </p>
            </div>
            <div className="space-y-6 rounded-xl bg-white p-6 shadow-lg border-2 border-gray-200 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <input
                      className={`w-full rounded-lg bg-[#f6f8f8] p-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-indigo-600 transition-colors autofill:bg-[#f6f8f8] autofill:text-gray-900 border-2 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #f6f8f8 inset',
                        WebkitTextFillColor: '#111827'
                      }}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 font-[Manrope]">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full rounded-lg bg-[#f6f8f8] p-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-indigo-600 transition-colors autofill:bg-[#f6f8f8] autofill:text-gray-900 border-2 ${errors.surname ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Surname"
                      type="text"
                      value={formData.surname}
                      onChange={(e) => handleInputChange('surname', e.target.value)}
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #f6f8f8 inset',
                        WebkitTextFillColor: '#111827'
                      }}
                    />
                    {errors.surname && (
                      <p className="mt-1 text-sm text-red-600 font-[Manrope]">{errors.surname}</p>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    className={`w-full rounded-lg bg-[#f6f8f8] p-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-indigo-600 transition-colors autofill:bg-[#f6f8f8] autofill:text-gray-900 border-2 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    placeholder="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{
                      WebkitBoxShadow: '0 0 0 1000px #f6f8f8 inset',
                      WebkitTextFillColor: '#111827'
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-[Manrope]">{errors.email}</p>
                  )}
                </div>
                <div>
                  <CustomSelect
                    value={formData.location}
                    onChange={(value) => handleInputChange("location", value)}
                    options={countries.map(c => ({
                      value: c.value,
                      label: c.label
                    }))}
                    placeholder="Select your location"
                    className={`h-14 ${errors.location ? 'border-red-500' : ''}`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600 font-[Manrope]">{errors.location}</p>
                  )}
                </div>
                <div>
                  <div className="relative overflow-visible">
                    <input
                      className={`w-full rounded-lg bg-[#f6f8f8] p-4 pr-16 text-gray-900 placeholder:text-gray-400 focus:border-indigo-600 focus:ring-indigo-600 transition-colors autofill:bg-[#f6f8f8] autofill:text-gray-900 border-2 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      style={{
                        WebkitBoxShadow: '0 0 0 1000px #f6f8f8 inset',
                        WebkitTextFillColor: '#111827'
                      }}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 font-[Manrope]">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-[Manrope]">
                    Profile Photo <span className="text-gray-500">(Optional)</span>
                  </label>
                  {photoPreview ? (
                    <div className="flex items-center gap-4 p-4 bg-[#f6f8f8] rounded-lg border border-gray-300">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 font-[Manrope]">Photo selected</p>
                        <p className="text-xs text-gray-500 font-[Manrope]">Ready to upload</p>
                      </div>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-red-500 hover:text-red-700 text-sm font-medium font-[Manrope]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <div className="w-full p-4 border border-dashed border-gray-300 rounded-lg bg-[#f6f8f8] hover:border-indigo-600 transition-colors text-center">
                        <span className="material-symbols-outlined text-gray-400 text-2xl mb-2 block">add_a_photo</span>
                        <p className="text-sm text-gray-600 font-[Manrope] mb-1">Add a professional photo</p>
                        <p className="text-xs text-gray-500 font-[Manrope]">JPG, PNG up to 5MB</p>
                      </div>
                    </label>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1">
                <button className="flex items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-[#f6f8f8] px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
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
                  Google
                </button>
              </div>
            </div>
          </div>
        </main>

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
