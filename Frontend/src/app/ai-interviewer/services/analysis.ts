// AI Analysis service - handles all AI analysis API calls
import { Question } from '../../../data/interview-questions'

export interface IndividualAnalysis {
  scores: {
    content_correctness: number;
    depth_technical_reasoning: number;
    structure_STAR: number;
    communication_clarity: number;
    relevance_focus: number;
    evidence_specificity: number;
    overall: number;
  };
  star: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  flags: {
    answered_the_question: boolean;
    possible_fabrication: boolean;
    generic_buzzwords: boolean;
  };
  feedback: {
    one_liner: string;
    quick_wins: string[];
    follow_ups: Array<{purpose: string; question: string}>;
  };
}

export interface ComprehensiveAnalysis {
  overall: {
    score_10: number;
    verdict: "strong" | "average" | "weak";
    rationale: string;
  };
  strengths: string[];
  areas_for_improvement: string[];
  next_steps: string[];
}

// Enhanced individual answer analysis with structured JSON response
export const analyzeIndividualAnswer = async (
  question: string, 
  answer: string, 
  selectedType: "technical" | "behavioral" | "general",
  difficulty: "easy" | "medium" | "hard"
): Promise<{score: number, feedback: string}> => {
  console.log('🧠 Analyzing individual answer with structured JSON for', selectedType, 'interview...')
  
  try {
    // Rubric presets for different interview types
    const rubricPresets = {
      technical: {
        notes: "prioritize correctness, problem-solving, tradeoffs, efficiency, testing",
        red_flags: ["hand-wavy design", "no tradeoffs", "fabricated metrics"]
      },
      behavioral: {
        notes: "STAR presence, ownership, conflict resolution, measurable impact", 
        red_flags: ["no Result", "vague team role", "learned nothing"]
      },
      general: {
        notes: "motivation fit, clarity, relevance, structured thinking",
        red_flags: ["platitudes", "off-topic", "no examples"]
      }
    }

    const currentRubric = rubricPresets[selectedType]
    
    // Individual answer analysis prompt with JSON schema
    const analysisPrompt = `You are an interview answer analyst. Be strict, concise, and personalized to THIS specific candidate's response.

Rules:
- Assume ASR (speech-to-text) errors; ignore minor grammar unless meaning changes.  
- Judge only what the candidate explicitly said; reference their actual words and examples.
- Make feedback SPECIFIC to their response - not generic advice.
- Prefer evidence (metrics, examples, tradeoffs) over opinion.
- Use STAR mapping when applicable (don't force if irrelevant).
- Be robust to short, partial, or rambling answers; reward substance over length.
- CRITICAL: Return ONLY raw JSON object. NO markdown code blocks, NO \`\`\`json tags, NO extra text.

QUESTION: ${question}

CONTEXT:
- Interview type: ${selectedType}
- Seniority: mid-level  
- Skills focus: ${currentRubric.notes}
- Difficulty: ${difficulty}

CANDIDATE (ASR transcript, may include errors):
"""
${answer}
"""

ASR CONTEXT:
- Speaking time: ${Math.max(5, answer.length * 0.1)} seconds (estimated)
- ASR confidence: medium (assume some grammar/pronunciation errors)
- Instructions: Ignore minor grammar unless meaning changes; focus on substance over style

SCORING RUBRIC (weights sum to 1.0):
- content_correctness (0.30)
- depth_technical_reasoning (0.20) 
- structure_STAR (0.15)
- communication_clarity (0.15)
- relevance_focus (0.10)
- evidence_specificity (0.10)

Red flags: ${currentRubric.red_flags.join(', ')}

INSTRUCTIONS:
- Rate each sub-score 0–1 with two decimals; set "overall" as weighted sum *100, rounded to integer (0–100)
- Be FAIR but REALISTIC - don't give high scores for vague/generic answers
- 80-100: Exceptional answer with specific examples, clear reasoning, strong evidence
- 60-79: Good answer with some specifics but room for more depth
- 40-59: Adequate answer but lacking specifics or structure
- 20-39: Weak answer that's vague or misses the question
- 0-19: No meaningful response or completely off-topic
- "answered_the_question": true if they addressed the asked question
- Populate STAR only if clearly present; otherwise leave fields ""
- If you suspect made-up numbers/claims, set "possible_fabrication": true
- "one_liner": Short actionable summary (1-2 sentences max)
- "quick_wins": 2-3 SHORT actionable tips (each 10-15 words max) - focus on WHAT TO DO, not what they did wrong
  Example: "Add specific metrics to quantify your impact" NOT "The candidate failed to provide metrics which would have strengthened..."

OUTPUT JSON matching this schema:
{
  "scores": {
    "content_correctness": 0.00,
    "depth_technical_reasoning": 0.00,
    "structure_STAR": 0.00,
    "communication_clarity": 0.00,
    "relevance_focus": 0.00,
    "evidence_specificity": 0.00,
    "overall": 0
  },
  "star": {
    "situation": "",
    "task": "",
    "action": "",
    "result": ""
  },
  "flags": {
    "answered_the_question": false,
    "possible_fabrication": false,
    "generic_buzzwords": false
  },
  "feedback": {
    "one_liner": "",
    "quick_wins": [],
    "follow_ups": [{"purpose": "", "question": ""}]
  }
}`

    console.log('📝 Sending structured analysis request to Gemini...')

    const response = await fetch('/api/analyze-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: analysisPrompt,
      }),
    })

    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.status}`)
    }

    const data = await response.json()
    let analysisResult: IndividualAnalysis
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedAnalysis = data.analysis.trim()
      
      // Remove markdown JSON code blocks
      if (cleanedAnalysis.startsWith('```json')) {
        cleanedAnalysis = cleanedAnalysis.replace(/^```json\s*/i, '').replace(/```\s*$/, '')
      } else if (cleanedAnalysis.startsWith('```')) {
        cleanedAnalysis = cleanedAnalysis.replace(/^```\s*/i, '').replace(/```\s*$/, '')
      }
      
      // Parse the JSON response from AI
      analysisResult = JSON.parse(cleanedAnalysis)
      console.log('✅ Structured analysis parsed successfully:', analysisResult)
      console.log('📊 Score calculated:', analysisResult.scores.overall)
    } catch (parseError) {
      console.error('⚠️ JSON parsing failed:', parseError)
      console.error('Raw response:', data.analysis)
      // Fallback to legacy format
      return {
        score: 50,
        feedback: data.analysis || 'Analysis format error - please try again'
      }
    }

    // Extract score and prepare structured feedback for UI
    const score = Math.min(95, Math.max(0, analysisResult.scores.overall))
    
    // Create clean actionable feedback (no markdown)
    const structuredFeedback = `
${analysisResult.feedback.one_liner}

What to improve:
${analysisResult.feedback.quick_wins.map((win, idx) => `${idx + 1}. ${win}`).join('\n')}

${analysisResult.flags.answered_the_question ? '' : 'Note: Your answer did not fully address the question asked.\n'}
${analysisResult.flags.possible_fabrication ? 'Caution: Some claims seemed unverifiable - provide specific evidence.\n' : ''}
${analysisResult.flags.generic_buzzwords ? 'Tip: Replace buzzwords with concrete examples from your experience.\n' : ''}
    `.trim()

    console.log('📊 Individual analysis complete - Score:', score)
    return { score, feedback: structuredFeedback }

  } catch (error) {
    console.error('❌ Individual answer analysis failed:', error)
    return {
      score: 0,
      feedback: 'Analysis temporarily unavailable. Please check your API configuration.'
    }
  }
}

