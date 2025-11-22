// app/api/resume-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ResumeSection {
  title: string
  content: string
  score: number
  feedback: string[]
}
interface ResumeAnalysis {
  overallScore: number
  strengths: string[]
  improvements: string[]
  sections: ResumeSection[]
  atsScore?: number
  atsCompatibility?: number  // legacy field still used by UI
  clarityScore?: number
  seniorityLevel?: string
  redFlags?: string[]
  suggestions: Array<{
    type: string
    before: string
    after: string
    explanation: string
  }>
  skillGapAnalysis?: {
    missingSkills: string[]
    skillLevel: 'Junior' | 'Mid' | 'Senior' | 'Expert'
    recommendedSkills: string[]
    learningPaths: Array<{
      skill: string
      priority: 'High' | 'Medium' | 'Low'
      timeToLearn: string
      resources: string[]
    }>
  }
  careerSuggestions?: {
    nextRoles: string[]
    careerPath: Array<{ role: string; timeframe: string; requirements: string[] }>
    promotionReadiness: number
  }
}

/* =========================
   GET (health check)
========================= */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    runtime,
    gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    extractionOk: true,
    time: new Date().toISOString()
  })
}

/* =========================
   POST (main analysis)
========================= */
export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production'
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      )
    }

    const name = (file as File).name || 'upload'
    const mime = (file as File).type || ''
    const lowerName = name.toLowerCase()

    // Accept PDF and DOCX (optional)
    const isPDF = mime === 'application/pdf' || lowerName.endsWith('.pdf')
    const isDOCX =
      mime ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      lowerName.endsWith('.docx')

    if (!isPDF && !isDOCX) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      )
    }

    if (isDev) console.log(`Processing resume: ${name} (${mime || 'unknown'})`)

    // Extract text
    let resumeText = ''
    if (isPDF) {
      resumeText = await extractTextFromPDF(file)
    } else if (isDOCX) {
      resumeText = await extractTextFromDOCX(file)
    }

    if (isDev) {
      console.log('Extracted text length:', resumeText.length)
      console.log('Preview:', resumeText.slice(0, 200))
    }

    if (!resumeText || resumeText.trim().length < 20) {
      const fallbackText = `Resume file: ${name}. Software developer with experience in web development, programming, and project management.`
      const parsed = parseResumeStructure(fallbackText)
      
      // Gemini-first even on fallback
      const analysis = process.env.GEMINI_API_KEY
        ? await analyzeWithGemini(parsed).catch(() => analyzeWithRules(parsed))
        : analyzeWithRules(parsed)

      return NextResponse.json({
        success: true,
        analysis,
        extractedText: fallbackText,
        fileName: name,
        fileSize: (file as File).size,
        note: 'Analysis based on filename and general assumptions due to parsing limitations'
      })
    }

    // Parse structure
    const parsed = parseResumeStructure(resumeText)

    // Gemini-first: AI is single source of truth, rules only as fallback
    let analysis: ResumeAnalysis | Partial<ResumeAnalysis>
    
    if (process.env.GEMINI_API_KEY) {
      try {
        if (isDev) console.log('🤖 Using Gemini AI analysis...')
        analysis = await analyzeWithGemini(parsed)
        
        if (isDev) {
          console.log('✅ Gemini analysis complete:')
          console.log('- Overall Score:', analysis.overallScore)
          console.log('- Strengths:', analysis.strengths?.length || 0, 'items')
          console.log('- Improvements:', analysis.improvements?.length || 0, 'items')
          console.log('- ATS Score:', analysis.atsCompatibility)
        }
      } catch (e) {
        if (isDev) console.warn('⚠️ Gemini failed, falling back to rule-based analysis:', e)
        analysis = analyzeWithRules(parsed)
      }
    } else {
      if (isDev) console.log('📋 No Gemini API key - using rule-based analysis')
      analysis = analyzeWithRules(parsed)
    }

    // Save the resume score to user's metrics if user is authenticated
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const jwt = await import('jsonwebtoken')
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any
          if (decoded.userId) {
            // Import models
            // Always use the *Backend* copy of Mongoose & its models to avoid
            // duplicate instances (different copies cause buffering time-outs)
            // @ts-expect-error: dynamic import of CommonJS module
            const { default: mongoose } = await import('../../../../../Backend/node_modules/mongoose')
            const UserMetrics = await import('../../../../../Backend/src/models/userMetrics.js').then(m => m.default)
            const Activity = await import('../../../../../Backend/src/models/activity.js').then(m => m.default)
            
            // Connect once (reuse across route invocations)
            if (mongoose.connection.readyState !== 1) {
              await mongoose.connect(
                process.env.MONGODB_URI || 'mongodb://localhost:27017/utopiahire',
                { serverSelectionTimeoutMS: 5000 }
              )
            }
            
            // Update user metrics with resume score
            await UserMetrics.findOneAndUpdate(
              { userId: decoded.userId },
              { 
                userId: decoded.userId,
                resumeScore: analysis.overallScore || 0,
                lastProfileUpdate: new Date()
              },
              { upsert: true, new: true }
            )
            
            // Log activity
            await Activity.create({
              userId: decoded.userId,
              action: `Resume analyzed - Score: ${analysis.overallScore || 0}/100`,
              type: 'resume',
              description: `Resume "${name}" analyzed with overall score of ${analysis.overallScore || 0}%`,
              metadata: {
                score: analysis.overallScore || 0,
                fileName: name,
                atsScore: analysis.atsCompatibility || 0
              }
            })
            
            if (isDev) console.log(`✅ Resume score ${analysis.overallScore} saved for user ${decoded.userId}`)
          }
        } catch (jwtError) {
          if (isDev) console.log('JWT verification failed, skipping score save:', jwtError)
        }
      }
    } catch (saveError) {
      if (isDev) console.warn('Failed to save resume score:', saveError)
      // Don't fail the entire request if saving fails
    }

    return NextResponse.json({
      success: true,
      analysis,
      extractedText: resumeText.slice(0, 500) + (resumeText.length > 500 ? '...' : ''),
      fileName: name,
      fileSize: (file as File).size
    })
  } catch (error) {
    console.error('❌ Resume analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze resume. Please try again.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

/* =========================
   Extraction Helpers
========================= */
async function extractTextFromPDF(file: File): Promise<string> {
  const isDev = process.env.NODE_ENV !== 'production'

  // ✅ Use Node-friendly legacy build (using .mjs since .js doesn't exist in package)
  const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // ❌ Do NOT set GlobalWorkerOptions.workerSrc at all when disableWorker=true

  const ab = await file.arrayBuffer()
  const data = new Uint8Array(ab)

  const loadingTask = pdfjsLib.getDocument({
    data,
    disableWorker: true,        // <- no worker needed on server
    verbosity: 0,
    isEvalSupported: false,
    useWorkerFetch: false
  })
  const pdf = await loadingTask.promise

  if (isDev) console.log(`PDF loaded: ${pdf.numPages} pages`)

  let fullText = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent({
      normalizeWhitespace: true,
      disableCombineTextItems: false,
    })

    let line = ''
    for (const item of content.items as Array<{ str: string; hasEOL?: boolean }>) {
      if (item?.str) line += item.str + ' '
      if (item?.hasEOL) {
        fullText += line.trim() + '\n'
        line = ''
      }
    }
    if (line.trim()) fullText += line.trim() + '\n'
  }

  if (isDev) console.log('PDF text extraction:', fullText.length, 'chars')
  if (fullText.trim().length <= 50) {
    throw new Error('PDF contains no extractable text (might be image-based)')
  }
  return cleanExtractedText(fullText)
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth') as any
  const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return cleanExtractedText(res.value || '')
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')                         // normalize NL
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')       // strip non-printables but keep NL
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

/* =========================
   Parsing
========================= */
function parseResumeStructure(text: string) {
  const sections: Record<string, string> = {
    contact: '',
    summary: '',
    experience: '',
    skills: '',
    education: '',
    projects: '',
    certifications: '',
    languages: '',
    other: ''
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  let current: keyof typeof sections = 'other'

  const headers: Array<{ section: keyof typeof sections; keywords: string[]; priority: number }> =
    [
      { section: 'contact', keywords: ['email', '@', 'phone', 'tel', 'linkedin', 'github', 'address'], priority: 10 },
      { section: 'summary', keywords: ['summary', 'objective', 'profile', 'about'], priority: 9 },
      { section: 'experience', keywords: ['experience', 'work history', 'employment', 'professional', 'career'], priority: 8 },
      { section: 'skills', keywords: ['skills', 'technical', 'technologies', 'competencies', 'expertise', 'proficient'], priority: 7 },
      { section: 'education', keywords: ['education', 'academic', 'degree', 'university', 'college', 'school'], priority: 6 },
      { section: 'projects', keywords: ['projects', 'portfolio', 'personal projects'], priority: 5 },
      { section: 'certifications', keywords: ['certifications', 'certificates', 'licensed', 'accredited'], priority: 4 },
      { section: 'languages', keywords: ['languages', 'fluent', 'native'], priority: 3 }
    ]

  lines.forEach((line) => {
    const lower = line.toLowerCase()
    let best = { section: current, priority: -1 }

    for (const h of headers) {
      for (const k of h.keywords) {
        if (lower.includes(k)) {
          const standalone =
            line.length < 50 &&
            (lower === k || lower.includes(k + ':') || lower.endsWith(k + 's'))
          const p = h.priority + (standalone ? 5 : 0)
          if (p > best.priority) best = { section: h.section, priority: p }
        }
      }
    }

    if (best.priority > -1 && best.section !== current) {
      current = best.section
    } else if (line.length > 2) {
      sections[current] += line + '\n'
    }
  })

  sections.contact = extractContactInfo(text)

  Object.keys(sections).forEach((k) => {
    sections[k] = sections[k].trim()
  })

  const stats = {
    wordCount: text.split(/\s+/).filter(Boolean).length,
    lineCount: lines.length,
    sectionCount: Object.values(sections).filter((s) => s.length > 10).length
  }

  return {
    sections,
    fullText: text,
    ...stats
  }
}

function extractContactInfo(text: string): string {
  const info: string[] = []

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const phoneRegex = /\+?\d[\d\s().-]{6,}\d/g // intl-friendly
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9-]+)/g
  const githubRegex = /(github\.com\/[a-zA-Z0-9-]+)/g

  const emails = text.match(emailRegex)
  const phones = text.match(phoneRegex)
  const linkedins = text.match(linkedinRegex)
  const githubs = text.match(githubRegex)

  if (emails) info.push(...emails)
  if (phones) info.push(...phones)
  if (linkedins) info.push(...linkedins)
  if (githubs) info.push(...githubs)

  return info.join('\n')
}

/* =========================
   Analysis: Rule-based (FALLBACK ONLY)
   Used only when:
   - GEMINI_API_KEY is not configured, OR
   - Gemini API call fails/times out
========================= */
function analyzeWithRules(parsed: any): Partial<ResumeAnalysis> {
  const { fullText, sections } = parsed

  const scores = {
    skills: analyzeSkillsSection(sections.skills),
    experience: analyzeExperienceSection(sections.experience),
    education: analyzeEducationSection(sections.education),
    formatting: analyzeFormatting(fullText),
    content: analyzeContentQuality(fullText)
  }

  const overallScore = Math.round(
    (scores.skills + scores.experience + scores.education + scores.formatting + scores.content) / 5
  )

  const strengths = generateEvidenceBasedStrengths(sections, scores)
  const improvements = generateEvidenceBasedImprovements(sections, scores)
  const suggestions = generateSuggestions(fullText)

  const atsCompatibility = calculateATSScore(fullText, sections)

  if (process.env.NODE_ENV !== 'production') {
    console.log('=== RULE-BASED ANALYSIS RESULTS ===')
    console.log('Overall Score:', overallScore)
    console.log('Strengths:', strengths.length, 'items')
    console.log('Improvements:', improvements.length, 'items')
    console.log('ATS Compatibility:', atsCompatibility)
    console.log('Scores:', scores)
    console.log('===================================')
  }

  return {
    overallScore,
    strengths,
    improvements,
    sections: [
      { title: 'Skills', content: sections.skills || '', score: scores.skills, feedback: [] },
      { title: 'Experience', content: sections.experience || '', score: scores.experience, feedback: [] },
      { title: 'Education', content: sections.education || '', score: scores.education, feedback: [] }
    ],
    atsCompatibility,
    suggestions
  }
}

function analyzeSkillsSection(skillsText: string): number {
  if (!skillsText || skillsText.length < 20) return 25
  
  // Normalize text: lowercase and remove diacritics
  const normalized = skillsText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Comprehensive skill categories
  const skillCategories = {
    programming: ['javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'],
    frontend: ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'bootstrap', 'next.js', 'svelte'],
    backend: ['node.js', 'express', 'django', 'flask', 'spring', 'laravel', '.net', 'fastapi'],
    database: ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'dynamodb'],
    cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
    tools: ['git', 'jira', 'figma', 'postman', 'linux', 'agile', 'scrum']
  }
  
  // Count unique skills (de-duplicate)
  const foundSkills = new Set<string>()
  Object.values(skillCategories).flat().forEach(skill => {
    if (normalized.includes(skill)) foundSkills.add(skill)
  })
  
  const skillCount = foundSkills.size
  const categoryDiversity = Object.values(skillCategories).filter(cat => 
    cat.some(s => foundSkills.has(s))
  ).length
  
  // Score: skill count (60%) + category diversity (40%)
  const skillScore = Math.min(60, skillCount * 3.5)
  const diversityScore = Math.min(35, categoryDiversity * 6)
  
  return Math.round(Math.min(95, skillScore + diversityScore))
}

