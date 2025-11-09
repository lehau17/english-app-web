import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lightbulb,
  Mic,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VocabularyPronunciationPractice } from '../learn/VocabularyPronunciationPractice'
import {
  useStartReviewSession,
  useSubmitReview,
} from '../../hooks/vocabulary.hooks'
import type {
  ReviewSubmission,
  VocabularyTerm,
} from '../../types/vocabulary.type'
import { ReviewMode } from '../../types/vocabulary.type'

export interface VocabularyReviewSessionProps {
  listId?: string
  unitId?: string
  limit?: number
  includeNew?: boolean
  includeReview?: boolean
  allowWithoutIds?: boolean
  defaultBackUrl?: string
  backLabel?: string
}

export const VocabularyReviewSession: React.FC<
  VocabularyReviewSessionProps
> = ({
  listId,
  unitId,
  limit = 50,
  includeNew = true,
  includeReview = true,
  allowWithoutIds = false,
  defaultBackUrl,
  backLabel,
}) => {
  const navigate = useNavigate()

  const [terms, setTerms] = useState<VocabularyTerm[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviews, setReviews] = useState<ReviewSubmission[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [userInput, setUserInput] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [hasRequestedSession, setHasRequestedSession] = useState(false)

  const startMutation = useStartReviewSession()
  const submitMutation = useSubmitReview()

  const backUrl = useMemo(() => {
    if (defaultBackUrl) return defaultBackUrl
    if (listId) return `/vocabulary/lists/${listId}`
    return '/vocabulary'
  }, [defaultBackUrl, listId])

  const backButtonLabel = backLabel ?? (listId ? 'Back' : 'Back to Vocabulary')

  const navigateBack = useCallback(() => {
    if (backUrl === 'history') {
      navigate(-1)
      return
    }
    navigate(backUrl)
  }, [backUrl, navigate])

  useEffect(() => {
    if (hasRequestedSession) return

    const canStart = allowWithoutIds || !!listId || !!unitId
    if (!canStart) return

    setHasRequestedSession(true)
    startMutation.mutate(
      {
        listId,
        unitId,
        mode: ReviewMode.FLASHCARD,
        limit,
        includeNew,
        includeReview,
      },
      {
        onSuccess: (data) => {
          setTerms(data.terms)
        },
        onError: () => {
          setHasRequestedSession(false)
        },
      }
    )
  }, [
    allowWithoutIds,
    hasRequestedSession,
    includeNew,
    includeReview,
    limit,
    listId,
    startMutation,
    unitId,
  ])

  useEffect(() => {
    if (!isComplete) return

    const timer = setTimeout(() => {
      navigateBack()
    }, 1000)

    return () => clearTimeout(timer)
  }, [isComplete, navigateBack])

  const currentTerm = terms[currentIndex]
  const progress =
    terms.length > 0 ? ((currentIndex + 1) / terms.length) * 100 : 0

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const getMaskedExample = () => {
    if (!currentTerm?.examples || currentTerm.examples.length === 0) return null
    const example = currentTerm.examples[0].sentence
    const word = currentTerm.word.toLowerCase()
    const wordLength = word.length
    const masked = '*'.repeat(wordLength)

    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return example.replace(regex, masked)
  }

  const checkAnswer = () => {
    if (!currentTerm) return

    const normalizedInput = userInput.trim().toLowerCase()
    const normalizedWord = currentTerm.word.toLowerCase()
    const correct = normalizedInput === normalizedWord

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setTimeout(() => {
        handleRate(5)
      }, 1000)
    }
  }

  const handleDontKnow = () => {
    setShowResult(true)
    setIsCorrect(false)
    setIsFlipped(true)
  }

  const handleRate = (quality: number) => {
    if (!currentTerm) return

    setReviews((prev) => [...prev, { termId: currentTerm.id, quality }])

    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setUserInput('')
      setShowResult(false)
      setIsCorrect(false)
      setShowPronunciation(false)
    } else {
      const duration = Math.floor((Date.now() - startTime) / 1000)
      submitMutation.mutate(
        {
          reviews: [...reviews, { termId: currentTerm.id, quality }],
          listId,
          mode: ReviewMode.FLASHCARD,
          duration,
        },
        {
          onSuccess: () => {
            setIsComplete(true)
          },
        }
      )
    }
  }

  const playAudio = () => {
    if (currentTerm?.audioUrl) {
      const audio = new Audio(currentTerm.audioUrl)
      audio.play()
    }
  }

  if (startMutation.isPending && terms.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (terms.length === 0 && !startMutation.isPending) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No cards to review</p>
          <button
            onClick={navigateBack}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            {backButtonLabel}
          </button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Review Complete!
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            You reviewed {terms.length} cards
          </p>
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <button
              onClick={navigateBack}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">{backButtonLabel}</span>
            </button>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {currentIndex + 1} / {terms.length} cards
            </p>
          </div>
          <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div
          className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mb-4 sm:mb-6 min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all"
          onClick={handleFlip}
        >
          {!isFlipped ? (
            <div className="w-full" onClick={(e) => e.stopPropagation()}>
              {currentTerm?.imageUrl && (
                <div className="mb-6 text-center">
                  <img
                    src={currentTerm.imageUrl}
                    alt="vocabulary"
                    className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-lg"
                  />
                </div>
              )}

              <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                {currentTerm?.partOfSpeech && (
                  <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {currentTerm.partOfSpeech}
                  </span>
                )}
                {currentTerm?.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playAudio()
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 font-semibold transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
                {currentTerm?.word && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPronunciation((v) => !v)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 font-semibold transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    {showPronunciation ? 'Ẩn phát âm' : 'Luyện phát âm'}
                  </button>
                )}
              </div>

              {currentTerm?.translationVi && (
                <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
                  {currentTerm.translationVi}
                </h2>
              )}

              {currentTerm?.definition && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-semibold mb-2">
                    English Definition:
                  </p>
                  <p className="text-base text-gray-900 leading-relaxed">
                    {currentTerm.definition}
                  </p>
                </div>
              )}

              {currentTerm?.translationVi && currentTerm?.definition && (
                <div className="mb-6">
                  <p className="text-sm text-blue-600 font-semibold mb-2">
                    Definition:
                  </p>
                  <p className="text-base text-blue-800 leading-relaxed">
                    {currentTerm.translationVi}.
                  </p>
                </div>
              )}

              {showPronunciation && currentTerm?.word && (
                <div className="mb-6">
                  <VocabularyPronunciationPractice
                    word={currentTerm.word}
                    activityId={undefined}
                  />
                </div>
              )}

              {getMaskedExample() && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-semibold mb-3">
                    Example:
                  </p>
                  <p className="text-xl font-medium text-gray-900 italic mb-3 leading-relaxed">
                    {getMaskedExample()}
                  </p>
                  {currentTerm?.examples &&
                    currentTerm.examples[0]?.translation && (
                      <p className="text-base text-blue-600 leading-relaxed">
                        → {currentTerm.examples[0].translation}
                      </p>
                    )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Definition
              </p>

              <div className="mb-6 p-6 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-semibold mb-2">EN: </p>
                <p className="text-lg text-gray-900">
                  {currentTerm?.definition}
                </p>
              </div>

              {currentTerm?.translationVi && (
                <div className="mb-6 p-6 bg-blue-50 rounded-2xl">
                  <p className="text-sm text-blue-600 font-semibold mb-2">
                    VI:{' '}
                  </p>
                  <p className="text-lg text-blue-900 font-medium">
                    {currentTerm.translationVi}
                  </p>
                </div>
              )}

              {currentTerm?.examples && currentTerm.examples.length > 0 && (
                <div className="text-left max-w-2xl mx-auto mb-6">
                  <p className="text-sm text-gray-600 font-semibold mb-3">
                    Example:
                  </p>
                  {currentTerm.examples.map((ex, i) => (
                    <div key={i} className="mb-3 p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-900 italic mb-1">
                        {ex.sentence
                          .split(currentTerm.word)
                          .map((part, idx, arr) =>
                            idx < arr.length - 1 ? (
                              <React.Fragment key={idx}>
                                {part}
                                <span className="font-bold text-blue-600">
                                  {currentTerm.word}
                                </span>
                              </React.Fragment>
                            ) : (
                              part
                            )
                          )}
                      </p>
                      {ex.translation && (
                        <p className="text-sm text-blue-600">
                          → {ex.translation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-8 text-gray-400">
                <EyeOff className="h-5 w-5" />
                <p className="text-sm font-medium">Click to flip back</p>
              </div>
            </div>
          )}
        </div>

        {isFlipped && (
          <div className="text-center mb-6">
            <button
              onClick={handleFlip}
              className="inline-flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              Flip Back
            </button>
          </div>
        )}

        {isFlipped && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto mb-4 sm:mb-6">
            <button
              onClick={() => handleRate(0)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Again</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">10 min</p>
            </button>

            <button
              onClick={() => handleRate(2)}
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="text-sm sm:text-base">Hard</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">1-4 day</p>
            </button>

            <button
              onClick={() => handleRate(4)}
              className="bg-green-400 hover:bg-green-500 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="text-sm sm:text-base">Good</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">1-4 day</p>
            </button>

            <button
              onClick={() => handleRate(5)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                <span className="text-sm sm:text-base">Easy</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90">1-7 day</p>
            </button>
          </div>
        )}

        {!isFlipped && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-4 sm:p-6 mb-4">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <p className="text-xs sm:text-sm text-gray-700 font-semibold">
                  Hint
                </p>
              </div>

              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userInput.trim()) {
                    checkAnswer()
                  }
                }}
                placeholder="Type your answer"
                disabled={showResult}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 mb-3 sm:mb-4 border-2 border-gray-300 rounded-xl text-center text-base sm:text-lg font-medium focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button
                  onClick={handleDontKnow}
                  disabled={showResult}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  Don't Know
                </button>
                <button
                  onClick={checkAnswer}
                  disabled={!userInput.trim() || showResult}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-colors shadow-md text-sm sm:text-base"
                >
                  ✓ Check Answer
                </button>
              </div>

              {showResult && !isCorrect && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl py-3 px-4 text-center">
                  <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
                    <span className="text-xl">✕</span>
                    Incorrect
                  </p>
                </div>
              )}

              {showResult && isCorrect && (
                <div className="bg-green-100 border-2 border-green-300 rounded-xl py-3 px-4 text-center">
                  <p className="text-green-600 font-semibold flex items-center justify-center gap-2">
                    <span className="text-xl">✓</span>
                    Correct! Moving to next card...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Learning group {currentIndex + 1}/{terms.length} • {terms.length}{' '}
          cards in total
        </p>
      </div>
    </div>
  )
}
