import {
  Award,
  BookOpen,
  Gauge,
  Home,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Target,
  Volume2,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { usePodcast } from '../hooks/podcast.hooks'
import {
  useSaveDraft,
  useStartPodcast,
  useSubmitAnswer,
  useSubmitAttempt,
} from '../hooks/podcastAttempt.hooks'
import type { PodcastAttempt } from '../types/podcastAttempt.type'

const PodcastPracticePage: React.FC = () => {
  const { podcastId } = useParams<{ podcastId: string }>()
  const navigate = useNavigate()

  // State management
  const [attempt, setAttempt] = useState<PodcastAttempt | null>(null)
  const [currentGapIndex, setCurrentGapIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [hasStartedAttempt, setHasStartedAttempt] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now())
  const [audioTimeSpent, setAudioTimeSpent] = useState<number>(0) // Track actual audio time listened
  const [isTrackingTime, setIsTrackingTime] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)
  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)
  const playStartTimeRef = useRef<number>(0) // Thời gian bắt đầu play
  const lastCurrentTimeRef = useRef<number>(0) // Current time cuối cùng được ghi nhận

  // API hooks
  const { data: podcastData, isLoading: isPodcastLoading } = usePodcast(
    podcastId || ''
  )
  const startPodcastMutation = useStartPodcast()
  const submitAnswerMutation = useSubmitAnswer()
  const saveDraftMutation = useSaveDraft()
  const submitAttemptMutation = useSubmitAttempt()

  // Save draft function
  const handleSaveDraft = useCallback(() => {
    if (!attempt || !podcastId) return

    // Nếu đang play, cập nhật time trước khi save
    let currentTimeSpent = audioTimeSpent

    if (isTrackingTime && audioRef.current) {
      const currentAudioTime = audioRef.current.currentTime
      const playedDuration = Math.abs(
        currentAudioTime - lastCurrentTimeRef.current
      )

      if (playedDuration > 0 && playedDuration < 5) {
        currentTimeSpent = audioTimeSpent + playedDuration
        setAudioTimeSpent(currentTimeSpent)
        lastCurrentTimeRef.current = currentAudioTime
      }
    }

    const timeSpent = Math.floor(currentTimeSpent) // Audio time in seconds

    saveDraftMutation.mutate(
      {
        podcastId,
        attemptId: attempt.attemptId,
        answers: userAnswers,
        timeSpent,
      },
      {
        onSuccess: () => {
          setLastSaveTime(Date.now())
          console.log('Draft saved successfully with timeSpent:', timeSpent)
        },
        onError: (error) => {
          console.error('Failed to save draft:', error)
        },
      }
    )
  }, [
    attempt,
    podcastId,
    userAnswers,
    audioTimeSpent,
    isTrackingTime,
    saveDraftMutation,
    setLastSaveTime,
  ])

  // Playback speed options
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
  ]

  useEffect(() => {
    if (
      podcastId &&
      !attempt &&
      !hasStartedAttempt &&
      !startPodcastMutation.isPending
    ) {
      setHasStartedAttempt(true)
      startPodcastMutation.mutate(podcastId, {
        onSuccess: (response) => {
          setAttempt(response.data)
          // Load existing time spent from server
          const existingTimeSpent = response.data.timeSpent || 0
          setAudioTimeSpent(existingTimeSpent)
          inputRefs.current = new Array(response.data.gaps.length).fill(null)
          setUserAnswers(response.data.answers || {})
        },
        onError: (error) => {
          console.error('Failed to start podcast:', error)
          setHasStartedAttempt(false)
          navigate('/listening-practice')
        },
      })
    }
  }, [podcastId, attempt, hasStartedAttempt, startPodcastMutation, navigate])

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true)
    setIsTrackingTime(true)
    playStartTimeRef.current = Date.now()
    if (audioRef.current) {
      lastCurrentTimeRef.current = audioRef.current.currentTime
    }
  }, [])

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false)

    if (isTrackingTime && audioRef.current) {
      const currentAudioTime = audioRef.current.currentTime
      const playedDuration = Math.abs(
        currentAudioTime - lastCurrentTimeRef.current
      )

      // Chỉ cộng thời gian nếu audio thực sự đã chạy forward (không seek)
      if (playedDuration > 0 && playedDuration < 5) {
        // Max 5 giây để tránh seek
        setAudioTimeSpent((prev) => prev + playedDuration)
      }
    }

    setIsTrackingTime(false)
  }, [isTrackingTime])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (isTrackingTime && audioRef.current) {
        const currentAudioTime = audioRef.current.currentTime
        const playedDuration = Math.abs(
          currentAudioTime - lastCurrentTimeRef.current
        )

        if (playedDuration > 0 && playedDuration < 5) {
          setAudioTimeSpent((prev) => prev + playedDuration)
        }
      }
    }
  }, [isTrackingTime])

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }, [isPlaying])

  // Update playback rate when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!attempt || Object.keys(userAnswers).length === 0) return

    const interval = setInterval(() => {
      handleSaveDraft()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [attempt, userAnswers, handleSaveDraft])

  // Save draft when user answers change (debounced)
  useEffect(() => {
    if (!attempt || Object.keys(userAnswers).length === 0) return

    const timeoutId = setTimeout(() => {
      const timeSinceLastSave = Date.now() - lastSaveTime
      if (timeSinceLastSave >= 10000) {
        // Only save if 10 seconds passed since last save
        handleSaveDraft()
      }
    }, 2000) // 2 seconds delay

    return () => clearTimeout(timeoutId)
  }, [userAnswers, attempt, lastSaveTime, handleSaveDraft])

  const handleSeek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        // Nếu đang play, save time trước khi seek
        if (isTrackingTime) {
          const currentAudioTime = audioRef.current.currentTime
          const playedDuration = Math.abs(
            currentAudioTime - lastCurrentTimeRef.current
          )

          if (playedDuration > 0 && playedDuration < 5) {
            setAudioTimeSpent((prev) => prev + playedDuration)
          }
        }

        audioRef.current.currentTime = time
        setCurrentTime(time)

        // Update reference sau khi seek
        lastCurrentTimeRef.current = time
      }
    },
    [isTrackingTime]
  )

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const replayAudio = useCallback(() => {
    if (audioRef.current) {
      // Save current progress nếu đang play
      if (isTrackingTime) {
        const currentAudioTime = audioRef.current.currentTime
        const playedDuration = Math.abs(
          currentAudioTime - lastCurrentTimeRef.current
        )

        if (playedDuration > 0 && playedDuration < 5) {
          setAudioTimeSpent((prev) => prev + playedDuration)
        }
      }

      audioRef.current.currentTime = 0
      audioRef.current.play()
      lastCurrentTimeRef.current = 0
    }
  }, [isTrackingTime])

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackRate(speed)
    setShowSpeedMenu(false)
  }, [])

  // Answer handling
  const handleAnswerChange = useCallback(
    (gapId: string, answer: string) => {
      const gap = attempt?.gaps.find((g) => g.id === gapId)
      if (!gap) return

      const maxLength = gap.length || 50
      const trimmedAnswer =
        answer.length > maxLength ? answer.substring(0, maxLength) : answer

      setUserAnswers((prev) => ({
        ...prev,
        [gapId]: trimmedAnswer,
      }))
    },
    [attempt?.gaps]
  )

  const handleAnswerSubmit = useCallback(
    (gapId: string) => {
      const answer = userAnswers[gapId]
      if (!answer?.trim() || !attempt) return

      submitAnswerMutation.mutate(
        {
          attemptId: attempt.attemptId,
          gapId,
          answer: answer.trim(),
        },
        {
          onSuccess: (response) => {
            setAttempt((prev) => {
              if (!prev) return prev
              const updatedGaps = prev.gaps.map((gap) =>
                gap.id === gapId
                  ? {
                      ...gap,
                      answer: answer.trim(),
                      isCorrect: response.data.isCorrect,
                    }
                  : gap
              )
              return { ...prev, gaps: updatedGaps }
            })

            const currentGap = attempt.gaps.findIndex((g) => g.id === gapId)
            if (currentGap < attempt.gaps.length - 1) {
              setCurrentGapIndex(currentGap + 1)
              setTimeout(() => {
                inputRefs.current[currentGap + 1]?.focus()
              }, 100)
            } else {
              handleCompleteAttempt()
            }
          },
        }
      )
    },
    [userAnswers, attempt, submitAnswerMutation]
  )

  const handleCompleteAttempt = useCallback(() => {
    if (!attempt || !podcastId) return

    // Gọi API submit attempt thay vì complete attempt
    submitAttemptMutation.mutate(
      {
        podcastId,
        attemptId: attempt.attemptId,
        answers: userAnswers,
      },
      {
        onSuccess: (response) => {
          console.log('Check res:', response)
          setResult(response.data)
          setShowResults(true)
        },
        onError: (error) => {
          console.error('Failed to submit attempt:', error)
        },
      }
    )
  }, [attempt, podcastId, userAnswers, submitAttemptMutation])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const renderTranscriptWithInputs = useCallback(() => {
    if (!attempt) return null

    const transcript = attempt.transcriptMasked
    const gaps = attempt.gaps.sort((a, b) => a.startIndex - b.startIndex)

    const result = []
    let lastIndex = 0

    gaps.forEach((gap, index) => {
      if (gap.startIndex > lastIndex) {
        result.push(
          <span key={`text-${index}`} className="text-gray-800">
            {transcript.substring(lastIndex, gap.startIndex)}
          </span>
        )
      }

      const isCurrentGap = index === currentGapIndex
      const hasAnswer = gap.answer !== undefined
      const isCorrect = gap.isCorrect

      result.push(
        <span key={`gap-${gap.id}`} className="inline-block mx-1">
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            value={userAnswers[gap.id] || ''}
            onChange={(e) => handleAnswerChange(gap.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAnswerSubmit(gap.id)
              }
            }}
            onBlur={() => {
              if (userAnswers[gap.id]?.trim()) {
                handleAnswerSubmit(gap.id)
              }
            }}
            maxLength={gap.length || 50}
            className={`
              inline-block min-w-[80px] px-2 py-1 border-b-2 bg-transparent text-center font-medium
              ${isCurrentGap && !hasAnswer ? 'border-blue-500 bg-blue-50' : ''}
              ${hasAnswer && isCorrect ? 'border-green-500 bg-green-50 text-green-700' : ''}
              ${hasAnswer && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : ''}
              ${!hasAnswer && !isCurrentGap ? 'border-gray-300' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            placeholder="___"
            disabled={hasAnswer || showResults}
            autoFocus={isCurrentGap && !hasAnswer}
          />
        </span>
      )

      lastIndex = gap.endIndex
    })

    if (lastIndex < transcript.length) {
      result.push(
        <span key="text-end" className="text-gray-800">
          {transcript.substring(lastIndex)}
        </span>
      )
    }

    return result
  }, [
    attempt,
    currentGapIndex,
    userAnswers,
    showResults,
    handleAnswerChange,
    handleAnswerSubmit,
  ])

  const getProgressPercentage = useCallback(() => {
    if (!attempt) return 0
    const answeredGaps = attempt.gaps.filter(
      (gap) => gap.answer !== undefined
    ).length
    return (answeredGaps / attempt.gaps.length) * 100
  }, [attempt])

  const getCorrectAnswersCount = useCallback(() => {
    if (!attempt) return 0
    return attempt.gaps.filter((gap) => gap.isCorrect === true).length
  }, [attempt])

  const resetForNewAttempt = useCallback(() => {
    setShowResults(false)
    setAttempt(null)
    setUserAnswers({})
    setCurrentGapIndex(0)
    setHasStartedAttempt(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  if (!attempt || isPodcastLoading || startPodcastMutation.isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/listening-practice')}
                className="hover:bg-gray-100"
              >
                <Home className="h-5 w-5" />
              </Button>

              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Podcasts</span>
                <span>/</span>
                <span className="font-medium text-gray-900">
                  {attempt.title}
                </span>
              </div>
            </div>

            {/* Right side - Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100/50">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="text-green-700">
                    {
                      Object.keys(userAnswers).filter((id) =>
                        userAnswers[id]?.trim()
                      ).length
                    }
                    /{attempt.gaps.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-100/50">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCompleteAttempt}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6"
              >
                <Award className="h-4 w-4 mr-2" />
                Hoàn thành
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">💡</div>
            <div>
              <p className="text-blue-800 font-medium mb-2">Hướng dẫn:</p>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Nghe audio và điền từ còn thiếu vào chỗ trống</li>
                <li>• Nhấn Enter hoặc click ra ngoài để xác nhận đáp án</li>
                <li>• Sử dụng nút tốc độ để điều chỉnh tốc độ phát âm thanh</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Transcript */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {attempt.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {attempt.metadata.difficulty}
                  </span>
                  <span>Lần thử: {attempt.attemptNo}</span>
                  <span>{attempt.gaps.length} chỗ trống</span>
                </div>
              </div>

              {/* Transcript with inputs */}
              <div className="prose max-w-none">
                <div className="text-[14px] leading-relaxed">
                  {renderTranscriptWithInputs()}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Progress & Controls */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">Tiến độ</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đã hoàn thành</span>
                  <span className="font-semibold text-gray-900">
                    {
                      attempt.gaps.filter((g: any) => g.answer !== undefined)
                        .length
                    }
                    /{attempt.gaps.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đúng</span>
                  <span className="font-semibold text-green-600">
                    {getCorrectAnswersCount()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sai</span>
                  <span className="font-semibold text-red-600">
                    {
                      attempt.gaps.filter((g: any) => g.isCorrect === false)
                        .length
                    }
                  </span>
                </div>

                {/* Attempt number */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Lần làm</span>
                    <span className="font-semibold text-blue-600">
                      #{attempt.attemptNo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      Thời gian nghe
                    </span>
                    <span className="font-mono text-xs text-gray-600">
                      {Math.floor(audioTimeSpent / 60)}:
                      {String(Math.floor(audioTimeSpent % 60)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCompleteAttempt}
                className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                disabled={submitAttemptMutation.isPending}
              >
                {submitAttemptMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang nộp bài...
                  </div>
                ) : (
                  'Nộp bài'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-600 rounded-full animate-spin" />
                    Đang lưu...
                  </div>
                ) : (
                  'Lưu nháp'
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/listening-practice')}
                className="w-full border-gray-200"
              >
                Thoát
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Audio Player at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/60 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Song Info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">
                  {attempt.title}
                </p>
                <p className="text-slate-500 text-xs">Podcast Practice Audio</p>
              </div>
            </div>

            {/* Center - Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={replayAudio}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                title="Phát lại từ đầu"
              >
                <RotateCcw className="h-5 w-5 text-slate-600" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>

              {/* Speed Control */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
                  title="Tốc độ phát"
                >
                  <Gauge className="h-5 w-5 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-600 min-w-[28px]">
                    {playbackRate}x
                  </span>
                </button>

                {/* Speed Menu */}
                {showSpeedMenu && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[80px] z-60">
                    {speedOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSpeedChange(option.value)}
                        className={`w-full px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          playbackRate === option.value
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200">
                <Settings className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Right - Progress & Time */}
            <div className="flex items-center gap-4 min-w-[200px]">
              <span className="text-xs font-mono text-slate-600">
                {formatTime(Math.floor(currentTime))}
              </span>
              <div
                className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const width = rect.width
                  const newTime = (clickX / width) * duration
                  handleSeek(newTime)
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-200"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-slate-600">
                {formatTime(Math.floor(duration))}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          preload="metadata"
        >
          {podcastData?.audioUrl && (
            <source src={podcastData.audioUrl} type="audio/mpeg" />
          )}
        </audio>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 bg-white">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900">Hoàn thành!</h2>

              <div className="space-y-3 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng số câu:</span>
                  <span className="font-semibold">
                    {result?.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Câu đúng:</span>
                  <span className="font-semibold text-green-600">
                    {result?.correctCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm:</span>
                  <span className="font-bold text-xl text-blue-600">
                    {result?.scorePercent}%
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/listening-practice')}
                  className="flex-1"
                >
                  Về danh sách
                </Button>
                <Button onClick={resetForNewAttempt} className="flex-1">
                  Làm lại
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Click outside to close speed menu */}
      {showSpeedMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSpeedMenu(false)}
        />
      )}
    </div>
  )
}

export default PodcastPracticePage
