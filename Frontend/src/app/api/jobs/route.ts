import { NextRequest, NextResponse } from 'next/server'
import { UserSkillProfile, JobMatch } from '../../../utils/job-matching'

// JSearch API integration
async function fetchJobsFromJSearch(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  console.log('🚀 JSearch API called')
  
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('❌ RAPIDAPI_KEY not configured')
    return []
  }
  
  console.log('✅ RAPIDAPI_KEY is configured')

  const searchQuery = userProfile.primarySkills?.slice(0, 3).join(' ') || ''
  console.log('🔎 Search query:', searchQuery)
  console.log('👤 User skills:', userProfile.primarySkills)
  console.log('🔍 Profile location:', userProfile.location)
  
  // Check if we have valid skills
  if (!userProfile.primarySkills || userProfile.primarySkills.length === 0) {
    console.warn('⚠️ No primary skills found in user profile')
  }
  
  try {
    // Build clean search query
    const cleanQuery = searchQuery || 'software developer'
    console.log('🔄 Making API request with query:', cleanQuery)
    
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(cleanQuery)}&page=1&num_pages=1`
    console.log('🌐 API URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    console.log('📡 API Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ JSearch API error details:')
      console.error('- Status:', response.status)
      console.error('- Status Text:', response.statusText)
      console.error('- Response:', errorText)
      console.error('- Headers:', Object.fromEntries(response.headers.entries()))
      throw new Error(`JSearch API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 JSearch API response:', data.data?.length || 0, 'jobs')
    
    return data.data?.map((job: any, index: number): JobMatch => {
      const skills = extractSkillsFromDescription(job.job_description || '', userProfile.primarySkills)
      const matchScore = calculateSkillMatch(
        [...userProfile.primarySkills, ...userProfile.secondarySkills], 
        skills,
        job.job_title
      )
      
      return {
        id: job.job_id || `jsearch-${index}`,
        title: job.job_title || 'Untitled Position',
        company: job.employer_name || 'Unknown Company',
        location: job.job_location || 'Location not specified',
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
    console.error('🔥 JSearch API error:', error)
    
    // Try a simple test request to see if API key works
    try {
      console.log('🧪 Testing basic API connectivity...')
      const testResponse = await fetch('https://jsearch.p.rapidapi.com/search?query=developer&page=1', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      })
      console.log('🧪 Test response status:', testResponse.status)
      if (testResponse.ok) {
        console.log('✅ API key works, issue was with our query')
      }
    } catch (testError) {
      console.error('🧪 Test request also failed:', testError)
    }
    
    return []
  }
}