// Individual question analysis with Gemini AI
export const analyzeIndividualQuestions = async (
  questions: Question[],
  answers: string[],
  selectedType: "technical" | "behavioral" | "general"
): Promise<string[]> => {
  console.log('🔍 Starting individual question analysis...')
  const analyses: string[] = []
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const answer = answers[i] || ''
    
    console.log(`Analyzing question ${i + 1}/${questions.length}`)
    
    if (!answer.trim()) {
      analyses.push('No response provided for this question.')
      continue
    }
    
    try {
      const analysisPrompt = `
        As an expert ${selectedType} interview coach, provide specific feedback for this single question and answer:

        INTERVIEW TYPE: ${selectedType.toUpperCase()}
        QUESTION: "${question.text}"
        CANDIDATE'S ANSWER: "${answer}"

        Provide a brief but specific analysis (2-3 sentences) focusing on:
        - What they did well in this specific answer
        - One specific area for improvement 
        - How this answer could be enhanced

        CRITICAL: Reference their actual words and response content. Be specific, not generic.
        NO markdown formatting. Write in clean, professional text.
      `

      const geminiResponse = await fetch('/api/analyze-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysisPrompt })
      })

      if (geminiResponse.ok) {
        const data = await geminiResponse.json()
        const analysis = data.analysis || 'Analysis completed.'
        analyses.push(analysis.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/#{1,6}\s*/g, '').trim())
      } else {
        analyses.push('Analysis temporarily unavailable.')
      }
    } catch (error) {
      console.error(`Failed to analyze question ${i + 1}:`, error)
      analyses.push('Analysis temporarily unavailable.')
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('✅ Individual question analysis completed')
  return analyses
}

// Comprehensive post-interview analysis with Gemini AI
export interface ComprehensiveAnalysisResult {
  score: number;
  verdict: string;
  rationale: string;
  strengths: string[];
  areas_for_improvement: string[];
  next_steps: string[];
}

export const analyzeCompleteInterview = async (
  questions: Question[],
  answers: string[],
  scores: number[],
  selectedType: "technical" | "behavioral" | "general",
  difficulty: "easy" | "medium" | "hard"
): Promise<ComprehensiveAnalysisResult> => {
  console.log('🧠 Analyzing complete interview with Gemini AI...')
  
  try {
    // Calculate average of individual question scores for balanced overall score
    const validScores = scores.filter(score => score > 0)
    const questionBreakdownAverage = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length / 10) // Convert to /10 scale
      : 5 // Default to middle score if no valid scores
    
    console.log('📊 Question Breakdown Average:', questionBreakdownAverage + '/10')
    console.log('📋 Individual Scores:', validScores)
    
    // Build the complete interview context
    const interviewData = questions.map((q, index) => ({
      question: q.text,
      response: answers[index] || 'No response provided',
      category: q.category
    }))

    // Create interview-type-specific comprehensive analysis
    let expertRole = ''
    
    switch (selectedType) {
      case 'technical':
        expertRole = 'senior technical interviewer and engineering manager'
        break
        
      case 'behavioral':
        expertRole = 'experienced HR director and behavioral interview specialist'
        break
        
      case 'general':
        expertRole = 'senior hiring manager and interview specialist'
        break
    }

    // Enhanced structured JSON prompt for comprehensive analysis
    const analysisPrompt = `You are an interview analysis expert. Be holistic, evidence-based, and PERSONALIZED to this candidate.

Rules:
- Judge the complete interview flow, consistency, and depth
- Reference what THIS candidate actually said - quote their words when relevant
- Provide SPECIFIC feedback tied to their actual responses, not generic interview advice
- Make strengths/weaknesses CONCRETE based on what you observed
- Balance individual question scores with holistic assessment
- CRITICAL: Return ONLY raw JSON object. NO markdown code blocks, NO \`\`\`json tags, NO extra text.

INTERVIEW TYPE: ${selectedType}
DIFFICULTY: ${difficulty}
SENIORITY: mid-level
SKILLS: ${selectedType === 'technical' ? 'problem-solving, system design, coding, communication' : selectedType === 'behavioral' ? 'leadership, teamwork, conflict resolution, growth mindset' : 'communication, motivation, cultural fit, professionalism'}

QUESTIONS & ANSWERS:
${interviewData.map((item, index) => `
Q${index + 1}: "${item.question}"
A${index + 1}: "${item.response || '[No response provided]'}"
`).join('')}

ADDITIONAL SIGNALS:
- Individual question scores average: ${questionBreakdownAverage}/10
- Question breakdown scores: ${validScores.join(', ')}

TASK:
Produce a holistic evaluation as JSON. Requirements for CONCISE, ACTIONABLE feedback:
- "overall.score_10": integer 1-10 based on complete interview performance (not just average)
- "overall.verdict": strong | average | weak  
- "overall.rationale": 2-3 sentences that reference SPECIFIC things this candidate said or did
- "strengths": 2-4 SHORT items (15-25 words each) describing what THIS candidate did well
  Example: "Provided concrete metrics when discussing project impact, specifically mentioning 40% performance improvement"
- "areas_for_improvement": 2-4 SHORT items (15-25 words each) stating what to fix - be direct and actionable
  Example: "Explain the reasoning behind technical decisions, not just what was implemented"
- "next_steps": 2-3 concrete, SHORT actions (10-20 words each) tailored to THEIR improvement areas
  Example: "Practice explaining 'Why did you choose X?' for every technical decision you make"
- NO question_summaries field needed (individual feedback is shown separately)

SCORING GUIDE (holistic):
- 8-10: specific examples, clear reasoning, strong communication, depth
- 6-7: generally good, some missing specificity or structure  
- 4-5: adequate but vague, inconsistent, or surface-level
- 1-3: weak, off-topic, or no meaningful responses

Focus areas for ${selectedType}: ${selectedType === 'technical' ? 'correctness, problem-solving approach, system thinking, trade-offs' : selectedType === 'behavioral' ? 'STAR structure, leadership impact, self-awareness, team dynamics' : 'motivation clarity, communication skills, cultural alignment, professionalism'}

OUTPUT: Return JSON exactly matching this schema:
{
  "overall": {
    "score_10": 0,
    "verdict": "average",
    "rationale": ""
  },
  "strengths": [],
  "areas_for_improvement": [],
  "next_steps": []
}`
    
    console.log('🔍 DEBUGGING: Interview data being sent to Gemini:')
    console.log('📋 Questions & Answers:', interviewData)
    console.log('📝 Full prompt length:', analysisPrompt.length)

    const geminiResponse = await fetch('/api/analyze-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: analysisPrompt,
      }),
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const data = await geminiResponse.json()
    
    // Validate response
    if (!data || !data.analysis) {
      throw new Error('Invalid response from analysis API')
    }
    
    let rawAnalysis = data.analysis
    
    // Clean the response - remove markdown code blocks if present
    if (rawAnalysis.startsWith('```json')) {
      rawAnalysis = rawAnalysis.replace(/^```json\s*/i, '').replace(/```\s*$/, '')
    } else if (rawAnalysis.startsWith('```')) {
      rawAnalysis = rawAnalysis.replace(/^```\s*/i, '').replace(/```\s*$/, '')
    }
    
    let comprehensiveResult: ComprehensiveAnalysis
    
    try {
      // Parse structured JSON response
      comprehensiveResult = JSON.parse(rawAnalysis)
      console.log('✅ Structured comprehensive analysis parsed:', comprehensiveResult)
      
      // Extract AI's holistic score and balance with question breakdown
      const aiHolisticScore = comprehensiveResult.overall.score_10 || questionBreakdownAverage
      const balancedOverallScore = Math.round((questionBreakdownAverage + aiHolisticScore) / 2)
      
      console.log('🎯 Scoring Breakdown:')
      console.log('📊 Question Breakdown Average:', questionBreakdownAverage + '/10')
      console.log('🧠 AI Holistic Assessment:', aiHolisticScore + '/10') 
      console.log('⚖️ Balanced Overall Score:', balancedOverallScore + '/10')
      
      // Update with balanced score
      comprehensiveResult.overall.score_10 = balancedOverallScore
      
      console.log('✅ Comprehensive analysis with balanced scoring completed')
      
      // Return structured data for proper UI rendering (not plain text)
      return {
        score: balancedOverallScore,
        verdict: comprehensiveResult.overall.verdict.toUpperCase(),
        rationale: comprehensiveResult.overall.rationale,
        strengths: comprehensiveResult.strengths || [],
        areas_for_improvement: comprehensiveResult.areas_for_improvement || [],
        next_steps: comprehensiveResult.next_steps || []
      }
      
    } catch (parseError) {
      console.warn('⚠️ JSON parsing failed, using fallback format:', parseError)
      console.log('Raw analysis received:', rawAnalysis)
      
      // Return fallback structured data with proper scoring
      const balancedOverallScore = questionBreakdownAverage
      
      throw new Error(`Failed to parse AI analysis: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
    
  } catch (error) {
    console.error('❌ Interview analysis failed:', error)
    
    // Return fallback structured data on any error
    const validScores = scores.filter(score => score > 0)
    const questionBreakdownAverage = validScores.length > 0 
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length / 10)
      : 5
    
    return {
      score: questionBreakdownAverage,
      verdict: questionBreakdownAverage >= 8 ? 'STRONG' : questionBreakdownAverage >= 6 ? 'AVERAGE' : 'DEVELOPING',
      rationale: `Based on your responses across ${questions.length} questions. Note: Full AI analysis temporarily unavailable.`,
      strengths: [
        'Completed the interview and provided responses',
        'Demonstrated engagement throughout the process',
        'Showed willingness to participate and learn'
      ],
      areas_for_improvement: [
        'Provide more specific, detailed examples from your experience',
        'Structure responses using the STAR method (Situation, Task, Action, Result)',
        'Quantify achievements and outcomes with metrics whenever possible'
      ],
      next_steps: [
        'Practice common interview questions in your field daily',
        'Prepare 3-5 detailed stories that showcase your skills',
        'Record yourself answering questions to improve delivery'
      ]
    }
  }
}
