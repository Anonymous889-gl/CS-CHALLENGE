import React from 'react'

interface PermissionsPhaseProps {
  requestMediaPermissions: () => void
  cameraEnabled: boolean
  setCameraEnabled: (enabled: boolean) => void
}

export default function PermissionsPhase({ requestMediaPermissions, cameraEnabled, setCameraEnabled }: PermissionsPhaseProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f8f8]">
      <main className="container mx-auto px-6 py-10 flex-grow flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-indigo-600 text-3xl">videocam</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4 font-[Manrope]">Camera & Microphone Access</h1>
            <p className="text-gray-600 mb-8 font-[Manrope] leading-relaxed">
              The AI interviewer needs access to your camera and microphone to analyze your responses during the interview. 
              Audio is sent securely to our speech-to-text service for transcription, but no media data is permanently stored.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-indigo-600/5 rounded-lg">
                <span className="material-symbols-outlined text-indigo-600">videocam</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 font-[Manrope]">Camera</p>
                  <p className="text-sm text-gray-600 font-[Manrope]">For posture & eye contact analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-indigo-600/5 rounded-lg">
                <span className="material-symbols-outlined text-indigo-600">mic</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 font-[Manrope]">Microphone</p>
                  <p className="text-sm text-gray-600 font-[Manrope]">For voice transcription & analysis</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 flex items-center justify-center gap-3">
              <input
                id="camera-toggle"
                type="checkbox"
                checked={cameraEnabled}
                onChange={(e) => setCameraEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="camera-toggle" className="text-sm text-gray-700 font-[Manrope]">
                {cameraEnabled ? 'Camera ON (video & audio)' : 'Camera OFF (audio only)'}
              </label>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg font-[Manrope] hover:bg-gray-50 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={requestMediaPermissions}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity font-[Manrope]"
              >
                Grant Access & Start
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">security</span>
                <p className="text-sm text-yellow-800 font-[Manrope] text-left">
                  <strong>Privacy:</strong> Video stays in your browser for local analysis. 
                  Audio is sent to our secure transcription service but not permanently stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
