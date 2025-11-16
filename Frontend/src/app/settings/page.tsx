"use client"

import { useState, useEffect } from "react"
import Header from "../../components/header"
import PageTransition from "../../components/page-transition"
import { useToast, ToastContainer } from "../../components/toast"
import { motion } from "framer-motion"
import { UserSkillProfile } from "../../utils/job-matching"
import { analyzeStackOverflowProfile, extractStackOverflowUserId } from "../../utils/stackoverflow-api"

export default function Settings() {
  const { success, error, warning, toasts, removeToast } = useToast()
  
  const [githubUsername, setGithubUsername] = useState("")
  const [stackOverflowId, setStackOverflowId] = useState("")
  const [isAnalyzingGithub, setIsAnalyzingGithub] = useState(false)
  const [isAnalyzingStackOverflow, setIsAnalyzingStackOverflow] = useState(false)
  const [connectedProfiles, setConnectedProfiles] = useState<{
    github?: string
    stackoverflow?: string
    lastAnalyzed?: string
  }>({})
  const [extractedProfile, setExtractedProfile] = useState<UserSkillProfile | null>(null)

  // Load existing connections
  useEffect(() => {
    const savedConnections = localStorage.getItem('connectedProfiles')
    const savedProfile = localStorage.getItem('recentProfileAnalysis')
    
    if (savedConnections) {
      try {
        setConnectedProfiles(JSON.parse(savedConnections))
      } catch (e) {
        console.error('Failed to load connections:', e)
      }
    }
    
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        setExtractedProfile(parsed.userProfile)
      } catch (e) {
        console.error('Failed to load profile:', e)
      }
    }
  }, [])

  /*
   * NOTE: replaced by shared utils/analyzeStackOverflowProfile import
   */
  /* const analyzeStackOverflowProfile = async (userId: string) => {
    try {
      const id = extractStackOverflowUserId(userId)
      const response = await fetch(`https://api.stackexchange.com/2.3/users/${id}/tags?order=desc&sort=popular&site=stackoverflow&pagesize=20`)
      
      if (!response.ok) {
        throw new Error(`StackOverflow API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.items || data.items.length === 0) {
        throw new Error('No tags found for this user')
      }
      
      // Extract skills from top tags
      const topTags = data.items.map((tag: any) => ({
        name: tag.name,
        count: tag.count
      }))
      
      const skills = topTags.map((tag: any) => {
        // Convert common tags to readable skills
        const skillMap: { [key: string]: string } = {
          'javascript': 'JavaScript',
          'python': 'Python',
          'java': 'Java',
          'c#': 'C#',
          'php': 'PHP',
          'html': 'HTML',
          'css': 'CSS',
          'react': 'React',
          'node.js': 'Node.js',
          'angular': 'Angular',
          'vue.js': 'Vue.js',
          'typescript': 'TypeScript',
          'sql': 'SQL',
          'mysql': 'MySQL',
          'postgresql': 'PostgreSQL',
          'mongodb': 'MongoDB',
          'express': 'Express',
          'django': 'Django',
          'flask': 'Flask',
          'spring': 'Spring',
          'git': 'Git',
          'docker': 'Docker',
          'aws': 'AWS',
          'azure': 'Azure'
        }
        
        return skillMap[tag.name.toLowerCase()] || tag.name
      })
      
      return {
        skills: skills.slice(0, 10),
        topTags: topTags.slice(0, 10),
        totalAnswers: data.items.reduce((sum: number, tag: any) => sum + tag.count, 0)
      }
      
    } catch (error) {
      console.error('StackOverflow analysis error:', error)
      throw error
    }
  }
*/

  const analyzeGitHubProfile = async (username: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      
      const repos = await response.json()
      
      // Extract languages and skills from repos
      const languages = new Set<string>()
      const frameworks = new Set<string>()
      
      repos.forEach((repo: any) => {
        if (repo.language) {
          languages.add(repo.language)
        }
        
        // Extract frameworks from repo names and descriptions
        const text = `${repo.name} ${repo.description || ''}`.toLowerCase()
        
        // Common frameworks/technologies
        if (text.includes('react')) frameworks.add('React')
        if (text.includes('vue')) frameworks.add('Vue.js')
        if (text.includes('angular')) frameworks.add('Angular')
        if (text.includes('node')) frameworks.add('Node.js')
        if (text.includes('express')) frameworks.add('Express')
        if (text.includes('django')) frameworks.add('Django')
        if (text.includes('flask')) frameworks.add('Flask')
        if (text.includes('spring')) frameworks.add('Spring')
        if (text.includes('docker')) frameworks.add('Docker')
        if (text.includes('kubernetes')) frameworks.add('Kubernetes')
      })
      
      return {
        languages: Array.from(languages),
        frameworks: Array.from(frameworks),
        repoCount: repos.length,
        topLanguages: Array.from(languages).slice(0, 5)
      }
      
    } catch (error) {
      console.error('GitHub analysis error:', error)
      throw error
    }
  }

  const handleConnectGitHub = async () => {
    if (!githubUsername.trim()) {
      warning("Missing Username", "Please enter a GitHub username")
      return
    }

    setIsAnalyzingGithub(true)
    
    try {
      const githubData = await analyzeGitHubProfile(githubUsername.trim())
      
      // Merge with existing profile or create new one
      const existingProfile = extractedProfile || {
        primarySkills: [],
        secondarySkills: [],
        experienceLevel: 'mid' as const,
        preferredTechnologies: [],
        remote: true
      }
      
      // Combine StackOverflow and GitHub skills
      const githubSkills = [...githubData.languages, ...githubData.frameworks]
      const combinedPrimarySkills = [
        ...existingProfile.primarySkills,
        ...githubSkills.slice(0, 4)
      ]
      
      const userProfile: UserSkillProfile = {
        ...existingProfile,
        primarySkills: Array.from(new Set(combinedPrimarySkills)).slice(0, 8),
        secondarySkills: Array.from(new Set([
          ...existingProfile.secondarySkills,
          ...githubSkills.slice(4, 8)
        ])).slice(0, 6),
        experienceLevel: githubData.repoCount > 20 ? 'senior' : githubData.repoCount > 5 ? 'mid' : 'junior',
        preferredTechnologies: Array.from(new Set([
          ...existingProfile.preferredTechnologies,
          ...githubSkills.slice(0, 6)
        ])).slice(0, 8),
        location: existingProfile.location || 'Global',
        remote: true
      }
      
      // Save connections and profile
      const updatedConnections = {
        ...connectedProfiles,
        github: githubUsername.trim(),
        lastAnalyzed: new Date().toISOString()
      }
      
      setConnectedProfiles(updatedConnections)
      setExtractedProfile(userProfile)
      
      localStorage.setItem('connectedProfiles', JSON.stringify(updatedConnections))
      localStorage.setItem('recentProfileAnalysis', JSON.stringify({
        userProfile,
        source: connectedProfiles.stackoverflow ? 'stackoverflow+github' : 'github',
        timestamp: Date.now()
      }))
      
      success("GitHub Connected", `Successfully analyzed ${githubData.repoCount} repositories and extracted ${userProfile.primarySkills.length} skills`)
      
    } catch (err) {
      console.error('GitHub connection error:', err)
      error("Connection Failed", "Failed to analyze GitHub profile. Please check the username and try again.")
    } finally {
      setIsAnalyzingGithub(false)
    }
  }

  const handleConnectStackOverflow = async () => {
    if (!stackOverflowId.trim()) {
      warning("Missing User ID", "Please enter a StackOverflow user ID")
      return
    }

    setIsAnalyzingStackOverflow(true)
    
    try {
      const parsedId = extractStackOverflowUserId(stackOverflowId.trim())
      if (!/^[0-9]+$/.test(parsedId)) {
        warning("Invalid User ID", "Please enter a valid numeric StackOverflow user ID or profile URL")
        setIsAnalyzingStackOverflow(false)
        return
      }
      const stackOverflowData = await analyzeStackOverflowProfile(parsedId)
      
      // Merge with existing profile or create new one
      const existingProfile = extractedProfile || {
        primarySkills: [],
        secondarySkills: [],
        experienceLevel: 'mid' as const,
        preferredTechnologies: [],
        remote: true
      }
      
      const soSkills = stackOverflowData.topTags.map((tag) => tag.name)
      // Combine GitHub and StackOverflow skills
      const combinedPrimarySkills = [
        ...existingProfile.primarySkills,
        ...soSkills.slice(0, 4)
      ]
      
      const userProfile: UserSkillProfile = {
        ...existingProfile,
        primarySkills: Array.from(new Set(combinedPrimarySkills)).slice(0, 8),
        secondarySkills: Array.from(new Set([
          ...existingProfile.secondarySkills,
          ...soSkills.slice(4, 8)
        ])).slice(0, 6),
        stackOverflowTags: stackOverflowData.topTags.map((tag: any) => tag.name),
        preferredTechnologies: Array.from(new Set([
          ...existingProfile.preferredTechnologies,
          ...soSkills.slice(0, 6)
        ])).slice(0, 8)
      }
      
      // Save connections and profile
      const updatedConnections = {
        ...connectedProfiles,
        stackoverflow: parsedId,
        lastAnalyzed: new Date().toISOString()
      }
      
      setConnectedProfiles(updatedConnections)
      setExtractedProfile(userProfile)
      
      localStorage.setItem('connectedProfiles', JSON.stringify(updatedConnections))
      localStorage.setItem('recentProfileAnalysis', JSON.stringify({
        userProfile,
        source: connectedProfiles.github ? 'github+stackoverflow' : 'stackoverflow',
        timestamp: Date.now()
      }))
      
      success("StackOverflow Connected", `Successfully analyzed ${stackOverflowData.topTags.length} tags and extracted ${soSkills.length} skills`)
      
    } catch (err) {
      console.error('StackOverflow connection error:', err)
      error("Connection Failed", "Failed to analyze StackOverflow profile. Please check the user ID and try again.")
    } finally {
      setIsAnalyzingStackOverflow(false)
    }
  }

  const handleDisconnectStackOverflow = () => {
    const updatedConnections = { ...connectedProfiles }
    delete updatedConnections.stackoverflow
    
    setConnectedProfiles(updatedConnections)
    localStorage.setItem('connectedProfiles', JSON.stringify(updatedConnections))
    
    warning("StackOverflow Disconnected", "StackOverflow profile has been disconnected")
  }

  const handleDisconnectGitHub = () => {
    const updatedConnections = { ...connectedProfiles }
    delete updatedConnections.github
    
    setConnectedProfiles(updatedConnections)
    localStorage.setItem('connectedProfiles', JSON.stringify(updatedConnections))
    
    warning("GitHub Disconnected", "GitHub profile has been disconnected")
  }

  const handleClearAllData = () => {
    localStorage.removeItem('connectedProfiles')
    localStorage.removeItem('recentProfileAnalysis')
    localStorage.removeItem('savedJobs')
    
    setConnectedProfiles({})
    setExtractedProfile(null)
    
    warning("Data Cleared", "All profile data and saved jobs have been cleared")
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full flex-col bg-[#f6f8f8]">
        <Header />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-[Manrope]">Settings</h1>
              <p className="text-gray-600 font-[Manrope] mt-2">
                Manage your profile connections and preferences
              </p>
            </div>

            {/* Profile Connections */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-[Manrope] mb-6">Profile Connections</h2>
              
              {/* GitHub Connection */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">GH</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-[Manrope]">GitHub</h3>
                    <p className="text-sm text-gray-600 font-[Manrope]">Connect your GitHub to extract skills from repositories</p>
                  </div>
                </div>

                {connectedProfiles.github ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                      <div>
                        <p className="font-medium text-green-800 font-[Manrope]">Connected to @{connectedProfiles.github}</p>
                        <p className="text-sm text-green-600 font-[Manrope]">
                          Last analyzed: {new Date(connectedProfiles.lastAnalyzed || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectGitHub}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors font-[Manrope]"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter GitHub username"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-[Manrope] bg-white text-gray-900 placeholder-gray-500"
                        disabled={isAnalyzingGithub}
                      />
                      <button
                        onClick={handleConnectGitHub}
                        disabled={isAnalyzingGithub}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-[Manrope]"
                      >
                        {isAnalyzingGithub ? 'Analyzing...' : 'Connect'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* StackOverflow Connection */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">SO</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 font-[Manrope]">Stack Overflow</h3>
                    <p className="text-sm text-gray-600 font-[Manrope]">Connect your Stack Overflow to extract skills from your activity</p>
                  </div>
                </div>

                {connectedProfiles.stackoverflow ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                      <div>
                        <p className="font-medium text-green-800 font-[Manrope]">Connected to User ID: {connectedProfiles.stackoverflow}</p>
                        <p className="text-sm text-green-600 font-[Manrope]">
                          Last analyzed: {new Date(connectedProfiles.lastAnalyzed || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectStackOverflow}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors font-[Manrope]"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter StackOverflow User ID"
                        value={stackOverflowId}
                        onChange={(e) => setStackOverflowId(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-[Manrope] bg-white text-gray-900 placeholder-gray-500"
                        disabled={isAnalyzingStackOverflow}
                      />
                      <button
                        onClick={handleConnectStackOverflow}
                        disabled={isAnalyzingStackOverflow}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-[Manrope]"
                      >
                        {isAnalyzingStackOverflow ? 'Analyzing...' : 'Connect'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-[Manrope]">
                      Find your User ID in your StackOverflow profile URL: stackoverflow.com/users/<strong>YOUR_ID</strong>/username
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Profile Summary */}
            {extractedProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 font-[Manrope] mb-6">Extracted Profile</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 font-[Manrope] mb-3">Primary Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedProfile.primarySkills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-indigo-600/10 text-indigo-600 text-sm rounded-full font-medium font-[Manrope]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 font-[Manrope] mb-3">Experience Level</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium font-[Manrope] capitalize">
                      {extractedProfile.experienceLevel}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data Management */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 font-[Manrope] mb-6">Data Management</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 font-[Manrope]">Clear All Data</h3>
                    <p className="text-sm text-gray-600 font-[Manrope]">Remove all saved profile data and job bookmarks</p>
                  </div>
                  <button
                    onClick={handleClearAllData}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-[Manrope]"
                  >
                    Clear Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </PageTransition>
  )
}
