export function classNames(...xs: Array<string | false | undefined>): string {
  return xs.filter(Boolean).join(' ')
}

export const PASSING_SCORE = 70
export const MIN_AUDIO_VOLUME = 0.012 // RMS threshold to detect silence

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const base64 = result.includes(',')
        ? (result.split(',').pop() ?? '')
        : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function analyzeAudioRms(blob: Blob): Promise<number | null> {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return null

  const audioContext = new AudioCtx()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    if (!audioBuffer.numberOfChannels || audioBuffer.length === 0) {
      return 0
    }

    const channelData = audioBuffer.getChannelData(0)
    const stride = Math.max(1, Math.floor(channelData.length / 48000))
    let total = 0
    let samples = 0
    for (let i = 0; i < channelData.length; i += stride) {
      total += Math.abs(channelData[i])
      samples++
    }
    return samples ? total / samples : 0
  } catch (err) {
    console.error('Không thể phân tích âm thanh:', err)
    return null
  } finally {
    audioContext.close().catch(() => {})
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
