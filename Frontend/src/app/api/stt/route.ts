export const runtime = "nodejs"

import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY // server-only, not NEXT_PUBLIC_
  
  if (!ELEVEN_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY server environment variable')
    return new Response(JSON.stringify({ error: "STT service unavailable" }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    })
  }

  try {
    console.log('🎤 Server STT: Receiving audio for transcription')
    const form = await req.formData()
    
    // Ensure model_id is set for ElevenLabs
    form.append("model_id", "scribe_v1")
    
    console.log('📡 Server STT: Forwarding to ElevenLabs API')
    const elevenResponse = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { 
        "xi-api-key": ELEVEN_KEY // Server-side key, not exposed to client
      },
      body: form,
    })

    const responseBody = await elevenResponse.text()
    console.log('✅ Server STT: ElevenLabs response status:', elevenResponse.status)
    
    if (!elevenResponse.ok) {
      console.error('❌ ElevenLabs API error:', responseBody)
    }

    return new Response(responseBody, { 
      status: elevenResponse.status, 
      headers: { 
        "content-type": elevenResponse.headers.get("content-type") ?? "application/json" 
      }
    })
    
  } catch (error) {
    console.error('❌ Server STT error:', error)
    return new Response(JSON.stringify({ error: "STT processing failed" }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    })
  }
}