// Adzuna API integration
async function fetchJobsFromAdzuna(userProfile: UserSkillProfile): Promise<JobMatch[]> {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_API_KEY) {
    console.warn('Adzuna credentials not configured')
    return []
  }

  const country = userProfile.location?.toLowerCase().includes('uk') ? 'gb' : 'us'
  const searchQuery = userProfile.primarySkills.slice(0, 2).join(' ')
  
  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?` + new URLSearchParams({
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
        extractSkillsFromDescription(job.description, userProfile.primarySkills),
        job.title
      ),
      posted: job.created.split('T')[0],
      url: job.redirect_url
    })) || []
    
  } catch (error) {
    console.error('Adzuna API error:', error)
    return []
  }
}

// Helper functions
// Skill synonyms for better matching
const skillSynonyms: { [key: string]: string[] } = {
  'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'react.js', 'react native'],
  'Vue.js': ['vue', 'vue.js', 'vuejs'],
  'Angular': ['angular', 'angularjs', 'angular.js'],
  'Python': ['python', 'py', 'python3'],
  'Java': ['java', 'jvm'],
  'C#': ['c#', 'csharp', 'c sharp', '.net', 'dotnet'],
  'PHP': ['php', 'php7', 'php8'],
  'Ruby': ['ruby', 'ruby on rails', 'rails', 'ror'],
  'Go': ['go', 'golang'],
  'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite'],
  'MongoDB': ['mongodb', 'mongo', 'nosql'],
  'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  'Azure': ['azure', 'microsoft azure'],
  'Docker': ['docker', 'containerization', 'containers'],
  'Kubernetes': ['kubernetes', 'k8s', 'orchestration'],
  'Git': ['git', 'github', 'gitlab', 'version control'],
  'CSS': ['css', 'css3', 'styling', 'sass', 'scss', 'less'],
  'HTML': ['html', 'html5', 'markup'],
  'Node.js': ['node.js', 'nodejs', 'node', 'express'],
  'REST API': ['rest', 'restful', 'rest api', 'api'],
  'GraphQL': ['graphql', 'gql'],
  'Express': ['express', 'express.js', 'expressjs'],
  'Django': ['django', 'python web framework'],
  'Flask': ['flask', 'python flask'],
  'Spring': ['spring', 'spring boot'],
  'Redis': ['redis', 'caching', 'in-memory'],
  'Bootstrap': ['bootstrap', 'css framework'],
  'Tailwind': ['tailwind', 'tailwindcss', 'utility-first']
}

function extractSkillsFromDescription(description: string, userSkills: string[]): string[] {
  const foundSkills: string[] = []
  const lowerDescription = description.toLowerCase()
  
  // Create a Set for faster duplicate checking
  const foundSkillsSet = new Set<string>()
  
  // Check user skills first (higher priority) with synonyms
  userSkills.forEach(skill => {
    const normalizedSkill = skill.toLowerCase()
    
    // Direct match
    if (lowerDescription.includes(normalizedSkill) && !foundSkillsSet.has(skill)) {
      foundSkills.push(skill)
      foundSkillsSet.add(skill)
    }
    
    // Check synonyms
    Object.entries(skillSynonyms).forEach(([mainSkill, synonyms]) => {
      if (synonyms.includes(normalizedSkill)) {
        synonyms.forEach(synonym => {
          const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
          if (regex.test(lowerDescription) && !foundSkillsSet.has(skill)) {
            foundSkills.push(skill)
            foundSkillsSet.add(skill)
          }
        })
      }
    })
  })
  
  // Check for common skills with synonyms
  Object.entries(skillSynonyms).forEach(([mainSkill, synonyms]) => {
    if (!foundSkillsSet.has(mainSkill)) {
      synonyms.forEach(synonym => {
        const regex = new RegExp(`\\b${synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (regex.test(lowerDescription) && !foundSkillsSet.has(mainSkill)) {
          foundSkills.push(mainSkill)
          foundSkillsSet.add(mainSkill)
        }
      })
    }
  })
  
  return foundSkills.slice(0, 10) // Increased limit for better matching
}

function calculateSkillMatch(userSkills: string[], jobSkills: string[], jobTitle?: string): number {
  const startTime = performance.now()
  
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase())
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase())
  
  if (normalizedJobSkills.length === 0) {
    return 0
  }
  
  // **IMPROVEMENT: Weighted matching**
  // First 3 skills are "core" (70% weight), rest are "bonus" (30% weight)
  const coreSkills = normalizedJobSkills.slice(0, 3)
  const bonusSkills = normalizedJobSkills.slice(3)
  
  // Find core skill matches (most important)
  const coreMatches = coreSkills.filter(jobSkill => 
    normalizedUserSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  )
  
  // Find bonus skill matches
  const bonusMatches = bonusSkills.filter(jobSkill => 
    normalizedUserSkills.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )
  )
  
  // Calculate weighted score
  let matchPercentage = 0
  
  if (coreSkills.length > 0) {
    const coreScore = (coreMatches.length / coreSkills.length) * 70
    matchPercentage += coreScore
  }
  
  if (bonusSkills.length > 0) {
    const bonusScore = (bonusMatches.length / bonusSkills.length) * 30
    matchPercentage += bonusScore
  } else if (coreSkills.length > 0) {
    // If no bonus skills, core skills count for full 100%
    matchPercentage = (coreMatches.length / coreSkills.length) * 100
  }
  
  // **IMPROVEMENT: Experience level adjustment**
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase()
    let experienceAdjustment = 0
    
    // Boost for matching experience level keywords
    if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
      // Senior level - higher standards
      experienceAdjustment = -5
    } else if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('graduate')) {
      // Junior level - more forgiving
      experienceAdjustment = +5
    }
    
    matchPercentage = Math.max(0, matchPercentage + experienceAdjustment)
  }
  
  const finalScore = Math.min(100, Math.round(matchPercentage))
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // 🔍 DEBUG: Log match calculation details
  if (process.env.NODE_ENV === 'development') {
    const allMatches = [...coreMatches, ...bonusMatches]
    console.log(`\n🎯 IMPROVED MATCH CALCULATION ${jobTitle ? `for "${jobTitle}"` : ''}:`)
    console.log(`👤 User Skills: [${normalizedUserSkills.join(', ')}]`)
    console.log(`🎯 Core Skills (70%): [${coreSkills.join(', ')}]`)
    console.log(`🎁 Bonus Skills (30%): [${bonusSkills.join(', ')}]`)
    console.log(`✅ Core Matches: [${coreMatches.join(', ')}] (${coreMatches.length}/${coreSkills.length})`)
    console.log(`✅ Bonus Matches: [${bonusMatches.join(', ')}] (${bonusMatches.length}/${bonusSkills.length})`)
    console.log(`📊 Final Score: ${finalScore}%`)
    console.log(`⏱️ Performance: ${duration.toFixed(3)}ms`)
    
    // Performance warning if calculation is slow
    if (duration > 5) {
      console.warn(`⚠️ SLOW CALCULATION: ${duration.toFixed(3)}ms (threshold: 5ms)`)
    }
    console.log(`───────────────────────────────────`)
  }
  
  return finalScore
}

