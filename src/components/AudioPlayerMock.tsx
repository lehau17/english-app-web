import React, { useEffect, useRef, useState } from 'react'

interface Props {
  duration?: number // seconds
}

const AudioPlayerMock: React.FC<Props> = ({ duration = 60 }) => {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // seconds
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= duration) {
            setPlaying(false)
            if (intervalRef.current) window.clearInterval(intervalRef.current)
            return duration
          }
          return p + 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [playing, duration])

  const toggle = () => {
    if (playing) setPlaying(false)
    else setPlaying(true)
  }

  const percent = Math.round((progress / Math.max(1, duration)) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div style={{ width: `${percent}%` }} className="h-2 bg-blue-600" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.floor(progress / 60)}:{String(progress % 60).padStart(2, '0')}{' '}
            / {Math.floor(duration / 60)}:
            {String(duration % 60).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioPlayerMock
