import React from 'react'

interface MessageVoiceSelectorProps {
  audioUrls: Record<string, string | null>
  selectedVoice: string
  onSelectVoice: (voice: string) => void
  className?: string
}

/**
 * Voice labels mapping from voice ID to display name
 */
const VOICE_LABELS: Record<string, { name: string; accent: string }> = {
  'en_US-amy-medium': { name: 'Amy', accent: 'US' },
  'en_US-john-medium': { name: 'John', accent: 'US' },
  'en_US-ryan-medium': { name: 'Ryan', accent: 'US' },
  'en_US-lessac-medium': { name: 'Lessac', accent: 'US' },
  'en_US-kristin-medium': { name: 'Kristin', accent: 'US' },
  'en_GB-alan-medium': { name: 'Alan', accent: 'GB' },
  'en_GB-cori-medium': { name: 'Cori', accent: 'GB' },
  'en_GB-jenny_dioco-medium': { name: 'Jenny', accent: 'GB' },
}

/**
 * MessageVoiceSelector - Compact voice selector for conversation messages
 *
 * Displays available voices as buttons when multiple voices are available.
 * Automatically filters out voices with null URLs (failed generations).
 */
export const MessageVoiceSelector: React.FC<MessageVoiceSelectorProps> = ({
  audioUrls,
  selectedVoice,
  onSelectVoice,
  className = '',
}) => {
  // Filter out null/undefined URLs (failed voice generations)
  const availableVoices = Object.entries(audioUrls)
    .filter(([, url]) => url !== null && url !== undefined)
    .map(([voice]) => voice)

  // Don't render if only 1 or 0 voices available
  if (availableVoices.length <= 1) {
    return null
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs text-gray-500 mr-1">Giọng đọc:</span>
      <div className="flex flex-wrap gap-1.5">
        {availableVoices.map((voice) => {
          const voiceInfo = VOICE_LABELS[voice] || {
            name: voice.split('-')[1] || voice,
            accent: voice.includes('_US')
              ? 'US'
              : voice.includes('_GB')
                ? 'GB'
                : '',
          }
          const isSelected = voice === selectedVoice

          return (
            <button
              key={voice}
              onClick={() => onSelectVoice(voice)}
              className={`
                px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              title={`${voiceInfo.name} (${voiceInfo.accent})`}
            >
              {voiceInfo.name}
              {voiceInfo.accent && (
                <span className="ml-1 text-[10px] opacity-75">
                  {voiceInfo.accent}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
