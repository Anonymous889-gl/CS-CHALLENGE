// Job Matching API utility functions
export interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  type: 'remote' | 'onsite' | 'hybrid'
  salary?: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  matchScore: number
  description: string
  requirements: string[]
  benefits?: string[]
  posted: string
  url?: string
}

export interface UserSkillProfile {
  primarySkills: string[]
  secondarySkills: string[]
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead'
  preferredTechnologies: string[]
  githubLanguages?: { [key: string]: number }
  stackOverflowTags?: string[]
  location?: string
  remote: boolean
  salaryExpectation?: {
    min: number
    max: number
    currency: string
  }
  industries?: string[]
}

// Mock job database (in production, this would come from job APIs)
const mockJobs: Omit<JobMatch, 'matchScore'>[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'TechCorp',
    location: 'London, UK',
    type: 'hybrid',
    salary: { min: 70000, max: 90000, currency: 'GBP' },
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    description: 'Join our growing team to build scalable web applications.',
    requirements: ['5+ years experience', 'React expertise', 'API development'],
    benefits: ['Health insurance', 'Flexible hours', 'Learning budget'],
    posted: '2024-01-15',
    url: 'https://example.com/job1'
  },
  {
    id: '2',
    title: 'Frontend React Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    type: 'remote',
    salary: { min: 50000, max: 70000, currency: 'USD' },
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Next.js'],
    description: 'Build beautiful user interfaces for our SaaS platform.',
    requirements: ['3+ years React', 'TypeScript proficiency', 'CSS expertise'],
    benefits: ['Remote work', 'Stock options', 'Unlimited PTO'],
    posted: '2024-01-10',
    url: 'https://example.com/job2'
  },
  {
    id: '3',
    title: 'Python Backend Engineer',
    company: 'DataTech Solutions',
    location: 'Berlin, Germany',
    type: 'onsite',
    salary: { min: 60000, max: 80000, currency: 'EUR' },
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'AWS'],
    description: 'Develop robust backend systems for data processing.',
    requirements: ['Python expertise', 'Database design', 'Cloud experience'],
    benefits: ['Relocation assistance', 'Tech conferences', 'Team events'],
    posted: '2024-01-12',
    url: 'https://example.com/job3'
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudNative Inc',
    location: 'Amsterdam, Netherlands',
    type: 'hybrid',
    salary: { min: 65000, max: 85000, currency: 'EUR' },
    skills: ['Docker', 'Kubernetes', 'AWS', 'Python', 'Terraform'],
    description: 'Manage cloud infrastructure and deployment pipelines.',
    requirements: ['Container orchestration', 'CI/CD pipelines', 'Cloud platforms'],
    benefits: ['Flexible schedule', 'Training budget', 'Bike allowance'],
    posted: '2024-01-08',
    url: 'https://example.com/job4'
  },
  {
    id: '5',
    title: 'Full Stack JavaScript Developer',
    company: 'InnovateLab',
    location: 'Paris, France',
    type: 'hybrid',
    salary: { min: 55000, max: 75000, currency: 'EUR' },
    skills: ['JavaScript', 'Vue.js', 'Node.js', 'MongoDB', 'Express'],
    description: 'Work on innovative web applications using modern JS stack.',
    requirements: ['Vue.js experience', 'Full stack development', 'Agile methodology'],
    benefits: ['Health coverage', 'Meal vouchers', 'Remote days'],
    posted: '2024-01-14',
    url: 'https://example.com/job5'
  }
]

// ---------------- Embedding helpers ----------------
const embeddingCache = new Map<string, number[]>()

async function getEmbedding(text: string): Promise<number[] | null> {
  const key = text
  if (embeddingCache.has(key)) return embeddingCache.get(key)!
  try {
    const res = await fetch('/api/embedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!res.ok) throw new Error('embed api error')
    const data = await res.json()
    const vec = data.vector as number[]
    if (Array.isArray(vec)) {
      embeddingCache.set(key, vec)
      return vec
    }
  } catch (e) {
    console.warn('Embedding fetch failed:', e)
  }
  return null
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-9)
}
// ----------------------------------------------------

