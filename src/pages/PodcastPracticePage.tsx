import {
  Award,
  Check,
  ChevronRight,
  Headphones,
  Home,
  Pause,
  Play,
  RotateCcw,
  Save,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MediaPlayer,
  type MediaPlayerRef,
} from '../components/podcast/MediaPlayer'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { usePodcast } from '../hooks/podcast.hooks'
import {
  useSaveDraft,
  useStartPodcast,
  useSubmitAnswer,
  useSubmitAttempt,
} from '../hooks/podcastAttempt.hooks'
import { PodcastMediaType } from '../types/podcast.type'
import type { PodcastAttempt } from '../types/podcastAttempt.type'

const PodcastPracticePage: React.FC = () => {
  const { podcastId } = useParams<{ podcastId: string }>()
  const navigate = useNavigate()

  // State
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
  const [audioTimeSpent, setAudioTimeSpent] = useState<number>(0)
  const [isTrackingTime, setIsTrackingTime] = useState<boolean>(false)
  const [result, setResult] = useState<any | null>(null)

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const mediaPlayerRef = useRef<MediaPlayerRef>(null)
  const lastCurrentTimeRef = useRef<number>(0)

  // API hooks
  const { data: podcastData, isLoading: isPodcastLoading } = usePodcast(
    podcastId || ''
  )
  const startPodcastMutation = useStartPodcast()
  const submitAnswerMutation = useSubmitAnswer()
  const saveDraftMutation = useSaveDraft()
  const submitAttemptMutation = useSubmitAttempt()

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

  // Save draft function
  const handleSaveDraft = useCallback(() => {
    if (!attempt || !podcastId) return

    let currentTimeSpent = audioTimeSpent

    if (isTrackingTime && mediaPlayerRef.current) {
      const currentAudioTime = mediaPlayerRef.current.getCurrentTime()
      const playedDuration = Math.abs(
        currentAudioTime - lastCurrentTimeRef.current
      )

      if (playedDuration > 0 && playedDuration < 5) {
        currentTimeSpent = audioTimeSpent + playedDuration
        setAudioTimeSpent(currentTimeSpent)
        lastCurrentTimeRef.current = currentAudioTime
      }
    }

    saveDraftMutation.mutate(
      {
        podcastId,
        attemptId: attempt.attemptId,
        answers: userAnswers,
        timeSpent: Math.floor(currentTimeSpent),
      },
      {
        onSuccess: () => setLastSaveTime(Date.now()),
      }
    )
  }, [
    attempt,
    podcastId,
    userAnswers,
    audioTimeSpent,
    isTrackingTime,
    saveDraftMutation,
  ])

  // Initialize attempt
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
          setAudioTimeSpent(response.data.timeSpent || 0)
          inputRefs.current = new Array(response.data.gaps.length).fill(null)
          setUserAnswers(response.data.answers || {})
        },
        onError: () => {
          setHasStartedAttempt(false)
          navigate('/listening-practice')
        },
      })
    }
  }, [podcastId, attempt, hasStartedAttempt, startPodcastMutation, navigate])

  // Media player handlers
  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true)
    setIsTrackingTime(true)
    if (mediaPlayerRef.current) {
      lastCurrentTimeRef.current = mediaPlayerRef.current.getCurrentTime()
    }
  }, [])

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false)

    if (isTrackingTime && mediaPlayerRef.current) {
      const currentAudioTime = mediaPlayerRef.current.getCurrentTime()
      const playedDuration = Math.abs(
        currentAudioTime - lastCurrentTimeRef.current
      )

      if (playedDuration > 0 && playedDuration < 5) {
        setAudioTimeSpent((prev) => prev + playedDuration)
      }
    }

    setIsTrackingTime(false)
  }, [isTrackingTime])

  const handleTimeUpdate = useCallback(() => {
    if (mediaPlayerRef.current) {
      setCurrentTime(mediaPlayerRef.current.getCurrentTime())
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (mediaPlayerRef.current) {
      setDuration(mediaPlayerRef.current.getDuration())
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (mediaPlayerRef.current) {
      if (isPlaying) {
        mediaPlayerRef.current.pause()
      } else {
        mediaPlayerRef.current.play()
      }
    }
  }, [isPlaying])

  const handleSeek = useCallback(
    (time: number) => {
      if (mediaPlayerRef.current) {
        if (isTrackingTime) {
          const currentAudioTime = mediaPlayerRef.current.getCurrentTime()
          const playedDuration = Math.abs(
            currentAudioTime - lastCurrentTimeRef.current
          )

          if (playedDuration > 0 && playedDuration < 5) {
            setAudioTimeSpent((prev) => prev + playedDuration)
          }
        }

        mediaPlayerRef.current.seek(time)
        setCurrentTime(time)
        lastCurrentTimeRef.current = time
      }
    },
    [isTrackingTime]
  )

  const replayAudio = useCallback(() => {
    if (mediaPlayerRef.current) {
      if (isTrackingTime) {
        const currentAudioTime = mediaPlayerRef.current.getCurrentTime()
        const playedDuration = Math.abs(
          currentAudioTime - lastCurrentTimeRef.current
        )

        if (playedDuration > 0 && playedDuration < 5) {
          setAudioTimeSpent((prev) => prev + playedDuration)
        }
      }

      mediaPlayerRef.current.seek(0)
      mediaPlayerRef.current.play()
      lastCurrentTimeRef.current = 0
    }
  }, [isTrackingTime])

  // Playback rate
  useEffect(() => {
    if (mediaPlayerRef.current) {
      mediaPlayerRef.current.setPlaybackRate(playbackRate)
    }
  }, [playbackRate])

  // Auto-save
  useEffect(() => {
    if (!attempt || Object.keys(userAnswers).length === 0) return

    const interval = setInterval(() => {
      handleSaveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [attempt, userAnswers, handleSaveDraft])

  useEffect(() => {
    if (!attempt || Object.keys(userAnswers).length === 0) return

    const timeoutId = setTimeout(() => {
      const timeSinceLastSave = Date.now() - lastSaveTime
      if (timeSinceLastSave >= 10000) {
        handleSaveDraft()
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [userAnswers, attempt, lastSaveTime, handleSaveDraft])

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
            }
          },
        }
      )
    },
    [userAnswers, attempt, submitAnswerMutation]
  )

  const handleCompleteAttempt = useCallback(() => {
    if (!attempt || !podcastId) return

    submitAttemptMutation.mutate(
      {
        podcastId,
        attemptId: attempt.attemptId,
        answers: userAnswers,
      },
      {
        onSuccess: (response) => {
          setResult(response.data)
          setShowResults(true)
        },
      }
    )
  }, [attempt, podcastId, userAnswers, submitAttemptMutation])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
          <span key={`text-${index}`} className="text-gray-900">
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
              inline-block min-w-[100px] px-3 py-1 border-b-2 bg-white/80 text-center font-medium rounded
              transition-all duration-200
              ${isCurrentGap && !hasAnswer ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : ''}
              ${hasAnswer && isCorrect ? 'border-green-500 bg-green-50 text-green-700' : ''}
              ${hasAnswer && !isCorrect ? 'border-red-500 bg-red-50 text-red-700' : ''}
              ${!hasAnswer && !isCurrentGap ? 'border-gray-200 hover:border-gray-300' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-200
              disabled:opacity-50 disabled:cursor-not-allowed
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
        <span key="text-end" className="text-gray-900">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
          <p className="text-gray-600">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/listening-practice')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-gray-900">{attempt.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {attempt.metadata.difficulty}
                  </span>
                  <span>•</span>
                  <span>Lần thử #{attempt.attemptNo}</span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {
                    Object.keys(userAnswers).filter((id) =>
                      userAnswers[id]?.trim()
                    ).length
                  }
                </span>
                /{attempt.gaps.length} đã điền
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left - Transcript */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white">
              {/* Video Player (if video) */}
              {podcastData?.mediaType === PodcastMediaType.VIDEO &&
                podcastData.videoUrl && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <MediaPlayer
                        ref={mediaPlayerRef}
                        mediaType={PodcastMediaType.VIDEO}
                        videoUrl={podcastData.videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={handleAudioPlay}
                        onPause={handleAudioPause}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}

              {/* Transcript */}
              <div className="prose prose-lg max-w-none">
                <div className="text-base leading-8">
                  {renderTranscriptWithInputs()}
                </div>
              </div>
            </Card>
          </div>

          {/* Right - Stats */}
          <div className="space-y-4">
            {/* Progress */}
            <Card className="p-4 bg-white">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Tiến độ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hoàn thành</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Câu đúng</span>
                    <span className="font-semibold text-green-600">
                      {getCorrectAnswersCount()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Câu sai</span>
                    <span className="font-semibold text-red-600">
                      {
                        attempt.gaps.filter((g: any) => g.isCorrect === false)
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Chưa làm</span>
                    <span className="font-semibold text-gray-900">
                      {
                        attempt.gaps.filter((g: any) => g.answer === undefined)
                          .length
                      }
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thời gian nghe</span>
                    <span className="font-mono text-gray-900">
                      {Math.floor(audioTimeSpent / 60)}:
                      {String(Math.floor(audioTimeSpent % 60)).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-4 bg-white">
              <div className="space-y-2">
                <Button
                  onClick={handleSaveDraft}
                  variant="outline"
                  className="w-full"
                  disabled={saveDraftMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu nháp
                </Button>

                <Button
                  onClick={handleCompleteAttempt}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={submitAttemptMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Nộp bài
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Audio Player - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {attempt.title}
                </p>
                <p className="text-xs text-gray-500">
                  {attempt.gaps.length} câu hỏi
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <button
                onClick={replayAudio}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Phát lại"
              >
                <RotateCcw className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>

              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {playbackRate}x
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[100px]">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackRate(speed)
                          setShowSpeedMenu(false)
                        }}
                        className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                          playbackRate === speed
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 min-w-[300px] flex-1">
              <span className="text-xs font-mono text-gray-600 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <div
                className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const width = rect.width
                  const newTime = (clickX / width) * duration
                  handleSeek(newTime)
                }}
              >
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs font-mono text-gray-600 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden Media Player */}
        {podcastData && (
          <MediaPlayer
            ref={mediaPlayerRef}
            mediaType={podcastData.mediaType || PodcastMediaType.AUDIO}
            audioUrl={podcastData.audioUrl}
            videoUrl={podcastData.videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={handleAudioPlay}
            onPause={handleAudioPause}
            className={
              podcastData.mediaType === PodcastMediaType.VIDEO ? '' : 'hidden'
            }
          />
        )}
      </div>

      {/* Results Modal */}
      {showResults && result && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8 bg-white">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hoàn thành!
                </h2>
                <p className="text-gray-600">Bạn đã hoàn thành bài kiểm tra</p>
              </div>

              <div className="space-y-3 py-4 border-t border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng số câu</span>
                  <span className="font-semibold text-gray-900">
                    {result.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Câu đúng</span>
                  <span className="font-semibold text-green-600">
                    {result.correctCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm số</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {result.scorePercent}%
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

      {/* Speed menu backdrop */}
      {showSpeedMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowSpeedMenu(false)}
        />
      )}
    </div>
  )
}

export default PodcastPracticePage
