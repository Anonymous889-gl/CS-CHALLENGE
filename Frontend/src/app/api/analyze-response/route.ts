import { NextRequest, NextResponse } from 'next/server'

// Ensure this route runs in a Node.js environment so server env vars are available
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ALT_MODEL = process.env.GEMINI_ALT_MODEL || 'gemini-pro';

async function callGemini(prompt: string, model: string) {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
      })
    }
  );
  return resp;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    // Attempt with primary model, retry on 429 or 5xx up to 3 times, switch to alt model once.
    let resp = await callGemini(prompt, DEFAULT_MODEL);
    let attempts = 1;
    while (attempts < 3 && (resp.status === 429 || resp.status >= 500)) {
      const retryAfter = resp.headers.get('Retry-After');
      const waitMs = retryAfter ? parseFloat(retryAfter) * 1000 : 1000 * attempts;
      console.warn(`Gemini ${DEFAULT_MODEL} quota/back-off (${resp.status}). Retrying in ${waitMs}ms...`);
      await new Promise(r => setTimeout(r, waitMs));
      resp = await callGemini(prompt, attempts === 1 ? DEFAULT_MODEL : ALT_MODEL);
      attempts++;
    }

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Gemini REST error', resp.status, text)
      return NextResponse.json({ error: 'Gemini API error', details: text }, { status: 502 })
    }
    const data = await resp.json()
    const analysis = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    console.log('✅ Gemini analysis generated:', analysis.substring(0, 100) + '...')

    return NextResponse.json({
      analysis,
      success: true
    })

  } catch (error: any) {
    console.error('❌ Gemini API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze response',
        details: error.message
      },
      { status: 500 }
    )
  }
}
