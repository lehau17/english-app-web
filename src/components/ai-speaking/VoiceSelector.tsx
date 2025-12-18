import { Loader2, Play, Volume2 } from 'lucide-react'
import React, { useState } from 'react'
import { TtsVoice } from '../../hooks/useVoicePreference'
import type { VoiceMetadata } from '../../services/aiSpeaking.api'

interface VoiceSelectorProps {
  value: TtsVoice
  onChange: (voice: TtsVoice) => void
  disabled?: boolean
  voiceMetadata?: VoiceMetadata[]
}

const AccentBadge: React.FC<{ accent: 'US' | 'GB' | 'AU' }> = ({ accent }) => {
  const colors = {
    US: 'bg-blue-100 text-blue-700',
    GB: 'bg-red-100 text-red-700',
    AU: 'bg-green-100 text-green-700',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[accent]}`}
    >
      {accent}
    </span>
  )
}

const GenderIcon: React.FC<{ gender: 'M' | 'F' | 'Neutral' }> = ({
  gender,
}) => {
  const icons = {
    M: '♂',
    F: '♀',
    Neutral: '⚪',
  }

  return <span className="text-gray-500 text-sm">{icons[gender]}</span>
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  voiceMetadata = [],
}) => {
  const [previewLoading, setPreviewLoading] = useState<TtsVoice | null>(null)
  const selectedOption = voiceMetadata?.find((v) => v.id === value)

  // Group voices by accent
  const groupedVoices = voiceMetadata?.reduce(
    (acc, voice) => {
      if (!acc[voice.accent]) acc[voice.accent] = []
      acc[voice.accent].push(voice)
      return acc
    },
    {} as Record<string, VoiceMetadata[]>
  )

  const handlePreview = async (voiceId: TtsVoice) => {
    setPreviewLoading(voiceId)
    try {
      // Call backend to generate 5-second sample
      const response = await fetch(
        '/api/private/v1/ai-speaking/voices/preview',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voice: voiceId,
            text: 'Hello, this is a voice preview for AI speaking practice.',
          }),
        }
      )

      if (!response.ok) throw new Error('Preview failed')

      const blob = await response.blob()
      const audioUrl = URL.createObjectURL(blob)
      const audio = new Audio(audioUrl)

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl)
        setPreviewLoading(null)
      })

      await audio.play()
    } catch (error) {
      console.error('Voice preview failed:', error)
      setPreviewLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Voice Selector Dropdown */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor="voice-selector" className="sr-only">
            Select AI voice
          </label>
          <select
            id="voice-selector"
            value={value}
            onChange={(e) => onChange(e.target.value as TtsVoice)}
            disabled={disabled}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
            title={selectedOption?.description}
          >
            {Object.entries(groupedVoices).map(([accent, voices]) => (
              <optgroup key={accent} label={`${accent} English`}>
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Voice Details Card */}
      {selectedOption && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <AccentBadge accent={selectedOption.accent} />
            <GenderIcon gender={selectedOption.gender} />
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {selectedOption.label}
              </p>
              <p className="text-gray-500 text-xs">
                {selectedOption.description}
              </p>
            </div>
          </div>

          {/* Preview Button */}
          <button
            type="button"
            onClick={() => handlePreview(selectedOption.id as TtsVoice)}
            disabled={previewLoading !== null || disabled}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Preview voice"
          >
            {previewLoading === selectedOption.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Preview</span>
          </button>
        </div>
      )}
    </div>
  )
}
