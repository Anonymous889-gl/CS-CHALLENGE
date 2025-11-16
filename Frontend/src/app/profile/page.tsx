"use client"

import { useState, useEffect } from "react"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { User, Mail, Calendar, Briefcase, Clock, Users, Target, TrendingUp, Award, Edit2, Save, X, MapPin, DollarSign } from 'lucide-react'
import { useToast, ToastContainer } from "../../components/toast"

export default function ProfilePage() {
  const { success, error, toasts, removeToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [skillsArray, setSkillsArray] = useState<string[]>([])
  const [industriesArray, setIndustriesArray] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState('')
  const [currentIndustry, setCurrentIndustry] = useState('')
  const [memberSince, setMemberSince] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    location: "",
    salaryAmount: "",
    salaryCurrency: "USD",
    skills: "",
    interests: "",
    industries: "",
    photoVisibility: "public"
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
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
          const user = data.user
          
          setFormData({
            fullName: `${user.name} ${user.surname}`,
            email: user.email,
            location: user.location || "",
            salaryAmount: user.salaryAmount || "",
            salaryCurrency: user.salaryCurrency || "USD",
            skills: user.skills || "",
            interests: user.interests || "",
            industries: user.industries || "",
            photoVisibility: user.photoVisibility || "public"
          })
          
          // Initialize arrays for skills and industries
          setSkillsArray(user.skills ? user.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [])
          setIndustriesArray(user.industries ? user.industries.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [])
          const member = new Date(user.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
          setMemberSince(member);
          setProfileMetrics({
            skillsListed: parseSkills(user.skills || '').length,
            lastUpdated: new Date(user.updatedAt || user.createdAt).toLocaleDateString(),
            resumeScore: user.resumeScore || 0,
            interviewScore: user.interviewScore || 0,
            jobMatches: user.jobMatches || 0
          });
        } else {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        error("Fetch Failed", "Unable to load your profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Add skill with Enter key
  const addSkill = (skill: string) => {
    if (skill.trim() && !skillsArray.includes(skill.trim())) {
      const newSkills = [...skillsArray, skill.trim()]
      setSkillsArray(newSkills)
      setFormData(prev => ({ ...prev, skills: newSkills.join(', ') }))
      setCurrentSkill('')
    }
  }

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    const newSkills = skillsArray.filter(skill => skill !== skillToRemove)
    setSkillsArray(newSkills)
    setFormData(prev => ({ ...prev, skills: newSkills.join(', ') }))
  }

  // Add industry with Enter key
  const addIndustry = (industry: string) => {
    if (industry.trim() && !industriesArray.includes(industry.trim())) {
      const newIndustries = [...industriesArray, industry.trim()]
      setIndustriesArray(newIndustries)
      setFormData(prev => ({ ...prev, industries: newIndustries.join(', ') }))
      setCurrentIndustry('')
    }
  }

  // Remove industry
  const removeIndustry = (industryToRemove: string) => {
    const newIndustries = industriesArray.filter(industry => industry !== industryToRemove)
    setIndustriesArray(newIndustries)
    setFormData(prev => ({ ...prev, industries: newIndustries.join(', ') }))
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        window.location.href = '/login'
        return
      }

      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ')
      const name = nameParts[0] || ''
      const surname = nameParts.slice(1).join(' ') || ''

      const profileData = {
        name,
        surname,
        location: formData.location,
        salaryAmount: formData.salaryAmount,
        salaryCurrency: formData.salaryCurrency,
        skills: formData.skills,
        interests: formData.interests,
        industries: formData.industries,
        photoVisibility: formData.photoVisibility
      }

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        success("Profile Saved", "Your profile has been updated successfully!")
        setIsEditing(false)
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }
    } catch (err) {
      error("Save Failed", `Unable to save your profile: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Helper to parse skills into array
  const parseSkills = (skillsString: string) => {
    return skillsString ? skillsString.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []
  }

  const [profileMetrics, setProfileMetrics] = useState({
    skillsListed: 0,
    lastUpdated: '',
    resumeScore: 0,
    interviewScore: 0,
    jobMatches: 0
  });

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#f6f8f8]">
          <Header />
          <main className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
            </div>
          </main>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#f6f8f8]">
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-6 font-[Manrope]">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-gray-200 rounded-lg p-1">
              <TabsTrigger value="profile" className="transition-all duration-200 font-[Manrope] data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md">Profile Details</TabsTrigger>
              <TabsTrigger value="statistics" className="transition-all duration-200 font-[Manrope] data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md">Statistics & Tracking</TabsTrigger>
            </TabsList>

            {/* Profile Details Tab */}
            <TabsContent value="profile" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 font-[Manrope]">Profile Details</h1>
                  <p className="text-gray-600 mt-1 font-[Manrope]">Your professional profile information</p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700 font-[Manrope]">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="font-[Manrope]">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 font-[Manrope]">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Profile Card */}
                <Card className="lg:w-80 shrink-0 border border-gray-200 shadow-md">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">
                        {formData.fullName.split(' ')[0]?.charAt(0) || 'U'}{formData.fullName.split(' ')[1]?.charAt(0) || ''}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-[Manrope]">
                      {formData.fullName || 'User Name'}
                    </CardTitle>
                    <p className="text-gray-600 font-[Manrope]">Job Seeker</p>
                    <p className="text-sm text-gray-500 font-[Manrope]">{formData.location}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {formData.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Member since {memberSince}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-[Manrope]">{formData.salaryAmount ? `${formData.salaryAmount} ${formData.salaryCurrency}` : 'Salary not specified'}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 font-[Manrope]">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillsArray.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs hover:bg-gray-200 transition-colors duration-200 font-[Manrope] border border-gray-300">
                            {skill}
                          </Badge>
                        ))}
                        {skillsArray.length > 3 && (
                          <Badge variant="secondary" className="text-xs font-[Manrope] border border-gray-300">
                            +{skillsArray.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                <Card className="flex-1 border border-gray-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="font-[Manrope]">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Full Name</Label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="mt-2 bg-white font-[Manrope]"
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Email & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Email</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-2 bg-white font-[Manrope]"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Location (Country)</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="mt-2 bg-white font-[Manrope]"
                          placeholder="e.g., Egypt, United Kingdom, Germany"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Salary Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Salary Amount</Label>
                        <Input
                          type="number"
                          value={formData.salaryAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, salaryAmount: e.target.value }))}
                          placeholder="e.g., 75000"
                          className="mt-2 bg-white font-[Manrope]"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Currency</Label>
                        <Input
                          value={formData.salaryCurrency}
                          onChange={(e) => setFormData(prev => ({ ...prev, salaryCurrency: e.target.value }))}
                          placeholder="e.g., USD"
                          className="mt-2 bg-white font-[Manrope]"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <Label className="text-sm font-medium text-gray-500 mb-3 font-[Manrope]">Skills</Label>
                      {isEditing && (
                        <Input
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addSkill(currentSkill)
                            }
                          }}
                          placeholder="Type a skill and press Enter"
                          className="mt-2 bg-white font-[Manrope]"
                        />
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 p-3 border border-gray-200 rounded-md bg-white min-h-[60px]">
                        {skillsArray.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="font-[Manrope] border border-gray-400 bg-white hover:bg-gray-100">
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-gray-500 hover:text-red-500"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                        {skillsArray.length === 0 && (
                          <span className="text-gray-400 text-sm font-[Manrope]">No skills added yet</span>
                        )}
                      </div>
                    </div>

                    {/* Interests & Industries */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Interests</Label>
                        <Textarea
                          value={formData.interests}
                          onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                          rows={2}
                          className="mt-2 bg-white font-[Manrope]"
                          placeholder="e.g., AI, Machine Learning, Web Development"
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500 mb-2 font-[Manrope]">Industries</Label>
                        {isEditing && (
                          <Input
                            value={currentIndustry}
                            onChange={(e) => setCurrentIndustry(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addIndustry(currentIndustry)
                              }
                            }}
                            placeholder="Type an industry and press Enter"
                            className="mt-2 bg-white font-[Manrope]"
                          />
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 p-3 border border-gray-200 rounded-md bg-white min-h-[60px]">
                          {industriesArray.map((industry, index) => (
                            <Badge key={index} variant="secondary" className="font-[Manrope] border border-gray-400 bg-white hover:bg-gray-100">
                              {industry}
                              {isEditing && (
                                <button
                                  onClick={() => removeIndustry(industry)}
                                  className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                          {industriesArray.length === 0 && (
                            <span className="text-gray-400 text-sm font-[Manrope]">No industries added yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-[Manrope]">Statistics & Tracking</h1>
                <p className="text-gray-600 mt-1 font-[Manrope]">Monitor your job search progress and career development</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Resume Score</p>
                        <p className="text-2xl font-bold text-gray-900">{profileMetrics.resumeScore}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Skills Listed</p>
                        <p className="text-2xl font-bold text-gray-900">{profileMetrics.skillsListed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interview Score</p>
                        <p className="text-2xl font-bold text-gray-900">{profileMetrics.interviewScore}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Job Matches</p>
                        <p className="text-2xl font-bold text-gray-900">{profileMetrics.jobMatches}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Job Search Activity */}
              <Card className="border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Job Search Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Applications Sent</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Interviews Scheduled</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Skills Listed</p>
                      <p className="text-2xl font-bold text-gray-900">{profileMetrics.skillsListed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </PageTransition>
  )
}
