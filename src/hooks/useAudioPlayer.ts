import { useRef, useCallback, useEffect, useState } from 'react'

interface UseAudioPlayerOptions {
  onError?: (error: Error) => void
  onEnded?: () => void
}

interface UseAudioPlayerReturn {
  play: () => Promise<void>
  pause: () => void
  isPlaying: boolean
  error: Error | null
}

export const useAudioPlayer = (
  audioUrl: string | undefined,
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const onErrorRef = useRef(options.onError)
  const onEndedRef = useRef(options.onEnded)

  // Update refs when callbacks change
  useEffect(() => {
    onErrorRef.current = options.onError
    onEndedRef.current = options.onEnded
  }, [options.onError, options.onEnded])

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) return

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    // Event listeners
    const handleEnded = () => {
      setIsPlaying(false)
      onEndedRef.current?.()
    }

    const handleError = () => {
      const errorObj = new Error('Audio playback failed')
      setError(errorObj)
      setIsPlaying(false)
      onErrorRef.current?.(errorObj)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Cleanup
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
      audio.src = ''
    }
  }, [audioUrl])

  // Play function with autoplay policy handling
  const play = useCallback(async () => {
    if (!audioRef.current) {
      const err = new Error('Audio not initialized')
      setError(err)
      onErrorRef.current?.(err)
      return
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Playback failed')
      setError(error)
      setIsPlaying(false)
      onErrorRef.current?.(error)
    }
  }, [])

  // Pause function
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  return { play, pause, isPlaying, error }
}
