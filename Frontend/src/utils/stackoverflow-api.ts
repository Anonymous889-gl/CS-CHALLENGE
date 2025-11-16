// Stack Overflow API utility functions
const STACKOVERFLOW_API_BASE = 'https://api.stackexchange.com/2.3'

export interface StackOverflowUser {
  user_id: number
  display_name: string
  reputation: number
  profile_image: string
  creation_date: number
  location?: string
  website_url?: string
  about_me?: string
  badge_counts: {
    gold: number
    silver: number
    bronze: number
  }
  question_count: number
  answer_count: number
  up_vote_count: number
  down_vote_count: number
  accept_rate?: number
}

export interface StackOverflowBadge {
  badge_id: number
  name: string
  description: string
  award_count: number
  badge_type: 'named' | 'tag_based'
  rank: 'gold' | 'silver' | 'bronze'
}

export interface StackOverflowTag {
  name: string
  count: number
  excerpt?: string
}

export interface StackOverflowPost {
  post_id: number
  post_type: 'question' | 'answer'
  score: number
  creation_date: number
  title?: string
  tags?: string[]
  is_answered?: boolean
  accepted_answer_id?: number
}

export interface StackOverflowAnalysis {
  user: StackOverflowUser
  topTags: StackOverflowTag[]
  recentPosts: StackOverflowPost[]
  badges: StackOverflowBadge[]
  stats: {
    totalScore: number
    questionsAsked: number
    answersGiven: number
    acceptanceRate: number
    expertiseTags: string[]
    activityLevel: 'high' | 'medium' | 'low'
    reputationRank: 'expert' | 'experienced' | 'intermediate' | 'beginner'
  }
}

// Rate limiting helper
let lastSORequestTime = 0
const MIN_SO_REQUEST_INTERVAL = 200 // 200ms between requests (Stack Overflow allows 300 requests per 24h per IP)

async function makeStackOverflowRequest(endpoint: string): Promise<any> {
  // Simple rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastSORequestTime
  if (timeSinceLastRequest < MIN_SO_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_SO_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastSORequestTime = Date.now()

  try {
    const url = `${STACKOVERFLOW_API_BASE}${endpoint}`
    console.log('Stack Overflow API request:', url)
    
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Stack Overflow user not found')
      } else if (response.status === 429) {
        throw new Error('Stack Overflow API rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`Stack Overflow API error: ${response.status}`)
      }
    }

    const data = await response.json()
    
    if (data.error_id) {
      throw new Error(`Stack Overflow API error: ${data.error_message}`)
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch from Stack Overflow API')
  }
}

export async function fetchStackOverflowUser(userId: string): Promise<StackOverflowUser> {
  const endpoint = `/users/${userId}?order=desc&sort=reputation&site=stackoverflow`
  const response = await makeStackOverflowRequest(endpoint)
  
  if (!response.items || response.items.length === 0) {
    throw new Error('Stack Overflow user not found')
  }
  
  return response.items[0]
}

export async function fetchStackOverflowUserTags(userId: string): Promise<StackOverflowTag[]> {
  const endpoint = `/users/${userId}/tags?order=desc&sort=popular&site=stackoverflow&pagesize=10`
  const response = await makeStackOverflowRequest(endpoint)
  return response.items || []
}

export async function fetchStackOverflowUserBadges(userId: string): Promise<StackOverflowBadge[]> {
  const endpoint = `/users/${userId}/badges?order=desc&sort=rank&site=stackoverflow&pagesize=20`
  const response = await makeStackOverflowRequest(endpoint)
  return response.items || []
}

export async function fetchStackOverflowUserPosts(userId: string): Promise<StackOverflowPost[]> {
  const endpoint = `/users/${userId}/posts?order=desc&sort=votes&site=stackoverflow&pagesize=10&filter=default`
  const response = await makeStackOverflowRequest(endpoint)
  return response.items || []
}

export function calculateActivityLevel(user: StackOverflowUser): 'high' | 'medium' | 'low' {
  const accountAgeMonths = Math.max(1, (Date.now() - user.creation_date * 1000) / (1000 * 60 * 60 * 24 * 30))
  const postsPerMonth = (user.question_count + user.answer_count) / accountAgeMonths
  
  if (postsPerMonth >= 2) return 'high'
  if (postsPerMonth >= 0.5) return 'medium'
  return 'low'
}

export function calculateReputationRank(reputation: number): 'expert' | 'experienced' | 'intermediate' | 'beginner' {
  if (reputation >= 10000) return 'expert'
  if (reputation >= 3000) return 'experienced'
  if (reputation >= 500) return 'intermediate'
  return 'beginner'
}

export async function analyzeStackOverflowProfile(userId: string): Promise<StackOverflowAnalysis> {
  if (!/^[0-9]+$/.test(userId)) {
    throw new Error('Invalid Stack Overflow user ID')
  }
  try {
    console.log('Analyzing Stack Overflow profile for user:', userId)
    
    // Fetch all data in parallel
    const [user, topTags, badges, recentPosts] = await Promise.all([
      fetchStackOverflowUser(userId),
      fetchStackOverflowUserTags(userId),
      fetchStackOverflowUserBadges(userId),
      fetchStackOverflowUserPosts(userId)
    ])

    // Calculate statistics
    const totalScore = user.up_vote_count - user.down_vote_count
    const expertiseTags = topTags.slice(0, 5).map(tag => tag.name)
    const activityLevel = calculateActivityLevel(user)
    const reputationRank = calculateReputationRank(user.reputation)

    return {
      user,
      topTags,
      recentPosts,
      badges,
      stats: {
        totalScore,
        questionsAsked: user.question_count,
        answersGiven: user.answer_count,
        acceptanceRate: user.accept_rate || 0,
        expertiseTags,
        activityLevel,
        reputationRank
      }
    }
  } catch (error) {
    console.error('Stack Overflow analysis error:', error)
    throw error
  }
}

// Helper function to extract Stack Overflow user ID from URL
export function extractStackOverflowUserId(url: string): string {
  try {
    // Handle URLs like: https://stackoverflow.com/users/123456/username
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const match = pathname.match(/\/users\/(\d+)/)
    return match ? match[1] : 'unknown'
  } catch {
    return 'unknown'
  }
}