// Calculate skill match score
function calculateSkillMatch(userSkills: string[], jobSkills: string[]): number {
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase())
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase())
  
  const matches = normalizedJobSkills.filter(jobSkill => 
    normalizedUserSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  )
  
  return Math.min(100, Math.round((matches.length / normalizedJobSkills.length) * 100))
}

// Calculate experience level match
function calculateExperienceMatch(userLevel: string, jobTitle: string): number {
  const title = jobTitle.toLowerCase()
  
  if (userLevel === 'junior') {
    if (title.includes('junior') || title.includes('entry')) return 100
    if (title.includes('mid') || (!title.includes('senior') && !title.includes('lead'))) return 70
    return 30
  }
  
  if (userLevel === 'mid') {
    if (title.includes('mid') || (!title.includes('junior') && !title.includes('senior'))) return 100
    if (title.includes('senior')) return 80
    if (title.includes('junior')) return 60
    return 70
  }
  
  if (userLevel === 'senior') {
    if (title.includes('senior') || title.includes('lead')) return 100
    if (title.includes('mid')) return 80
    return 60
  }
  
  if (userLevel === 'lead') {
    if (title.includes('lead') || title.includes('principal') || title.includes('architect')) return 100
    if (title.includes('senior')) return 90
    return 50
  }
  
  return 70
}

// Calculate location preference match
function calculateLocationMatch(userLocation: string | undefined, userRemote: boolean, job: Omit<JobMatch, 'matchScore'>): number {
  if (job.type === 'remote' && userRemote) return 100
  if (job.type === 'remote' && !userRemote) return 80
  
  if (userLocation && job.location.toLowerCase().includes(userLocation.toLowerCase())) {
    return job.type === 'hybrid' ? 95 : 100
  }
  
  if (job.type === 'hybrid' && userRemote) return 70
  if (job.type === 'onsite' && userRemote) return 30
  
  return 50
}

// Main job matching function
export async function findMatchingJobs(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const allSkills = [...userProfile.primarySkills, ...userProfile.secondarySkills]
  
  const jobsWithScores: JobMatch[] = await Promise.all(
    mockJobs.map(async job => {
      const skillMatch = calculateSkillMatch(allSkills, job.skills)
      const experienceMatch = calculateExperienceMatch(userProfile.experienceLevel, job.title)
      const locationMatch = calculateLocationMatch(userProfile.location, userProfile.remote, job)

      // Build summary texts for embeddings
      const profileText = `${userProfile.experienceLevel} ${allSkills.join(' ')}`.slice(0, 800)
      const jobText = `${job.title} ${job.description} ${job.skills.join(' ')}`.slice(0, 800)

      // Fetch or reuse vectors
      const [profileVec, jobVec] = await Promise.all([
        getEmbedding(profileText),
        getEmbedding(jobText)
      ])

      const embeddingSim = profileVec && jobVec ? Math.round(cosineSimilarity(profileVec, jobVec) * 100) : 0

      const legacy = (skillMatch * 0.5) + (experienceMatch * 0.3) + (locationMatch * 0.2)
      const matchScore = Math.round((embeddingSim * 0.6) + (legacy * 0.4))

      return { ...job, matchScore }
    })
  )
  
  // Sort by match score (highest first) and return top matches
  const sortedJobs = jobsWithScores.sort((a, b) => b.matchScore - a.matchScore)
  
  // If user has no skills (all jobs have 0% match), show some jobs anyway
  const hasAnySkills = userProfile.primarySkills.length > 0 || userProfile.secondarySkills.length > 0
  
  if (!hasAnySkills) {
    // Show first 10 jobs for users with no skills, but mark them as general matches
    return sortedJobs.slice(0, 10).map(job => ({
      ...job,
      matchScore: 5 // Give a small base score for entry-level positions
    }))
  }
  
  // Normal filtering for users with skills
  return sortedJobs.filter(job => job.matchScore >= 40)
}