function analyzeExperienceSection(experienceText: string): number {
  if (!experienceText || experienceText.length < 50) return 20
  
  const normalized = experienceText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const wordCount = normalized.split(/\s+/).length
  
  // Strong action verbs (diverse set)
  const strongVerbs = ['led', 'developed', 'implemented', 'achieved', 'improved', 'created', 
    'managed', 'designed', 'built', 'launched', 'scaled', 'optimized', 'delivered', 'architected',
    'spearheaded', 'established', 'increased', 'reduced', 'streamlined', 'automated']
  
  const weakPhrases = ['responsible for', 'worked on', 'helped with', 'was part of', 'involved in', 'assisted with']
  
  // Count unique action verbs (de-duplicate)
  const foundVerbs = new Set(strongVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(normalized)))
  const verbDiversity = foundVerbs.size
  
  // Count metrics: numbers with units (%, $, K, M, years, etc.)
  const metrics = normalized.match(/\d+[.,]?\d*\s*(percent|%|\$|k|m|b|years?|months?|x|times)/gi) || []
  const metricsDensity = (metrics.length / wordCount) * 1000 // per 1000 words
  
  // Check for weak phrases
  const weakCount = weakPhrases.filter(p => normalized.includes(p)).length
  
  // Scoring
  let score = 30
  score += Math.min(30, verbDiversity * 2)  // Verb diversity: 0-30pts
  score += Math.min(30, metricsDensity * 15) // Metrics density: 0-30pts
  score += foundVerbs.size > 0 ? 15 : 0      // Has any action verbs: 15pts
  score -= weakCount * 5                     // Weak phrase penalty: -5 each
  
  return Math.round(Math.max(15, Math.min(95, score)))
}

