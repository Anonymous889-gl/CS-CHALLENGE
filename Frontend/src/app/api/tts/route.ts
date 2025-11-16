export const runtime = "nodejs"

import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY // server-only, secure
  
  if (!ELEVEN_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY server environment variable')
    return new Response(JSON.stringify({ error: "TTS service unavailable" }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    })
  }

  try {
    const { text, voice = 'professional_female', gender = 'female' } = await req.json()
    
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ error: "No text provided" }), { 
        status: 400,
        headers: { "content-type": "application/json" }
      })
    }

    console.log('🎙️ Server TTS: Generating speech for', text.length, 'characters')
    
    // Voice mapping
    const voices = {
      professional_female: 'EXAVITQu4vr4xnSDxMaL',
      professional_male: 'ErXwobaYiN019PkySvjV', 
    }
    
    const voiceId = gender === 'male' ? voices.professional_male : voices.professional_female

    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_KEY // Server-side key, not exposed to client
      },
      body: JSON.stringify({
        text: text,
        model_id: process.env.ELEVEN_MODEL_ID || "eleven_turbo_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!elevenResponse.ok) {
      const error = await elevenResponse.text()
      console.error('❌ ElevenLabs TTS API error:', error)
      return new Response(JSON.stringify({ error: "TTS generation failed" }), { 
        status: elevenResponse.status,
        headers: { "content-type": "application/json" }
      })
    }

    const audioBuffer = await elevenResponse.arrayBuffer()
    console.log('✅ Server TTS: Generated audio', audioBuffer.byteLength, 'bytes')
    
    return new Response(audioBuffer, { 
      status: 200, 
      headers: { 
        "content-type": "audio/mpeg",
        "content-length": audioBuffer.byteLength.toString()
      }
    })
    
  } catch (error) {
    console.error('❌ Server TTS error:', error)
    return new Response(JSON.stringify({ error: "TTS processing failed" }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    })
  }
}
