// Enhanced ElevenLabs TTS Service
export interface TTSOptions {
  voice?: 'professional' | 'friendly' | 'casual'
  speed?: 'slow' | 'normal' | 'fast'  
  gender?: 'male' | 'female'
}

class TTSService {
  private readonly TTS_API_URL = '/api/tts' // Use secure server route
  private characterUsage = 0
  private characterLimit = 10000
  private currentAudio: HTMLAudioElement | null = null
  private isPlaying = false

  constructor() {
    console.log('✅ Secure TTS service initialized (server-side API)')
  }

  private async generateSpeech(text: string, options: TTSOptions): Promise<Blob | null> {
    console.log('🎙️ Generating speech via secure server route...')
    console.log('📊 CHARACTER COUNT:', text.length, 'chars')

    try {
      const response = await fetch(this.TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          gender: options.gender || 'female'
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('TTS API error:', errorText)
        throw new Error(`TTS API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      this.characterUsage += text.length
      
      console.log('✅ TTS speech generated:', audioBlob.size, 'bytes')
      return audioBlob

    } catch (error) {
      console.error('❌ TTS generation failed:', error)
      return null
    }
  }

  private async playAudio(audioBlob: Blob): Promise<void> {
    if (!audioBlob) {
      console.log('🚫 No audio to play')
      return
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Store current audio for stop functionality
      this.currentAudio = audio
      this.isPlaying = true
      
      audio.oncanplaythrough = () => {
        audio.play().then(() => {
          console.log('🔊 Audio playback started')
        }).catch(reject)
      }
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        this.currentAudio = null
        this.isPlaying = false
        resolve()
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        this.currentAudio = null
        this.isPlaying = false
        reject(new Error('Audio playback failed'))
      }
      
      // Handle programmatic stop
      audio.onpause = () => {
        if (!this.isPlaying) { // Only resolve if stopped programmatically
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }
      }
      
      audio.src = audioUrl
      audio.load()
    })
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text || text.trim() === '') {
      console.log('🚫 No text to speak')
      return
    }

    try {
      console.log('🎤 TTS Request:', text.length, 'characters')
      
      const audioBlob = await this.generateSpeech(text, options)
      if (audioBlob) {
        await this.playAudio(audioBlob)
        console.log('✅ Secure TTS completed successfully')
      } else {
        throw new Error('Failed to generate audio')
      }
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS failed:', error)
      console.log('🔄 TTS failed, continuing without voice')
      throw error
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 Stop TTS requested')
    
    if (this.currentAudio && this.isPlaying) {
      this.isPlaying = false // Mark as stopped before pausing
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      
      // Wait a bit for the pause event to fire and cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    console.log('✅ TTS stopped successfully')
  }
}

// Export singleton instance
export const ttsService = new TTSService()