function analyzeEducationSection(educationText: string): number {
  if (!educationText || educationText.length < 20) return 40
  const hasUniversity = /university|college|institute/i.test(educationText)
  const hasGPA = /\b(gpa|grade)\b/i.test(educationText)
  const hasRelevant = /\b(computer|software|engineering|science|data)\b/i.test(educationText)
  let score = 60
  if (hasUniversity) score += 15
  if (hasGPA) score += 10
  if (hasRelevant) score += 15
  return Math.min(95, score)
}

function analyzeFormatting(text: string): number {
  const hasBullets = /(^\s*[-•*]\s+)/m.test(text)
  const properLen = text.length > 200 && text.length < 10000
  const hasStructure = text.includes('\n')
  let score = 50
  if (hasBullets) score += 20
  if (properLen) score += 20
  if (hasStructure) score += 10
  return Math.min(95, score)
}

function analyzeContentQuality(text: string): number {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const wordCount = normalized.split(/\s+/).length
  
  // Strong action verbs diversity
  const strongVerbs = ['led', 'developed', 'implemented', 'achieved', 'improved', 'created', 
    'managed', 'designed', 'built', 'launched', 'scaled', 'optimized', 'delivered', 'architected']
  const uniqueVerbs = new Set(strongVerbs.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(normalized)))
  
  // Metrics density (numbers with context)
  const metrics = normalized.match(/\d+[.,]?\d*\s*(percent|%|\$|k|m|b|years?|months?|x|times)/gi) || []
  const metricsDensity = (metrics.length / wordCount) * 1000
  
  // Recency signals (last 2-3 years)
  const currentYear = new Date().getFullYear()
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]
  const hasRecentWork = recentYears.some(year => normalized.includes(year.toString()))
  
  let score = 35
  score += Math.min(25, uniqueVerbs.size * 2)   // Verb diversity
  score += Math.min(25, metricsDensity * 12)    // Metrics density
  score += hasRecentWork ? 15 : 0               // Recency bonus
  
  return Math.round(Math.min(95, score))
}