// Generate user profile from user form data
export function generateUserProfileFromData(userData: {
  skills: string
  interests: string
  industries: string
  location: string
  salaryAmount: number
  salaryCurrency: string
  experience: string
}): UserSkillProfile {
  // Parse skills from comma-separated string
  const skillsArray = userData.skills ? userData.skills.split(',').map(s => s.trim()).filter(s => s) : []
  
  // Parse interests for additional skills
  const interestsArray = userData.interests ? userData.interests.split(',').map(s => s.trim()).filter(s => s) : []
  
  return {
    primarySkills: skillsArray.slice(0, 5), // First 5 skills as primary
    secondarySkills: skillsArray.slice(5, 10), // Next 5 as secondary
    experienceLevel: (userData.experience === 'entry' ? 'junior' : userData.experience) as 'junior' | 'mid' | 'senior' | 'lead',
    preferredTechnologies: interestsArray.slice(0, 5), // Use interests as preferred tech
    location: userData.location || 'Remote',
    remote: !userData.location || userData.location.toLowerCase().includes('remote'),
    salaryExpectation: {
      min: Math.max(0, userData.salaryAmount - 10000),
      max: userData.salaryAmount + 10000,
      currency: userData.salaryCurrency
    },
    industries: userData.industries ? userData.industries.split(',').map(s => s.trim()).filter(s => s) : []
  }
}

// Generate user profile from analysis data
export function generateUserProfile(
  githubAnalysis: any, 
  stackOverflowAnalysis: any,
  location?: string
): UserSkillProfile {
  const primarySkills: string[] = []
  const secondarySkills: string[] = []
  const preferredTechnologies: string[] = []
  
  // Extract skills from GitHub
  if (githubAnalysis) {
    const languages = Object.keys(githubAnalysis.languages || {})
    primarySkills.push(...languages.slice(0, 3)) // Top 3 languages
    secondarySkills.push(...languages.slice(3, 6)) // Next 3 languages
    
    // Add framework detection based on repos
    if (githubAnalysis.repositories) {
      githubAnalysis.repositories.forEach((repo: any) => {
        const description = (repo.description || '').toLowerCase()
        const name = repo.name.toLowerCase()
        
        if (description.includes('react') || name.includes('react')) {
          if (!primarySkills.includes('React')) preferredTechnologies.push('React')
        }
        if (description.includes('vue') || name.includes('vue')) {
          if (!primarySkills.includes('Vue.js')) preferredTechnologies.push('Vue.js')
        }
        if (description.includes('node') || name.includes('node')) {
          if (!primarySkills.includes('Node.js')) preferredTechnologies.push('Node.js')
        }
      })
    }
  }
  
  // Extract skills from Stack Overflow
  if (stackOverflowAnalysis) {
    const tags = stackOverflowAnalysis.topTags?.slice(0, 5) || []
    tags.forEach((tag: any) => {
      if (!primarySkills.includes(tag.name) && !secondarySkills.includes(tag.name)) {
        secondarySkills.push(tag.name)
      }
    })
  }
  
  // Determine experience level based on GitHub activity and SO reputation
  let experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' = 'mid'
  
  if (githubAnalysis && stackOverflowAnalysis) {
    const githubScore = githubAnalysis.stats?.contributionScore || 0
    const soReputation = stackOverflowAnalysis.user?.reputation || 0
    
    if (githubScore > 80 || soReputation > 10000) experienceLevel = 'senior'
    else if (githubScore > 60 || soReputation > 5000) experienceLevel = 'mid'
    else if (githubScore < 30 && soReputation < 1000) experienceLevel = 'junior'
  }
  
  return {
    primarySkills: Array.from(new Set(primarySkills)),
    secondarySkills: Array.from(new Set(secondarySkills)),
    experienceLevel,
    preferredTechnologies: Array.from(new Set(preferredTechnologies)),
    githubLanguages: githubAnalysis?.languages,
    stackOverflowTags: stackOverflowAnalysis?.topTags?.map((tag: any) => tag.name),
    location,
    remote: true // Default to remote preference
  }
}

