import { useEffect, useRef } from 'react'

type SoundType =
  | 'click'
  | 'correct'
  | 'wrong'
  | 'celebration'
  | 'levelUp'
  | 'coin'
  | 'star'

/**
 * SoundEffects - Sound manager using Web Audio API
 * Tạo sounds từ oscillator để không cần load audio files
 */
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Initialize Audio Context
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playSound = (type: SoundType) => {
    const ctx = audioContextRef.current
    if (!ctx) return

    const now = ctx.currentTime

    switch (type) {
      case 'click':
        // Short beep
        playTone(ctx, 800, now, 0.05, 'sine', 0.1)
        break

      case 'correct':
        // Happy ascending tones
        playTone(ctx, 523.25, now, 0.1, 'sine', 0.2) // C5
        playTone(ctx, 659.25, now + 0.1, 0.1, 'sine', 0.2) // E5
        playTone(ctx, 783.99, now + 0.2, 0.15, 'sine', 0.3) // G5
        break

      case 'wrong':
        // Sad descending tones
        playTone(ctx, 392, now, 0.15, 'sawtooth', 0.2) // G4
        playTone(ctx, 349.23, now + 0.15, 0.2, 'sawtooth', 0.25) // F4
        break

      case 'celebration':
        // Multiple rising tones with echo
        const celebNotes = [523.25, 659.25, 783.99, 1046.5]
        celebNotes.forEach((freq, i) => {
          playTone(ctx, freq, now + i * 0.08, 0.1, 'sine', 0.3)
          playTone(ctx, freq * 2, now + i * 0.08, 0.1, 'sine', 0.15) // Octave
        })
        break

      case 'levelUp':
        // Epic fanfare
        playTone(ctx, 523.25, now, 0.2, 'triangle', 0.4)
        playTone(ctx, 659.25, now + 0.1, 0.2, 'triangle', 0.4)
        playTone(ctx, 783.99, now + 0.2, 0.3, 'triangle', 0.5)
        playTone(ctx, 1046.5, now + 0.3, 0.4, 'triangle', 0.6)
        break

      case 'coin':
        // Coin pickup sound
        playTone(ctx, 1000, now, 0.05, 'square', 0.2)
        playTone(ctx, 1500, now + 0.05, 0.05, 'square', 0.15)
        break

      case 'star':
        // Magical twinkle
        playTone(ctx, 2093, now, 0.1, 'sine', 0.2)
        playTone(ctx, 2637, now + 0.05, 0.1, 'sine', 0.15)
        playTone(ctx, 3136, now + 0.1, 0.15, 'sine', 0.2)
        break
    }
  }

  const playTone = (
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.value = frequency

    // Envelope
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
  }

  return { playSound }
}

export default useSoundEffects