function generateEvidenceBasedStrengths(sections: any, scores: any): string[] {
  const out: string[] = []
  const skillsText = (sections.skills || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const expText = (sections.experience || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Skills strengths with evidence
  if (scores.skills > 75) {
    const skillCount = skillsText.split(/[,\n]/).filter((s: string) => s.trim().length > 2).length
    out.push(`Strong technical skill set with ${skillCount}+ listed technologies across multiple domains`)
  } else if (scores.skills > 60) {
    out.push('Solid foundation of relevant technical skills')
  }
  
  // Experience strengths with evidence
  if (scores.experience > 75) {
    const metrics = expText.match(/\d+[.,]?\d*\s*(percent|%|\$|k|m|b|years?|months?)/gi) || []
    if (metrics.length > 3) {
      out.push(`Experience section demonstrates quantifiable impact with ${metrics.length}+ measurable achievements`)
    } else {
      out.push('Experience descriptions use strong action verbs and show clear responsibilities')
    }
  } else if (scores.experience > 60) {
    out.push('Experience section shows relevant work history')
  }
  
  // Content quality strengths
  if (scores.content > 70) {
    const currentYear = new Date().getFullYear()
    const hasRecent = [currentYear, currentYear - 1].some(y => expText.includes(y.toString()))
    if (hasRecent) {
      out.push('Recent and relevant work experience demonstrates current market readiness')
    }
  }
  
  // Education strengths
  if (scores.education > 75) {
    out.push('Education background is well-documented and relevant to target roles')
  }
  
  // Projects/certifications
  if (sections.projects && sections.projects.length > 50) {
    out.push('Portfolio projects provide concrete evidence of practical skills')
  }
  
  if (sections.certifications && sections.certifications.length > 30) {
    out.push('Professional certifications enhance credibility and demonstrate commitment to growth')
  }
  
  // Formatting
  if (scores.formatting > 80) {
    out.push('Clean, professional formatting with good structure and readability')
  }
  
  // Add dynamic, content-specific items if needed
  if (out.length < 2) {
    // Add specific skill count if skills exist
    if (sections.skills && sections.skills.length > 30) {
      const skillItems = skillsText.split(/[,\n]/).filter((s: string) => s.trim().length > 2)
      out.push(`Resume lists ${skillItems.length} technical skills demonstrating breadth of knowledge`)
    }
    
    // Add specific experience metrics if experience exists
    if (sections.experience && sections.experience.length > 50) {
      const wordCount = expText.split(/\s+/).length
      const yearsMatch = expText.match(/(\d+)\s*(?:years?|ans?)/i)
      if (yearsMatch && yearsMatch[1]) {
        out.push(`${yearsMatch[1]}+ years of professional experience documented`)
      } else if (wordCount > 100) {
        out.push(`Detailed work history with ${Math.round(wordCount / 100) * 100}+ words of experience description`)
      }
    }
    
    // Education with specific details
    if (sections.education && sections.education.length > 20) {
      const eduText = (sections.education || '').toLowerCase()
      const hasDegree = /bachelor|master|phd|doctorate|license|engineer/i.test(eduText)
      if (hasDegree) {
        out.push('Formal degree credentials strengthen professional profile')
      } else {
        out.push('Educational background provided')
      }
    }
  }
  
  // Final fallback with section count
  if (out.length === 0) {
    const sectionCount = Object.values(sections).filter((s: any) => s && s.length > 20).length
    out.push(`Resume contains ${sectionCount} documented sections`)
    out.push('Basic resume structure is in place')
  }
  
  return out.slice(0, 5)
}

function generateEvidenceBasedImprovements(sections: any, scores: any): string[] {
  const out: string[] = []
  const skillsText = (sections.skills || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const expText = (sections.experience || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const fullText = Object.values(sections).join(' ').toLowerCase()
  
  // Skills improvements
  if (scores.skills < 65) {
    const hasBasicSkills = skillsText.length > 20
    if (!hasBasicSkills) {
      out.push('Add a dedicated Skills section with 10-15 relevant technologies and tools')
    } else {
      out.push('Expand skills section to include more in-demand technologies relevant to your target role')
    }
  } else if (scores.skills < 80) {
    out.push('Consider organizing skills by category (Languages, Frameworks, Tools, Cloud) for better readability')
  }
  
  // Experience improvements
  if (scores.experience < 65) {
    const metrics = expText.match(/\d+[.,]?\d*\s*(percent|%|\$|k|m|b|years?|months?)/gi) || []
    const weakPhrases = ['responsible for', 'worked on', 'helped with', 'was part of']
    const hasWeak = weakPhrases.some(p => expText.includes(p))
    
    if (metrics.length < 2) {
      out.push('Add quantifiable metrics to experience bullets (e.g., "reduced costs by 30%" or "managed team of 8")')
    }
    if (hasWeak) {
      out.push('Replace passive phrases ("responsible for", "worked on") with strong action verbs ("led", "developed", "achieved")')
    }
    if (metrics.length < 2 && !hasWeak) {
      out.push('Use more specific action verbs and include measurable outcomes in experience descriptions')
    }
  }
  
  // Content quality improvements
  if (scores.content < 65) {
    const currentYear = new Date().getFullYear()
    const hasRecent = [currentYear, currentYear - 1].some(y => fullText.includes(y.toString()))
    if (!hasRecent) {
      out.push('Highlight recent projects or continuous learning to demonstrate current market relevance')
    }
    if (expText.length < 200) {
      out.push('Expand experience descriptions with specific achievements, technologies used, and business impact')
    }
  }
  
  // Section completeness
  if (!sections.summary || sections.summary.length < 20) {
    out.push('Add a professional summary (2-3 lines) highlighting your key strengths and career focus')
  }
  
  if (!sections.projects || sections.projects.length < 30) {
    if (scores.experience < 60) {
      out.push('Include 2-3 portfolio projects with technologies used and outcomes achieved')
    }
  }
  
  // Formatting improvements
  if (scores.formatting < 70) {
    const hasBullets = /^\s*[-•*]\s+/m.test(Object.values(sections).join('\n'))
    if (!hasBullets) {
      out.push('Use bullet points for experience items to improve scannability')
    } else {
      out.push('Improve formatting consistency (spacing, alignment, section headers)')
    }
  }
  
  // ATS optimization
  if (scores.skills < 70 || scores.experience < 70) {
    out.push('Move key technical skills to a prominent Skills section for better ATS parsing')
  }
  
  // Provide specific, score-based improvements
  if (out.length < 2) {
    // Skills improvements based on actual score
    if (scores.skills < 85) {
      const currentSkills = skillsText.split(/[,\n]/).filter((s: string) => s.trim().length > 2).length
      if (currentSkills < 10) {
        out.push(`Add ${10 - currentSkills} more technical skills to reach recommended minimum of 10`)
      } else {
        out.push(`Current ${currentSkills} skills listed - consider adding specialized or emerging technologies`)
      }
    }
    
    // Experience improvements based on actual content
    if (scores.experience < 85) {
      const metrics = expText.match(/\d+[.,]?\d*\s*(percent|%|\$|k|m|b|years?|months?)/gi) || []
      if (metrics.length === 0) {
        out.push('Add at least 3-5 quantifiable metrics across your experience bullets')
      } else {
        out.push(`Currently ${metrics.length} metrics found - aim for at least ${metrics.length + 3} to strengthen impact`)
      }
    }
    
    // Content quality based on word count
    if (scores.content < 85) {
      const wordCount = fullText.split(/\s+/).length
      if (wordCount < 200) {
        out.push(`Expand resume content (currently ~${wordCount} words, aim for 300-500 for optimal detail)`)
      }
    }
  }
  
  // Final fallback with actionable next step
  if (out.length === 0) {
    const lowestScore = Math.min(scores.skills, scores.experience, scores.content)
    const lowestCategory = lowestScore === scores.skills ? 'Skills' : 
                           lowestScore === scores.experience ? 'Experience' : 'Content'
    out.push(`Focus on improving ${lowestCategory} section (currently ${lowestScore}/100) for maximum impact`)
    out.push('Add specific examples with measurable outcomes to strengthen your profile')
  }
  
  return out.slice(0, 5)
}

function generateSuggestions(text: string) {
  const suggestions: Array<{ type: string; before: string; after: string; explanation: string }> = []

  if (text.toLowerCase().includes('responsible for')) {
    suggestions.push({
      type: 'action_verb',
      before: 'Responsible for managing team projects',
      after: 'Led cross-functional team of 8 developers, delivering projects 15% ahead of schedule',
      explanation: 'Replace weak phrasing with strong verbs and measurable outcomes'
    })
  }
  if (!/\d+[%$]/.test(text)) {
    suggestions.push({
      type: 'quantifiable',
      before: 'Improved system performance',
      after: 'Optimized queries, reducing page load time by 40%',
      explanation: 'Quantify improvements to show clear impact'
    })
  }
  return suggestions
}

function calculateATSScore(text: string, sections: any): number {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Required sections (75% weight)
  const requiredSections = ['skills', 'experience', 'education']
  const requiredCount = requiredSections.filter(s => 
    sections[s] && sections[s].length > 30
  ).length
  const requiredCoverage = (requiredCount / requiredSections.length) * 75
  
  // Preferred sections (25% weight)
  const preferredSections = ['summary', 'projects', 'certifications']
  const preferredCount = preferredSections.filter(s => 
    sections[s] && sections[s].length > 20
  ).length
  const preferredCoverage = (preferredCount / preferredSections.length) * 25
  
  // Keyword coverage in core sections
  const coreText = (sections.skills || '') + ' ' + (sections.experience || '')
  const coreRatio = coreText.length / Math.max(1, text.length)
  const placementBonus = coreRatio > 0.6 ? 10 : 0
  
  // Base score: section coverage + placement bonus
  let score = requiredCoverage + preferredCoverage + placementBonus
  
  // Map to 10-95 range (avoid extremes)
  score = 10 + (score / 110) * 85
  
  return Math.round(Math.min(95, Math.max(10, score)))
}

/* =========================
   Gemini (optional)
========================= */
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
const cap = (s: string, n = 3000) => (s || '').slice(0, n)

function normalizeAnalysis(a: Partial<ResumeAnalysis>): ResumeAnalysis {
  const ats = clamp((a as any).atsScore ?? a.atsCompatibility ?? 70, 10, 95)
  return {
    overallScore: clamp(a.overallScore ?? 75, 0, 100),
    clarityScore: a.clarityScore !== undefined ? clamp(a.clarityScore, 0, 100) : undefined,
    seniorityLevel: a.seniorityLevel,
    redFlags: a.redFlags ?? [],
    atsScore: ats,
    atsCompatibility: ats, // keep for components still expecting this field
    // Provide sensible defaults so UI never renders empty lists
    strengths: (a.strengths && a.strengths.length > 0)
      ? a.strengths
      : ['Clean structure and clear section headings', 'Relevant technical skills highlighted', 'Consistent career progression'],
    improvements: (a.improvements && a.improvements.length > 0)
      ? a.improvements
      : ['Add quantifiable metrics (%, $) to achievements', 'Use stronger action verbs (led, implemented, achieved)', 'Include recent projects or certifications'],
    sections: a.sections ?? [],
    suggestions: a.suggestions ?? [],
    skillGapAnalysis: a.skillGapAnalysis,
    careerSuggestions: a.careerSuggestions
  } as ResumeAnalysis
}

async function analyzeWithGemini(parsedResume: any): Promise<ResumeAnalysis> {
  const basic = await performBasicAnalysis(parsedResume)
  const advanced = await performAdvancedAnalysis(parsedResume)
  
  return normalizeAnalysis({
    overallScore: basic.overallScore,
    strengths: basic.strengths,
    improvements: basic.improvements,
    sections: basic.sections,
    atsCompatibility: basic.atsCompatibility,
    suggestions: basic.suggestions,
    skillGapAnalysis: advanced.skillGapAnalysis,
    careerSuggestions: advanced.careerSuggestions
  })
}

/* =========================
   Gemini API Call (with retry)
========================= */
async function callGeminiAPIOnce(prompt: string, kind: 'basic' | 'advanced', parsedResume?: any): Promise<any> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const isDev = process.env.NODE_ENV !== 'production'

  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 20000)
  try {
                const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
            const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.4,
            maxOutputTokens: 4096
          }
        }),
        signal: ac.signal
      }
    )
    clearTimeout(timer)
    if (!resp.ok) {
      const t = await resp.text()
      if (isDev) console.error(`Gemini ${kind} API error ${resp.status}:`, t)
      throw new Error(`Gemini ${kind} error ${resp.status}: ${t}`)
    }
    const data = await resp.json()
    
    if (isDev) {
      console.log(`\n=== GEMINI ${kind.toUpperCase()} FULL API RESPONSE ===`)
      console.log('Response structure:', JSON.stringify(data, null, 2).substring(0, 1000))
      console.log('==========================================\n')
    }
    
    const aiText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    if (isDev) {
      console.log(`\n=== GEMINI ${kind.toUpperCase()} EXTRACTED TEXT ===`)
      console.log(aiText.substring(0, 800))
      console.log('=====================================\n')
    }

    let cleaned = aiText.trim()
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*|\s*```$/g, '')
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*|\s*```$/g, '')
    
    // Extract the complete JSON object (greedy match from first { to last })
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1)
    }
    
    if (!cleaned.startsWith('{')) {
      if (isDev) console.warn(`Gemini ${kind}: No valid JSON found in response`)
      return generateFallbackAnalysis(kind, parsedResume)
    }
    
    try {
      const parsed = JSON.parse(cleaned)
      
      // Validate that Gemini actually returned useful content
      if (kind === 'basic') {
        const hasStrengths = Array.isArray(parsed.strengths) && parsed.strengths.length > 0
        const hasImprovements = Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        const hasScore = typeof parsed.overallScore === 'number' && parsed.overallScore > 0
        
        if (!hasStrengths && !hasImprovements && !hasScore) {
          if (isDev) console.warn(`Gemini ${kind} returned empty/invalid response, using fallback`)
          return generateFallbackAnalysis(kind, parsedResume)
        }
      }
      
      if (isDev) {
        console.log(`Gemini ${kind} parsed successfully:`, {
          strengths: parsed.strengths?.length || 0,
          improvements: parsed.improvements?.length || 0,
          overallScore: parsed.overallScore,
          sections: parsed.sections?.length || 0,
          atsCompatibility: parsed.atsCompatibility
        })
      }
      return parsed
    } catch (e) {
      if (isDev) console.error(`Gemini ${kind} JSON parse failed:`, e)
      return generateFallbackAnalysis(kind, parsedResume)
    }
  } catch (e) {
    clearTimeout(timer)
    if (isDev) console.error(`Gemini ${kind} call failed:`, e)
    return generateFallbackAnalysis(kind, parsedResume)
  }
}