// Production-ready API integrations
interface APIConfig {
  baseUrl: string
  headers: Record<string, string>
  rateLimit: number
  pricing: string
  coverage: string[]
}

export const JOB_API_CONFIGS: Record<string, APIConfig> = {
  // 🏆 RECOMMENDED: JSearch API (RapidAPI)
  jsearch: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    },
    rateLimit: 150, // requests per month (free tier)
    pricing: 'Free: 150/month, Pro: $10/month (1000 requests)',
    coverage: ['US', 'UK', 'Canada', 'Germany', 'France', 'Netherlands', 'Australia']
  },
  
  // 🥈 Adzuna API (Great for Europe)
  adzuna: {
    baseUrl: 'https://api.adzuna.com/v1/api/jobs',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.ADZUNA_APP_ID}:${process.env.ADZUNA_API_KEY}`).toString('base64')}`
    },
    rateLimit: 250, // requests per month (free tier)  
    pricing: 'Free: 250/month, Pro: £20/month (unlimited)',
    coverage: ['GB', 'DE', 'FR', 'NL', 'AU', 'US', 'CA']
  },
  
  // 🥉 Reed.co.uk API (UK only, but free)
  reed: {
    baseUrl: 'https://www.reed.co.uk/api/1.0/search',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.REED_API_KEY}:`).toString('base64')}`
    },
    rateLimit: -1, // unlimited
    pricing: 'Completely free',
    coverage: ['GB']
  }
}

// Real API integration functions
export async function fetchJobsFromJSearch(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('RAPIDAPI_KEY not configured, using mock data')
    return findMatchingJobs(userProfile) // fallback to mock
  }

  const searchQuery = userProfile.primarySkills.slice(0, 3).join(' ')
  const location = userProfile.location || 'United Kingdom'
  
  try {
    const response = await fetch(
      `${JOB_API_CONFIGS.jsearch.baseUrl}/search?` + new URLSearchParams({
        query: searchQuery,
        page: '1',
        num_pages: '1',
        date_posted: 'month',
        remote_jobs_only: userProfile.remote ? 'true' : 'false',
        employment_types: 'FULLTIME',
        job_requirements: userProfile.experienceLevel === 'junior' ? 'under_3_years_experience' : 
                          userProfile.experienceLevel === 'senior' ? 'more_than_3_years_experience' : 'no_requirements'
      }),
      {
        method: 'GET',
        headers: JOB_API_CONFIGS.jsearch.headers
      }
    )

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.data?.map((job: any, index: number): JobMatch => {
      const skills = extractSkillsFromDescription(job.job_description || '', userProfile.primarySkills)
      const matchScore = calculateSkillMatch(
        [...userProfile.primarySkills, ...userProfile.secondarySkills], 
        skills
      )
      
      return {
        id: job.job_id || `jsearch-${index}`,
        title: job.job_title || 'Untitled Position',
        company: job.employer_name || 'Unknown Company',
        location: job.job_location || location,
        type: job.job_is_remote ? 'remote' : 'onsite',
        description: job.job_description?.substring(0, 200) + '...' || 'No description available',
        requirements: job.job_highlights?.Qualifications || [],
        benefits: job.job_highlights?.Benefits || [],
        skills,
        matchScore,
        posted: job.job_posted_at_datetime_utc?.split('T')[0] || new Date().toISOString().split('T')[0],
        url: job.job_apply_link || job.job_url
      }
    }) || []
    
  } catch (error) {
    console.error('JSearch API error:', error)
    return findMatchingJobs(userProfile) // fallback to mock
  }
}

