// Speech-to-Text service - handles ElevenLabs STT API calls

// ElevenLabs Speech-to-Text function
export const transcribeWithElevenLabs = async (audioBlob: Blob, ext: string = 'webm'): Promise<string> => {
  console.log('\n=== ELEVENLABS STT DEBUG ===')
  console.log('🎤 Audio blob size:', audioBlob.size, 'bytes')
  console.log('🎤 Audio type:', audioBlob.type)
  console.log('⏱️ Starting transcription...')
  
  const startTime = Date.now()
  
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, `recording.${ext}`)
    formData.append('model_id', 'scribe_v1')
    
    const response = await fetch('/api/stt', {
      method: 'POST',
      body: formData
    })

    const processingTime = Date.now() - startTime
    console.log('⏱️ API response time:', processingTime + 'ms')
    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ElevenLabs STT API Error:')
      console.error('Status:', response.status)
      console.error('Error:', errorText)
      throw new Error(`ElevenLabs STT failed: ${response.status}`)
    }

    const result = await response.json()
    const transcribedText = result.text || ''
    
    console.log('✅ TRANSCRIPTION SUCCESS!')
    console.log('📝 Transcribed text length:', transcribedText.length, 'characters')
    console.log('📝 Transcribed text: "' + transcribedText + '"')
    console.log('⏱️ Total processing time:', (Date.now() - startTime) + 'ms')
    console.log('==========================\n')
    
    return transcribedText
  } catch (error) {
    console.error('❌ ElevenLabs STT FAILED:')
    console.error('Error:', error)
    console.error('⏱️ Failed after:', (Date.now() - startTime) + 'ms')
    console.log('==========================\n')
    return ''
  }
}
