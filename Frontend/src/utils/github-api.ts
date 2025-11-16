// GitHub API utility functions
const GITHUB_API_BASE = 'https://api.github.com'

export interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  created_at: string
  location: string | null
  company: string | null
  blog: string | null
}

export interface GitHubRepo {
  name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  size: number
  open_issues_count: number
  topics: string[]
  html_url: string
}

export interface GitHubEvent {
  type: string
  created_at: string
  repo?: {
    name: string
  }
  payload?: any
}

export interface GitHubAnalysis {
  user: GitHubUser
  repositories: GitHubRepo[]
  events: GitHubEvent[]
  stats: {
    totalStars: number
    totalForks: number
    languageBreakdown: { [key: string]: number }
    recentActivityCount: number
    repositoryCount: number
    contributionScore: number
  }
}

// Rate limiting helper
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 100 // 100ms between requests

async function makeGitHubRequest(url: string): Promise<any> {
  // Simple rate limiting
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Note: For production, add GitHub token: 'Authorization': 'token YOUR_TOKEN'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub user not found')
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.')
      } else {
        throw new Error(`GitHub API error: ${response.status}`)
      }
    }

    return await response.json()
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch from GitHub API')
  }
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const url = `${GITHUB_API_BASE}/users/${username}`
  return await makeGitHubRequest(url)
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const url = `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=100`
  return await makeGitHubRequest(url)
}

export async function fetchGitHubEvents(username: string): Promise<GitHubEvent[]> {
  const url = `${GITHUB_API_BASE}/users/${username}/events?per_page=30`
  return await makeGitHubRequest(url)
}

export function calculateLanguageBreakdown(repos: GitHubRepo[]): { [key: string]: number } {
  const languageCounts: { [key: string]: number } = {}
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  })

  // Convert to percentages
  const total = Object.values(languageCounts).reduce((sum, count) => sum + count, 0)
  const languagePercentages: { [key: string]: number } = {}
  
  Object.entries(languageCounts).forEach(([language, count]) => {
    languagePercentages[language] = Math.round((count / total) * 100)
  })

  return languagePercentages
}

export function calculateContributionScore(user: GitHubUser, repos: GitHubRepo[], events: GitHubEvent[]): number {
  let score = 0

  // Repository count (0-30 points)
  score += Math.min(user.public_repos * 2, 30)

  // Total stars (0-25 points)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  score += Math.min(totalStars, 25)

  // Recent activity (0-20 points) - events in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const recentEvents = events.filter(event => new Date(event.created_at) > thirtyDaysAgo)
  score += Math.min(recentEvents.length * 2, 20)

  // Language diversity (0-15 points)
  const languages = calculateLanguageBreakdown(repos)
  const languageCount = Object.keys(languages).length
  score += Math.min(languageCount * 3, 15)

  // Social engagement (0-10 points)
  score += Math.min(user.followers * 0.5, 10)

  return Math.min(Math.round(score), 100)
}

export async function analyzeGitHubProfile(username: string): Promise<GitHubAnalysis> {
  try {
    // Fetch all data in parallel
    const [user, repositories, events] = await Promise.all([
      fetchGitHubUser(username),
      fetchGitHubRepos(username),
      fetchGitHubEvents(username)
    ])

    // Calculate statistics
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
    const languageBreakdown = calculateLanguageBreakdown(repositories)
    
    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentActivityCount = events.filter(event => new Date(event.created_at) > thirtyDaysAgo).length

    const contributionScore = calculateContributionScore(user, repositories, events)

    return {
      user,
      repositories,
      events,
      stats: {
        totalStars,
        totalForks,
        languageBreakdown,
        recentActivityCount,
        repositoryCount: repositories.length,
        contributionScore
      }
    }
  } catch (error) {
    console.error('GitHub analysis error:', error)
    throw error
  }
}

// Helper function to extract GitHub username from URL
export function extractGitHubUsername(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Handle both github.com/username and github.com/username/
    const parts = pathname.split('/').filter(part => part.length > 0)
    return parts[0] || 'unknown'
  } catch {
    return 'unknown'
  }
}
