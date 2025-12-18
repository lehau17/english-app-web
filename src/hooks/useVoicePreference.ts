import { useCallback, useState, useEffect } from 'react'
import { getAvailableVoices } from '../services/aiSpeaking.api'
import type { VoiceMetadata } from '../services/aiSpeaking.api'

/**
 * TTS Voice options (Piper TTS)
 * Must match backend enum values
 * Reference: https://github.com/rhasspy/piper/blob/master/VOICES.md
 * NOTE: No Australian (en_AU) voices available in Piper
 */
export enum TtsVoice {
  // US English
  US_FEMALE_AMY = 'en_US-amy-medium',
  US_MALE_JOHN = 'en_US-john-medium',
  US_FEMALE_LESSAC = 'en_US-lessac-medium',
  US_MALE_RYAN = 'en_US-ryan-medium',
  US_FEMALE_KRISTIN = 'en_US-kristin-medium',

  // British English
  GB_MALE_ALAN = 'en_GB-alan-medium',
  GB_FEMALE_CORI = 'en_GB-cori-medium',
  GB_FEMALE_JENNY = 'en_GB-jenny_dioco-medium',

  // Multi-speaker LibriTTS (US) - libritts_r for medium quality
  US_NATIVE_1 = 'en_US-libritts_r-medium:0',
  US_NATIVE_2 = 'en_US-libritts_r-medium:142',
  US_NATIVE_3 = 'en_US-libritts_r-medium:508',
}

// VoiceMetadata imported from aiSpeaking.api.ts

/**
 * Multi-voice subset - only these 5 voices are generated in multi-voice mode
 * Must match backend MULTI_VOICE_SUBSET
 */
export const MULTI_VOICE_SUBSET: TtsVoice[] = [
  TtsVoice.US_FEMALE_AMY, // US Female (primary)
  TtsVoice.US_MALE_JOHN,
  TtsVoice.US_FEMALE_LESSAC, // US Female (alternative)
  TtsVoice.US_MALE_RYAN, // US Male
  TtsVoice.US_FEMALE_KRISTIN,
  TtsVoice.GB_MALE_ALAN, // GB Male
  TtsVoice.GB_FEMALE_CORI,
  TtsVoice.GB_FEMALE_JENNY, // GB Female
]

const STORAGE_KEY = 'ai-speaking-voice-preference'
const DEFAULT_VOICE = TtsVoice.US_FEMALE_AMY

/**
 * Migration map for backward compatibility with Google Cloud TTS voices
 * and old Piper voices that no longer exist
 */
const VOICE_MIGRATION_MAP: Record<string, TtsVoice> = {
  // Google Cloud TTS voices
  'en-US-Neural2-D': TtsVoice.US_MALE_JOHN,
  'en-US-Neural2-F': TtsVoice.US_FEMALE_AMY,
  'en-GB-Neural2-B': TtsVoice.GB_MALE_ALAN,
  'en-GB-Neural2-C': TtsVoice.GB_FEMALE_CORI,
  'en-AU-Neural2-B': TtsVoice.US_MALE_RYAN, // No AU voices, fallback to US
  'en-AU-Neural2-C': TtsVoice.US_FEMALE_AMY,
  // Old Piper voices that no longer exist
  'en_AU-karla-medium': TtsVoice.GB_FEMALE_CORI,
  'en_GB-jon-medium': TtsVoice.GB_MALE_ALAN,
  'en_US-libritts-medium:0': TtsVoice.US_NATIVE_1,
  'en_US-libritts-medium:142': TtsVoice.US_NATIVE_2,
  'en_US-libritts-medium:508': TtsVoice.US_NATIVE_3,
  'en_US-libritts-medium:721': TtsVoice.US_NATIVE_3, // Removed, fallback to 508
}

/**
 * Custom hook for managing TTS voice preference
 * Persists selection in localStorage across sessions
 */
export const useVoicePreference = () => {
  const [voice, setVoiceState] = useState<TtsVoice>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Check if valid current Piper voice
        if (Object.values(TtsVoice).includes(stored as TtsVoice)) {
          return stored as TtsVoice
        }

        // Check if old voice (Google Cloud or deprecated Piper) - migrate
        if (VOICE_MIGRATION_MAP[stored]) {
          const migratedVoice = VOICE_MIGRATION_MAP[stored]
          localStorage.setItem(STORAGE_KEY, migratedVoice)
          return migratedVoice
        }
      }
    } catch (error) {
      console.warn('Failed to read voice preference from localStorage:', error)
    }
    return DEFAULT_VOICE
  })

  const [voiceMetadata, setVoiceMetadata] = useState<VoiceMetadata[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch voice metadata from backend using axios instance
  // Filter to MULTI_VOICE_SUBSET (5 voices) for multi-voice mode compatibility
  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true)
      try {
        const voices = await getAvailableVoices()
        // Filter to only show voices available in multi-voice mode
        const filteredVoices = voices.filter((v) =>
          MULTI_VOICE_SUBSET.includes(v.id as TtsVoice)
        )
        setVoiceMetadata(filteredVoices)
      } catch (error) {
        console.error('Failed to fetch voice metadata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVoices()
  }, [])

  const updateVoice = useCallback((newVoice: TtsVoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, newVoice)
      setVoiceState(newVoice)
    } catch (error) {
      console.error('Failed to save voice preference to localStorage:', error)
    }
  }, [])

  const resetVoice = useCallback(() => {
    updateVoice(DEFAULT_VOICE)
  }, [updateVoice])

  return {
    voice,
    voiceMetadata,
    loading,
    updateVoice,
    resetVoice,
  }
}
