// app/api/embedding/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface EmbedResponse {
  embedding: {
    values: number[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return NextResponse.json({ error: 'Invalid text provided' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: text.slice(0, 4096) }] },
          taskType: 'SEMANTIC_SIMILARITY'
        })
      }
    )

    if (!apiRes.ok) {
      const msg = await apiRes.text()
      return NextResponse.json({ error: `Gemini API error ${apiRes.status}: ${msg}` }, { status: 500 })
    }

    const data: EmbedResponse = await apiRes.json()
    const vector = data?.embedding?.values || []
    return NextResponse.json({ vector })
  } catch (err) {
    console.error('Embedding API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
