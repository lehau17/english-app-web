import { ChevronLeft, Pause, Play, RotateCcw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface Question {
  id: string
  sentence: string
  correctAnswers: string[]
  userAnswer?: string
}

interface ListeningPracticeComponentProps {
  podcastId: string
  title: string
  audioUrl: string
  questions: Question[]
  timeLimit?: number
  onSubmit: (answers: Record<string, string>, timeSpent: number) => void
  onExit: () => void
}

export const ListeningPracticeComponent: React.FC<
  ListeningPracticeComponentProps
> = ({
  podcastId: _podcastId,
  title,
  audioUrl,
  questions,
  timeLimit,
  onSubmit,
  onExit,
}) => {
  void _podcastId
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [startTime] = useState(Date.now())
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)

  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<number | null>(null)

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value
    setCurrentTime(value)
  }

  const restartAudio = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    setCurrentTime(0)
  }

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = React.useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    onSubmit(answers, timeSpent)
  }, [answers, onSubmit, startTime])

  // Timer effect
  useEffect(() => {
    if (timeLimit && timeRemaining !== undefined && timeRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [timeLimit, timeRemaining, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const renderTextWithBlanks = (sentence: string, questionId: string) => {
    // Replace blanks marked with underscores or special markers with input fields
    const blankPattern = /_{3,}|\[blank\]/g
    const parts = sentence.split(blankPattern)
    const result = []

    for (let i = 0; i < parts.length; i++) {
      result.push(
        <span key={`text-${i}`} className="text-gray-800">
          {parts[i]}
        </span>
      )

      if (i < parts.length - 1) {
        result.push(
          <input
            key={`input-${i}`}
            type="text"
            className="inline-block mx-1 px-2 py-1 min-w-[80px] border-b-2 border-green-400 bg-green-50 focus:outline-none focus:border-green-600 text-center"
            value={answers[questionId] || ''}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="..."
          />
        )
      }
    }

    return result
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onExit}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Quay lại
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        {timeLimit && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Thời gian còn lại:{' '}
              <span className="font-semibold text-red-600">
                {timeRemaining ? formatTime(timeRemaining) : '00:00'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Audio Player & Instructions */}
        <div className="w-1/3 bg-white p-6 border-r">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">🎧 Nghe và điền từ</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Nghe file audio</p>
              <p>• Điền từ vào chỗ trống</p>
              <p>• Có thể nghe lại nhiều lần</p>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-gray-50 rounded-lg p-4">
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={restartAudio}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={changeSpeed}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>

          {/* Progress Info */}
          <div className="mt-6 text-sm text-gray-600">
            <div className="flex justify-between mb-2">
              <span>Tiến độ</span>
              <span>
                {Object.keys(answers).length}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <h3 className="text-lg font-semibold mb-4">
              Điền từ vào chỗ trống
            </h3>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg p-6 shadow-sm border"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg leading-relaxed">
                        {renderTextWithBlanks(question.sentence, question.id)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                disabled={Object.keys(answers).length === 0}
              >
                Nộp bài ({Object.keys(answers).length}/{questions.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListeningPracticeComponent
