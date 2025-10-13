type SoundType =
  | 'click'
  | 'correct'
  | 'wrong'
  | 'celebration'
  | 'levelUp'
  | 'coin'
  | 'star'

export const SOUND_FREQUENCIES = {
  click: {
    freq: 800,
    duration: 0.05,
    type: 'sine' as OscillatorType,
    volume: 0.1,
  },
  correct: [
    {
      freq: 523.25,
      delay: 0,
      duration: 0.1,
      type: 'sine' as OscillatorType,
      volume: 0.2,
    }, // C5
    {
      freq: 659.25,
      delay: 0.1,
      duration: 0.1,
      type: 'sine' as OscillatorType,
      volume: 0.2,
    }, // E5
    {
      freq: 783.99,
      delay: 0.2,
      duration: 0.15,
      type: 'sine' as OscillatorType,
      volume: 0.3,
    }, // G5
  ],
  wrong: [
    {
      freq: 392,
      delay: 0,
      duration: 0.15,
      type: 'sawtooth' as OscillatorType,
      volume: 0.2,
    }, // G4
    {
      freq: 349.23,
      delay: 0.15,
      duration: 0.2,
      type: 'sawtooth' as OscillatorType,
      volume: 0.25,
    }, // F4
  ],
  celebration: [523.25, 659.25, 783.99, 1046.5],
  levelUp: [
    {
      freq: 523.25,
      delay: 0,
      duration: 0.2,
      type: 'triangle' as OscillatorType,
      volume: 0.4,
    },
    {
      freq: 659.25,
      delay: 0.15,
      duration: 0.2,
      type: 'triangle' as OscillatorType,
      volume: 0.4,
    },
    {
      freq: 783.99,
      delay: 0.3,
      duration: 0.3,
      type: 'triangle' as OscillatorType,
      volume: 0.5,
    },
  ],
  coin: [
    {
      freq: 988,
      delay: 0,
      duration: 0.08,
      type: 'sine' as OscillatorType,
      volume: 0.25,
    },
    {
      freq: 1319,
      delay: 0.08,
      duration: 0.12,
      type: 'sine' as OscillatorType,
      volume: 0.3,
    },
  ],
  star: [
    {
      freq: 1047,
      delay: 0,
      duration: 0.1,
      type: 'triangle' as OscillatorType,
      volume: 0.2,
    },
    {
      freq: 1319,
      delay: 0.05,
      duration: 0.1,
      type: 'triangle' as OscillatorType,
      volume: 0.25,
    },
    {
      freq: 1568,
      delay: 0.1,
      duration: 0.15,
      type: 'triangle' as OscillatorType,
      volume: 0.3,
    },
  ],
}

export function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = type

  // Envelope for smooth sound
  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export type { SoundType }