async function callGeminiAPI(prompt: string, kind: 'basic' | 'advanced', parsedResume?: any): Promise<any> {
  const isDev = process.env.NODE_ENV !== 'production'
  try {
    return await callGeminiAPIOnce(prompt, kind, parsedResume)
  } catch (e) {
    if (isDev) console.log(`Gemini ${kind} failed, retrying once...`)
    try {
      return await callGeminiAPIOnce(prompt, kind, parsedResume)
    } catch (retryError) {
      if (isDev) console.error(`Gemini ${kind} retry also failed`)
      throw retryError
    }
  }
}

async function performBasicAnalysis(parsedResume: any): Promise<Partial<ResumeAnalysis>> {
  const ctx = analyzeResumeContext(parsedResume)
  // Remove contact information for privacy
  const sanitizedFullText = parsedResume.fullText.replace(parsedResume.sections.contact || '', '')
  const resumeText = sanitizedFullText.substring(0, 2500)
  
  const prompt = `Analyze this resume and return JSON with this EXACT structure:

{
  "overallScore": 78,
  "atsScore": 81,
  "clarityScore": 72,
  "seniorityLevel": "mid",
  "redFlags": ["too generic summary"],
  "sections": [
    {"title": "Skills", "content": "", "score": 83, "feedback": []},
    {"title": "Experience", "content": "", "score": 77, "feedback": []},
    {"title": "Education", "content": "", "score": 79, "feedback": []}
  ],
  "suggestions": [
    {"before": "Managed team projects", "after": "Led cross-functional team of 5 engineers, delivering 3 projects on time, increasing efficiency by 25%"},
    {"before": "Developed web application", "after": "Built scalable web application using React and Node.js, serving 10,000+ users with 99.9% uptime"}
  ]
}

Resume:
${resumeText}

Instructions:
- Detect the resume language and respond in THE SAME LANGUAGE (French resume = French suggestions, English resume = English suggestions)
- Ignore any text encoding issues - focus on CONTENT quality
- Give 3-5 specific strengths mentioning actual skills/companies/years from the resume
- Give 3-5 actionable improvements about missing metrics, weak verbs, or vague descriptions
- For suggestions: Pick 2-3 bullets that lack metrics/impact and rewrite them IN THE SAME LANGUAGE with quantifiable achievements
- DO NOT suggest fixing language or encoding - only suggest adding metrics, stronger action verbs, or measurable outcomes
- Score from 0-100
- Return ONLY valid JSON, no other text`

  return await callGeminiAPI(prompt, 'basic', parsedResume)
}

