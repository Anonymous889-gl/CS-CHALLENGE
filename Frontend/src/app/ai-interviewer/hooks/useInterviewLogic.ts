import { useCallback } from 'react'
import { getStructuredQuestions } from '../../../data/interview-questions'
import { InterviewType, DifficultyLevel } from './useInterviewState'

interface UseInterviewLogicProps {
  selectedType: InterviewType
  difficulty: DifficultyLevel
  duration: number
  questions: any[]
  currentQuestionIndex: number
  answers: string[]
  scores: number[]
  setQuestions: (questions: any[]) => void
  setAnswers: (answers: string[]) => void
  setScores: (scores: number[]) => void
  setCurrentQuestionIndex: (index: number) => void
  setCurrentAnswer: (answer: string) => void
  setTimeLeft: (time: number) => void
  setPhase: (phase: any) => void
  setIsTimerRunning: (running: boolean) => void
  setIsRecording: (recording: boolean) => void
  setCurrentScore: (score: number | null) => void
  setCurrentAnalysis: (analysis: string) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setQuestionAnalyses: (analyses: string[]) => void
}

export function useInterviewLogic({
  selectedType,
  difficulty,
  duration,
  questions,
  currentQuestionIndex,
  answers,
  scores,
  setQuestions,
  setAnswers,
  setScores,
  setCurrentQuestionIndex,
  setCurrentAnswer,
  setTimeLeft,
  setPhase,
  setIsTimerRunning,
  setIsRecording,
  setCurrentScore,
  setCurrentAnalysis,
  setIsAnalyzing,
  setQuestionAnalyses
}: UseInterviewLogicProps) {

  const startInterview = useCallback(() => {
    // Always get 5 questions regardless of duration
    const questionCount = 5
    const selectedQuestions = getStructuredQuestions(selectedType, difficulty, questionCount)
    
    console.log('🎯 Interview setup:')
    console.log('Duration:', duration, 'minutes')
    console.log('Question count:', questionCount)
    console.log('Selected questions:', selectedQuestions.length)
    
    if (selectedQuestions.length === 0) {
      // Fallback if no questions found for criteria
      alert('No questions available for the selected criteria. Please try different settings.')
      return
    }

    console.log('🎯 Starting interview setup...')
    console.log('Selected questions:', selectedQuestions.length)
    
    setQuestions(selectedQuestions)
    setAnswers(new Array(selectedQuestions.length).fill(""))
    setScores(new Array(selectedQuestions.length).fill(0))
    setCurrentQuestionIndex(0)
    setCurrentAnswer("")
    const totalTimeInSeconds = duration * 60 // Convert minutes to seconds
    setTimeLeft(totalTimeInSeconds)
    
    // Move to permissions phase
    setPhase("permissions")
    console.log('✅ Moved to permissions phase')
  }, [selectedType, difficulty, duration, setQuestions, setAnswers, setScores, setCurrentQuestionIndex, setCurrentAnswer, setTimeLeft, setPhase])

  const finishInterview = useCallback(() => {
    console.log('🏁 Finishing interview...')
    
    // Stop all ongoing processes
    setIsTimerRunning(false)
    setIsRecording(false)
    
    // Move to analyzing phase first for better UX
    setPhase("analyzing")
    
    // Capture current state snapshots to avoid stale closures
    const answersSnapshot = [...answers]
    const questionsSnapshot = [...questions]
    
    console.log('📊 Interview Progress:', currentQuestionIndex + 1, 'of', questions.length, 'questions')
    
    // Process all answers and get analysis results
    setTimeout(async () => {
      try {
        // Analyze all individual questions concurrently
        console.log('🧠 Starting batch analysis of all questions...')
        
        // Create analysis promises for all questions
        const allAnalyses = await Promise.all(
          answersSnapshot.map(async (answer, index) => {
                          if (!answer.trim()) {
              return { score: 0, feedback: 'No response provided for this question.' }
            }
            
            const question = questionsSnapshot[index]
            try {
              const result = await analyzeIndividualAnswer(question.text, answer)
              return result
            } catch (error) {
              console.error(`Analysis failed for question ${index}:`, error)
              return { score: 0, feedback: 'Analysis failed for this question.' }
            }
           
          })
        )
        
        console.log('✅ Batch individual analysis completed')
        
        // Update individual scores and analyses
        const newScores = allAnalyses.map(result => result.score)
        const newAnalyses = allAnalyses.map(result => result.feedback)
        setScores(newScores)
        setQuestionAnalyses(newAnalyses)
        
        // Move to results phase
        setPhase("results")
        console.log('🎯 Moved to results phase with completed individual analyses')
        
      } catch (error) {
        console.error('❌ Error during interview completion:', error)
        setPhase("results") // Still move to results even if analysis fails
      }
    }, 1000) // Small delay for UX
  }, [answers, questions, currentQuestionIndex, setIsTimerRunning, setIsRecording, setPhase, setScores, setQuestionAnalyses])

  // Enhanced individual answer analysis with structured JSON response
  const analyzeIndividualAnswer = async (question: string, answer: string): Promise<{score: number, feedback: string}> => {
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
      const analysisPrompt = `You are an interview answer analyst. Be strict, concise, and consistent.

Rules:
- Assume ASR (speech-to-text) errors; ignore minor grammar unless meaning changes.  
- Judge only what the candidate explicitly said; never invent facts or infer unstated skills.
- Prefer evidence (metrics, examples, tradeoffs) over opinion.
- Use STAR mapping when applicable (don't force if irrelevant).
- Be robust to short, partial, or rambling answers; reward substance over length.
- Absolutely return JSON only (no prose, markdown, or leading/trailing text).

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
- "answered_the_question": true if they addressed the asked question
- Populate STAR only if clearly present; otherwise leave fields ""
- If you suspect made-up numbers/claims, set "possible_fabrication": true
- Feedback should be actionable and specific to THIS answer

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
      let analysisResult: any
      
      try {
        // Parse the JSON response from AI
        analysisResult = JSON.parse(data.analysis)
        console.log('✅ Structured analysis parsed successfully:', analysisResult)
      } catch (parseError) {
        console.warn('⚠️ JSON parsing failed, falling back to legacy format:', parseError)
        // Fallback to legacy format
        return {
          score: 50,
          feedback: data.analysis || 'Analysis format error - please try again'
        }
      }

      // Extract score and prepare structured feedback for UI
      const score = Math.min(95, Math.max(0, analysisResult.scores.overall))
      
      // Create rich structured feedback display
      const structuredFeedback = `
**Analysis Summary:** ${analysisResult.feedback.one_liner}

**Dimensional Scores:**
• Content Correctness: ${Math.round(analysisResult.scores.content_correctness * 100)}%
• Technical Depth: ${Math.round(analysisResult.scores.depth_technical_reasoning * 100)}%
• Structure (STAR): ${Math.round(analysisResult.scores.structure_STAR * 100)}%
• Communication: ${Math.round(analysisResult.scores.communication_clarity * 100)}%
• Relevance: ${Math.round(analysisResult.scores.relevance_focus * 100)}%
• Evidence: ${Math.round(analysisResult.scores.evidence_specificity * 100)}%

**Answered the Question:** ${analysisResult.flags.answered_the_question ? 'Yes' : 'No'}
${analysisResult.flags.possible_fabrication ? '**Fabrication Risk:** Possible' : ''}
${analysisResult.flags.generic_buzzwords ? '**Generic Response:** Use specific examples' : ''}

**Quick Wins:**
${analysisResult.feedback.quick_wins.map((win: string) => `• ${win}`).join('\n')}

${analysisResult.feedback.follow_ups.length > 0 ? `
**Follow-up Questions:**
${analysisResult.feedback.follow_ups.map((q: any) => `• ${q.question}`).join('\n')}
` : ''}

${analysisResult.star.situation || analysisResult.star.task || analysisResult.star.action || analysisResult.star.result ? `
**STAR Method Breakdown:**
• Situation: ${analysisResult.star.situation || 'Not provided'}
• Task: ${analysisResult.star.task || 'Not provided'} 
• Action: ${analysisResult.star.action || 'Not provided'}
• Result: ${analysisResult.star.result || 'Not provided'}
` : ''}
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

  // NOTE: analyzeCompleteInterview is now imported from services/analysis.ts
  // Removed duplicate function that was never used (was conflicting with the service function)

  return {
    startInterview,
    finishInterview,
    analyzeIndividualAnswer
    // analyzeCompleteInterview is now imported directly from services/analysis.ts where needed
  }
}
