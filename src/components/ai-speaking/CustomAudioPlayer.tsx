import { Pause, Play, Volume2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { MessageVoiceSelector } from './MessageVoiceSelector'

interface CustomAudioPlayerProps {
  audioUrl: string
  audioUrls?: Record<string, string | null>
  selectedVoice?: string
  onVoiceChange?: (voice: string) => void
  autoPlay?: boolean
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  audioUrl,
  audioUrls,
  selectedVoice,
  onVoiceChange,
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Auto-play blocked:', err)
      })
    }
  }, [autoPlay, audioUrl])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (audio) {
      setProgress(audio.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (audio) {
      setDuration(audio.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (audio) {
      const time = Number(e.target.value)
      audio.currentTime = time
      setProgress(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm border border-blue-100 max-w-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white transition-transform hover:scale-105 hover:bg-blue-600 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex flex-1 flex-col gap-1 min-w-[120px]">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-500 hover:accent-blue-600"
          />
          <div className="flex justify-between px-0.5 text-[10px] font-medium text-gray-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-xs font-bold text-gray-600 hover:bg-gray-100"
            title="Tốc độ nói"
          >
            {playbackRate}x
          </button>

          {showSpeedMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSpeedMenu(false)}
              />
              <div className="absolute bottom-full right-0 z-20 mb-2 flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-lg min-w-[60px]">
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate)
                      setShowSpeedMenu(false)
                    }}
                    className={`rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-blue-50 ${
                      playbackRate === rate
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {audioUrls && onVoiceChange && (
        <div className="border-t border-gray-100 pt-2">
          <MessageVoiceSelector
            audioUrls={audioUrls}
            selectedVoice={selectedVoice || ''}
            onSelectVoice={onVoiceChange}
          />
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  )
}