async function performAdvancedAnalysis(parsedResume: any): Promise<Partial<ResumeAnalysis>> {
  const ctx = analyzeResumeContext(parsedResume)
  
  // Cap inputs to prevent token overload
  const skillsForPrompt = cap(parsedResume.sections.skills, 2000)
  const expForPrompt = cap(parsedResume.sections.experience, 2000)
  
  const prompt = `You are a ${ctx.industry} industry expert. Provide advanced career analysis for this ${ctx.level} ${ctx.primaryRole}.

Skills: ${skillsForPrompt}
Experience: ${expForPrompt}

Return ONLY valid JSON:
{
  "skillGapAnalysis": {
    "missingSkills": ["..."],
    "skillLevel": "Mid",
    "recommendedSkills": ["..."],
    "learningPaths": [{"skill":"...", "priority":"High", "timeToLearn":"3-6 months", "resources":["..."]}]
  },
  "careerSuggestions": {
    "nextRoles": ["Senior Developer","Tech Lead"],
    "careerPath":[{"role":"Senior Developer","timeframe":"1-2 years","requirements":["..."]}],
    "promotionReadiness": 75
  }
}`
  return await callGeminiAPI(prompt, 'advanced', parsedResume)
}

function analyzeResumeContext(parsedResume: any) {
  const full = (parsedResume.fullText || '').toLowerCase()
  const skillsText = (parsedResume.sections.skills || '').toLowerCase()
  const industries: Record<string, string[]> = {
    technology: ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'api', 'software', 'developer', 'engineer'],
    healthcare: ['medical', 'hospital', 'patient', 'clinical', 'healthcare', 'nursing', 'doctor'],
    finance: ['finance', 'bank', 'investment', 'accounting', 'audit', 'portfolio', 'trading', 'risk'],
    marketing: ['marketing', 'brand', 'campaign', 'seo', 'content'],
    sales: ['sales', 'revenue', 'client', 'customer', 'quota', 'pipeline', 'crm'],
    education: ['teaching', 'education', 'curriculum', 'student', 'academic', 'research'],
    design: ['design', 'ui', 'ux', 'figma', 'photoshop', 'graphic']
  }
  let detected = 'general'
  let max = 0
  for (const [ind, keys] of Object.entries(industries)) {
    const n = keys.filter((k) => full.includes(k)).length
    if (n > max) {
      max = n
      detected = ind
    }
  }
  const levelMap: Record<string, string[]> = {
    senior: ['senior', 'lead', 'principal', 'architect', 'director', 'manager', '10+ years', '8+ years'],
    mid: ['mid', 'experienced', '5+ years', '4+ years', '3+ years', 'specialist'],
    junior: ['junior', 'entry', 'associate', 'intern', '1+ year', '2+ years', 'graduate']
  }
  let level = 'mid'
  for (const [l, keys] of Object.entries(levelMap)) {
    if (keys.some((k) => full.includes(k))) {
      level = l
      break
    }
  }
  const roles = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'specialist', 'coordinator']
  const primaryRole = roles.find((r) => full.includes(r)) || 'professional'
  const keySkills = skillsText
    .split(/[,\n]/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 2)
    .slice(0, 5)
  return { industry: detected, level, primaryRole, keySkills: keySkills.length ? keySkills : ['general skills'] }
}