export async function fetchJobsFromAdzuna(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_API_KEY) {
    console.warn('Adzuna credentials not configured')
    return []
  }

  const country = userProfile.location?.toLowerCase().includes('uk') ? 'gb' : 'us'
  const searchQuery = userProfile.primarySkills.slice(0, 2).join(' ')
  
  try {
    const response = await fetch(
      `${JOB_API_CONFIGS.adzuna.baseUrl}/${country}/search/1?` + new URLSearchParams({
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: searchQuery,
        results_per_page: '10',
        sort_by: 'relevance'
      })
    )

    const data = await response.json()
    
    return data.results?.map((job: any, index: number): JobMatch => ({
      id: job.id || `adzuna-${index}`,
      title: job.title,
      company: job.company.display_name,
      location: `${job.location.area[0]}, ${job.location.area[1]}`,
      type: job.location.area.includes('Remote') ? 'remote' : 'onsite',
      salary: job.salary_min && job.salary_max ? {
        min: job.salary_min,
        max: job.salary_max,
        currency: country === 'gb' ? 'GBP' : 'USD'
      } : undefined,
      description: job.description.substring(0, 200) + '...',
      requirements: [],
      skills: extractSkillsFromDescription(job.description, userProfile.primarySkills),
      matchScore: calculateSkillMatch(
        [...userProfile.primarySkills, ...userProfile.secondarySkills],
        extractSkillsFromDescription(job.description, userProfile.primarySkills)
      ),
      posted: job.created.split('T')[0],
      url: job.redirect_url
    })) || []
    
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

export async function fetchJobsFromReed(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  if (!process.env.REED_API_KEY) {
    console.warn('Reed API key not configured')
    return []
  }

  const searchQuery = userProfile.primarySkills.slice(0, 2).join(' ')
  
  try {
    const response = await fetch(
      `${JOB_API_CONFIGS.reed.baseUrl}?` + new URLSearchParams({
        keywords: searchQuery,
        resultsToTake: '10',
        locationName: userProfile.location || 'London'
      }),
      {
        headers: JOB_API_CONFIGS.reed.headers
      }
    )

    const data = await response.json()
    
    return data.results?.map((job: any, index: number): JobMatch => ({
      id: job.jobId?.toString() || `reed-${index}`,
      title: job.jobTitle,
      company: job.employerName,
      location: job.locationName,
      type: job.locationName.toLowerCase().includes('remote') ? 'remote' : 'onsite',
      salary: job.minimumSalary && job.maximumSalary ? {
        min: job.minimumSalary,
        max: job.maximumSalary,
        currency: 'GBP'
      } : undefined,
      description: job.jobDescription?.substring(0, 200) + '...' || 'No description available',
      requirements: [],
      skills: extractSkillsFromDescription(job.jobDescription || '', userProfile.primarySkills),
      matchScore: calculateSkillMatch(
        [...userProfile.primarySkills, ...userProfile.secondarySkills],
        extractSkillsFromDescription(job.jobDescription || '', userProfile.primarySkills)
      ),
      posted: job.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      url: job.jobUrl
    })) || []
    
  } catch (error) {
    console.error('Reed API error:', error)
    return []
  }
}

// Helper function to extract skills from job description
function extractSkillsFromDescription(description: string, userSkills: string[]): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'HTML',
    'CSS', 'SCSS', 'Tailwind', 'Bootstrap', 'REST API', 'GraphQL', 'Microservices'
  ]
  
  const foundSkills: string[] = []
  const lowerDescription = description.toLowerCase()
  
  // Check for user's skills first (higher priority)
  userSkills.forEach(skill => {
    if (lowerDescription.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })
  
  // Check for common skills
  commonSkills.forEach(skill => {
    if (lowerDescription.includes(skill.toLowerCase()) && !foundSkills.includes(skill)) {
      foundSkills.push(skill)
    }
  })
  
  return foundSkills.slice(0, 8) // Limit to 8 skills
}

// Main function that uses the API route
export async function findMatchingJobsProduction(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userProfile })
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    return data.jobs || []
    
  } catch (error) {
    console.error('Error fetching jobs from API route:', error)
    // Fallback to mock data
    return findMatchingJobs(userProfile)
  }
}
