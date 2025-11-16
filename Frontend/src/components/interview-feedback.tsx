import React from 'react'

// Enhanced feedback display components for better UX

interface IndividualFeedbackProps {
  analysis: {
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
  };
  interviewType: 'technical' | 'behavioral' | 'general';
}

export function IndividualFeedbackDisplay({ analysis, interviewType }: IndividualFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return '🟢'
    if (score >= 0.6) return '🟡'
    return '🔴'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Quick Summary */}
      <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Analysis Summary</h4>
            <p className="text-blue-800 text-sm leading-relaxed">{analysis.feedback.one_liner}</p>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
          analysis.flags.answered_the_question 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span>{analysis.flags.answered_the_question ? '✅' : '❌'}</span>
          <span className="text-sm font-medium">
            {analysis.flags.answered_the_question ? 'Addressed Question' : 'Question Not Fully Addressed'}
          </span>
        </div>
        
        {analysis.flags.possible_fabrication && (
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-orange-50 border-orange-200 text-orange-700">
            <span>⚠️</span>
            <span className="text-sm font-medium">Claims Need Verification</span>
          </div>
        )}
        
        {analysis.flags.generic_buzzwords && (
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-yellow-50 border-yellow-200 text-yellow-700">
            <span>📝</span>
            <span className="text-sm font-medium">Add Specific Examples</span>
          </div>
        )}
      </div>

      {/* Performance Scores */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          Performance Breakdown
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(analysis.scores).filter(([key]) => key !== 'overall').map(([key, score]) => {
            const labels = {
              content_correctness: 'Content Accuracy',
              depth_technical_reasoning: interviewType === 'technical' ? 'Technical Depth' : 'Reasoning Depth',
              structure_STAR: 'Structure (STAR)',
              communication_clarity: 'Communication',
              relevance_focus: 'Relevance',
              evidence_specificity: 'Evidence & Examples'
            }
            
            return (
              <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${getScoreColor(score)}`}>
                <div className="flex items-center gap-2">
                  <span>{getScoreIcon(score)}</span>
                  <span className="text-sm font-medium">{labels[key as keyof typeof labels]}</span>
                </div>
                <span className="font-bold">{Math.round(score * 100)}%</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Wins */}
      {analysis.feedback.quick_wins.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>🚀</span>
            Quick Improvements
          </h4>
          <div className="space-y-2">
            {analysis.feedback.quick_wins.map((win, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-600 font-bold text-sm mt-0.5">{index + 1}.</span>
                <p className="text-sm text-green-800 leading-relaxed">{win}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAR Method Breakdown (if applicable) */}
      {(analysis.star.situation || analysis.star.task || analysis.star.action || analysis.star.result) && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>⭐</span>
            STAR Method Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(analysis.star).map(([key, value]) => (
              <div key={key} className={`p-3 rounded-lg border ${
                value ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  {value ? <span className="text-green-500">✓</span> : <span className="text-gray-400">○</span>}
                </div>
                <p className="text-sm text-gray-700">
                  {value || <span className="italic text-gray-400">Not clearly provided</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up Questions */}
      {analysis.feedback.follow_ups.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>🔍</span>
            Practice Questions
          </h4>
          <div className="space-y-3">
            {analysis.feedback.follow_ups.map((followUp, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-xs text-purple-600 font-medium mb-2 uppercase tracking-wide">
                  {followUp.purpose}
                </div>
                <p className="text-sm text-purple-800 leading-relaxed font-medium">
                  "{followUp.question}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ComprehensiveFeedbackProps {
  analysis: {
    overall: {
      score_10: number;
      verdict: "strong" | "average" | "weak";
      rationale: string;
    };
    strengths: string[];
    areas_for_improvement: string[];
    next_steps: string[];
    question_summaries: Array<{
      question_index: number;
      answered_the_question: boolean;
      key_positive: string;
      key_gap: string;
    }>;
  };
}

export function ComprehensiveFeedbackDisplay({ analysis }: ComprehensiveFeedbackProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'strong': return 'text-green-700 bg-green-100 border-green-300'
      case 'average': return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'weak': return 'text-red-700 bg-red-100 border-red-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'strong': return '🏆'
      case 'average': return '📈'
      case 'weak': return '💪'
      default: return '📊'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className={`p-6 rounded-xl border-2 ${getVerdictColor(analysis.overall.verdict)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getVerdictIcon(analysis.overall.verdict)}</span>
            <div>
              <h3 className="text-2xl font-bold">
                {analysis.overall.score_10}/10 - {analysis.overall.verdict.toUpperCase()}
              </h3>
              <p className="text-sm opacity-80">Overall Interview Performance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{analysis.overall.score_10}</div>
            <div className="text-xs opacity-70">out of 10</div>
          </div>
        </div>
        <p className="leading-relaxed">{analysis.overall.rationale}</p>
      </div>

      {/* Strengths */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
          <span>✨</span>
          Your Key Strengths
        </h3>
        <div className="space-y-3">
          {analysis.strengths.map((strength, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-green-600 font-bold mt-1">+</span>
              <p className="text-green-800 leading-relaxed">{strength}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
          <span>🎯</span>
          Areas for Growth
        </h3>
        <div className="space-y-3">
          {analysis.areas_for_improvement.map((area, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-orange-600 font-bold mt-1">→</span>
              <p className="text-orange-800 leading-relaxed">{area}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <span>🚀</span>
          Recommended Next Actions
        </h3>
        <div className="space-y-3">
          {analysis.next_steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                {index + 1}
              </div>
              <p className="text-blue-800 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Question Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📋</span>
          Question-by-Question Summary
        </h3>
        <div className="space-y-4">
          {analysis.question_summaries.map((summary) => (
            <div key={summary.question_index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-bold">
                  Q{summary.question_index}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  summary.answered_the_question 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {summary.answered_the_question ? '✅ Addressed' : '❌ Incomplete'}
                </span>
              </div>
              
              {summary.key_positive && (
                <div className="mb-2">
                  <span className="text-green-600 font-medium text-sm">✨ Positive: </span>
                  <span className="text-gray-700 text-sm">{summary.key_positive}</span>
                </div>
              )}
              
              {summary.key_gap && (
                <div>
                  <span className="text-orange-600 font-medium text-sm">🎯 Gap: </span>
                  <span className="text-gray-700 text-sm">{summary.key_gap}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
