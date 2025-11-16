import { NextRequest, NextResponse } from 'next/server'


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

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024
          }
        })
      }
    )

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