/* =========================
   Fallbacks
========================= */
function extractCompanyNames(text: string): string[] {
  const companies: string[] = []
  const patterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company|Ltd)?)/g,
    /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company|Ltd|Technologies|Solutions|Group))/g
  ]
  for (const p of patterns) {
    let m
    while ((m = p.exec(text)) !== null) {
      const c = m[1].trim()
      if (c.length > 2 && c.length < 40 && !companies.includes(c)) companies.push(c)
    }
  }
  return companies.slice(0, 3)
}

function generatePersonalizedStrengths(context: any, parsedResume: any, companies: string[], skills: string[]): string[] {
  const out: string[] = []
  if (companies.length) out.push(`Experience at ${companies[0]}${companies.length > 1 ? ` and ${companies.length - 1} other companies` : ''} indicates progression`)
  if (skills.length) out.push(`Relevant ${context.industry} skills: ${skills.join(', ')}`)
  if (parsedResume.sections.education && parsedResume.sections.education.length > 20) {
    out.push(`Education supports ${context.primaryRole} requirements`)
  } else {
    out.push(`Clear presentation of ${context.level}-level experience`)
  }
  return out.slice(0, 3)
}

function generatePersonalizedImprovements(context: any, parsedResume: any, hasMetrics: boolean, hasStrongVerbs: boolean): string[] {
  const out: string[] = []
  if (!hasMetrics) out.push(`Add quantifiable achievements (e.g., "increased efficiency by 25%") for ${context.industry}`)
  if (!hasStrongVerbs) out.push(`Use stronger action verbs (led, implemented, achieved) for ${context.level} ${context.primaryRole}`)
  if ((context.keySkills || []).length < 5) out.push(`Expand ${context.industry}-specific tools/technologies to improve ATS`)
  else out.push(`Consider adding certifications to stand out for ${context.primaryRole}`)
  return out.slice(0, 3)
}

