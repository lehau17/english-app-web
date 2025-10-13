import { useState, useEffect } from 'react'

export interface CharacterCustomization {
  outfit: string
  color: string
  accessory: string
}

const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  outfit: 'casual',
  color: 'blue',
  accessory: 'none',
}

export function useCharacterCustomization() {
  const [customization, setCustomization] = useState<CharacterCustomization>(
    DEFAULT_CUSTOMIZATION
  )

  useEffect(() => {
    const saved = localStorage.getItem('character_customization')
    if (saved) {
      try {
        setCustomization(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load character customization:', e)
      }
    }
  }, [])

  return customization
}
