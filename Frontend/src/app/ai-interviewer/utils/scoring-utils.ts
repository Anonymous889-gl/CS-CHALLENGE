// Scoring calculation utilities

// Calculate interview scores based on content analysis
export const calculateContentScore = (response: string): number => {
  const responseLength = response.length
  const wordCount = response.split(' ').length
  
  // Content analysis for more accurate scoring
  const hasNumbers = /\d+/.test(response)
  const hasSpecificExamples = /example|instance|experience|project|team|result|achieved|implemented|developed|managed|led/i.test(response)
  const hasTechnicalTerms = /algorithm|database|api|framework|methodology|process|system|architecture/i.test(response)
  const hasTimeframes = /year|month|week|day|time|during|when|recently|previous/i.test(response)
  const hasMetrics = /percent|%|\$|increase|decrease|improve|reduce|faster|slower|better|worse/i.test(response)
  const isWellStructured = response.includes('.') && wordCount > 15
  const isVague = /good|nice|okay|fine|well|maybe|probably|think|guess/i.test(response)
  
  // Deterministic scoring - consistent for identical answers
  let score = 0
  
  // Word count scoring (deterministic tiers)
  if (wordCount >= 80) score += 20
  else if (wordCount >= 40) score += 12
  else if (wordCount >= 20) score += 6
  
  // Content quality bonuses (fixed values)
  if (isWellStructured) score += 12
  if (hasSpecificExamples) score += 20
  if (hasNumbers) score += 10
  if (hasTechnicalTerms) score += 10
  if (hasTimeframes) score += 6
  if (hasMetrics) score += 12
  
  // Penalties for poor answers (fixed values)
  if (isVague) score -= 10
  if (wordCount < 10) score -= 20
  if (responseLength < 30) score -= 10
  
  // Ensure realistic range (aligned with AI scoring cap of 95)
  return Math.max(0, Math.min(95, score))
}

// Get overall score from array of scores
export const getOverallScore = (scores: number[]): number => {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

// Get quick insight based on score and answer length
export const getQuickInsight = (score: number, answerLength: number): string => {
  if (answerLength === 0) return "No response provided"
  if (score >= 85) return "Excellent response with clear structure"
  if (score >= 70) return "Good answer, minor improvements possible"
  if (score >= 50) return "Adequate response, room for enhancement"
  if (score >= 25) return "Basic answer, needs more detail and examples"
  return "Insufficient response, requires significant improvement"
}

// Format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