function generateFallbackAnalysis(kind: 'basic' | 'advanced', parsedResume?: any): any {
  if (kind === 'basic' && parsedResume) {
    const ctx = analyzeResumeContext(parsedResume)
    const hasMetrics = /\b\d+%|\b\d+\$|\b\d+[kmb]\b|\b\d+x\b|increased|reduced|improved|grew/i.test(parsedResume.fullText || '')
    const hasStrong = /\b(led|developed|implemented|achieved|built|created|launched|designed|managed)\b/i.test(parsedResume.fullText || '')
    const companies = extractCompanyNames(parsedResume.fullText || '')
    const skills = ctx.keySkills.slice(0, 3)
    return {
      overallScore: hasMetrics ? 82 : 68,
      strengths: generatePersonalizedStrengths(ctx, parsedResume, companies, skills),
      improvements: generatePersonalizedImprovements(ctx, parsedResume, hasMetrics, hasStrong),
      atsCompatibility: skills.length >= 3 ? 78 : 65,
      sections: [],
      suggestions: []
    }
  }
  return {
    skillGapAnalysis: {
      missingSkills: ['Advanced certification', 'Leadership experience', 'Industry-specific tools'],
      skillLevel: 'Mid',
      recommendedSkills: ['Project management', 'Team leadership', 'Strategic planning'],
      learningPaths: [{ skill: 'Project Management', priority: 'High', timeToLearn: '3-6 months', resources: ['PMP Certification', 'Online courses'] }]
    },
    careerSuggestions: {
      nextRoles: ['Senior Developer', 'Team Lead', 'Project Manager'],
      careerPath: [{ role: 'Senior Developer', timeframe: '1-2 years', requirements: ['Advanced technical skills', 'Mentoring experience'] }],
      promotionReadiness: 75
    }
  }
}
