import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key found' }, { status: 400 })
  }

  console.log('🔍 Testing Gemini API with key:', apiKey.substring(0, 10) + '...')

  // List available models
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Error listing models:', error)
      return NextResponse.json({ 
        error: 'Failed to list models', 
        status: response.status,
        details: error 
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ Available models:', data)

    // Extract model names that support generateContent
    const availableModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ).map((model: any) => model.name) || []

    console.log('📋 Models with generateContent support:', availableModels)

    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      generateContentModels: availableModels,
      allModels: data.models || []
    })

  } catch (error: any) {
    console.error('❌ Error testing Gemini API:', error)
    return NextResponse.json({ 
      error: 'Failed to connect to Gemini API',
      details: error.message 
    }, { status: 500 })
  }
}
