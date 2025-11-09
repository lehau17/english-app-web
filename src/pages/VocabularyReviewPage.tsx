import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ReviewAnswerPanel } from '../components/vocabulary/review/ReviewAnswerPanel'
import { ReviewFlashcard } from '../components/vocabulary/review/ReviewFlashcard'
import { ReviewRatingButtons } from '../components/vocabulary/review/ReviewRatingButtons'
import { ReviewStatsSummary } from '../components/vocabulary/review/ReviewStatsSummary'
import { ReviewTopBar } from '../components/vocabulary/review/ReviewTopBar'
import {
  useStartReviewSession,
  useSubmitReview,
  useReviewStats,
} from '../hooks/vocabulary.hooks'
import type { ReviewSubmission, VocabularyTerm } from '../types/vocabulary.type'
import { ReviewMode } from '../types/vocabulary.type'

const VocabularyReviewPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>()
  const [searchParams] = useSearchParams()
  const unitId = searchParams.get('unitId') || undefined
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
  const [sessionMeta, setSessionMeta] = useState<{
    totalDue: number
    newCount: number
    reviewCount: number
  }>({ totalDue: 0, newCount: 0, reviewCount: 0 })

  const startMutation = useStartReviewSession()
  const submitMutation = useSubmitReview()
  const { data: stats } = useReviewStats(listId)

  useEffect(() => {
    startMutation.mutate(
      {
        listId: listId || undefined,
        unitId,
        mode: ReviewMode.FLASHCARD,
        limit: 50,
        includeNew: true,
        includeReview: true,
      },
      {
        onSuccess: (data) => {
          setTerms(data.terms)
          setSessionMeta({
            totalDue: data.totalDue,
            newCount: data.newCount,
            reviewCount: data.reviewCount,
          })
        },
      }
    )
  }, [listId, unitId])

  // Redirect when review is complete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        if (listId) {
          navigate(`/vocabulary/lists/${listId}`)
        } else {
          navigate('/vocabulary/my-lists')
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, listId, navigate])

  const currentTerm = terms[currentIndex]
  const progress =
    terms.length > 0 ? ((currentIndex + 1) / terms.length) * 100 : 0

  const handleFlip = () => setIsFlipped((prev) => !prev)

  const maskedExample = useMemo(() => {
    if (!currentTerm?.examples || currentTerm.examples.length === 0) return null
    const example = currentTerm.examples[0].sentence
    const word = currentTerm.word.toLowerCase()
    const wordLength = word.length
    const masked = '*'.repeat(wordLength)

    // Replace word with asterisks (case-insensitive)
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return example.replace(regex, masked)
  }, [currentTerm])

  const checkAnswer = () => {
    if (!currentTerm) return

    const normalizedInput = userInput.trim().toLowerCase()
    const normalizedWord = currentTerm.word.toLowerCase()
    const correct = normalizedInput === normalizedWord

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // Auto proceed after 1 second if correct
      setTimeout(() => {
        handleRate(5) // Easy/Correct
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

    setReviews([...reviews, { termId: currentTerm.id, quality }])

    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setUserInput('')
      setShowResult(false)
      setIsCorrect(false)
      setShowPronunciation(false) // Reset pronunciation khi chuyển từ
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

  const handleTogglePronunciation = () => {
    setShowPronunciation((prev) => !prev)
  }

  const resetInteraction = () => {
    setIsFlipped(false)
    setUserInput('')
    setShowResult(false)
    setIsCorrect(false)
    setShowPronunciation(false)
  }

  const handleBack = () => {
    if (listId) {
      navigate(`/vocabulary/lists/${listId}`)
    } else {
      navigate('/vocabulary/my-lists')
    }
  }

  if (startMutation.isPending) {
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
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            Back to List
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <ReviewTopBar
        onBack={handleBack}
        currentIndex={currentIndex}
        totalCards={terms.length}
        progress={progress}
      />

      <ReviewStatsSummary stats={stats} sessionMeta={sessionMeta} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <ReviewFlashcard
            term={currentTerm}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            showPronunciation={showPronunciation}
            onTogglePronunciation={handleTogglePronunciation}
            onPlayAudio={playAudio}
            maskedExample={maskedExample}
          />

          <div className="space-y-6">
            {!isFlipped && (
              <ReviewAnswerPanel
                userInput={userInput}
                onInputChange={setUserInput}
                onCheckAnswer={checkAnswer}
                onDontKnow={handleDontKnow}
                disabled={showResult}
                showResult={showResult}
                isCorrect={isCorrect}
                onReset={resetInteraction}
              />
            )}

            <ReviewRatingButtons
              onRate={handleRate}
              disabled={!isFlipped || submitMutation.isPending}
            />

            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Tiến độ phiên này
              </p>
              <p className="text-lg text-gray-900 font-semibold">
                Thẻ {currentIndex + 1} / {terms.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {sessionMeta.reviewCount} thẻ ôn tập • {sessionMeta.newCount} từ
                mới • {sessionMeta.totalDue} thẻ đến hạn
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VocabularyReviewPage