// Mock data fallback (when APIs fail)
const mockJobs: JobMatch[] = [
  {
    id: 'mock-1',
    title: '[DEMO] Frontend Developer',
    company: 'TechCorp (Demo)',
    location: 'London, UK',
    type: 'hybrid',
    salary: { min: 50000, max: 70000, currency: 'GBP' },
    description: '⚠️ DEMO JOB: Build modern web applications with React and TypeScript. Real jobs will appear when APIs are working.',
    requirements: ['React experience', 'TypeScript', 'CSS'],
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
    matchScore: 85,
    posted: '2024-01-15',
    url: '#' // No real URL for demo jobs
  },
  {
    id: 'mock-2',
    title: '[DEMO] Python Developer',
    company: 'DataTech (Demo)',
    location: 'Remote',
    type: 'remote',
    salary: { min: 60000, max: 80000, currency: 'USD' },
    description: '⚠️ DEMO JOB: Develop backend systems using Python and Django. Real jobs will appear when APIs are working.',
    requirements: ['Python expertise', 'Django', 'API development'],
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API'],
    matchScore: 78,
    posted: '2024-01-12',
    url: '#' // No real URL for demo jobs
  }
]

export async function POST(request: NextRequest) {
  try {
    const { userProfile }: { userProfile: UserSkillProfile } = await request.json()
    
    console.log('🎯 API ROUTE: Received job request')
    console.log('👤 User Profile:', JSON.stringify(userProfile, null, 2))
    
    if (!userProfile) {
      console.log('❌ No user profile provided')
      return NextResponse.json({ error: 'User profile is required' }, { status: 400 })
    }

    const allJobs: JobMatch[] = []
    
    // Try JSearch API
    console.log('🔍 Trying JSearch API...')
    const jSearchJobs = await fetchJobsFromJSearch(userProfile)
    console.log(`📊 JSearch returned ${jSearchJobs.length} jobs`)
    allJobs.push(...jSearchJobs)
    
    // Try Adzuna for European users
    if (userProfile.location?.toLowerCase().includes('uk') || 
        userProfile.location?.toLowerCase().includes('europe')) {
      const adzunaJobs = await fetchJobsFromAdzuna(userProfile)
      allJobs.push(...adzunaJobs)
    }
    
    // If no jobs found, use mock data
    if (allJobs.length === 0) {
      console.log('🚨 No jobs found from APIs, using mock data')
      console.log('📝 Debug Info:')
      console.log('- JSearch jobs:', jSearchJobs.length)
      console.log('- User profile location:', userProfile.location)
      console.log('- RAPIDAPI_KEY configured:', !!process.env.RAPIDAPI_KEY)
      console.log('- ADZUNA keys configured:', !!process.env.ADZUNA_APP_ID && !!process.env.ADZUNA_API_KEY)
      return NextResponse.json({ jobs: mockJobs })
    } else {
      console.log(`✅ Found ${allJobs.length} real jobs from APIs`)
    }
    
    // Remove duplicates and sort by match score
    const uniqueJobs = allJobs.filter((job, index, self) => 
      index === self.findIndex(j => 
        j.title.toLowerCase() === job.title.toLowerCase() && 
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    )
    
    const sortedJobs = uniqueJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(job => job.matchScore >= 40)
      .slice(0, 20)
    
    return NextResponse.json({ jobs: sortedJobs })
    
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
