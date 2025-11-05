import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lightbulb,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  useStartReviewSession,
  useSubmitReview,
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

  const startMutation = useStartReviewSession()
  const submitMutation = useSubmitReview()

  useEffect(() => {
    if (listId || unitId) {
      startMutation.mutate(
        {
          listId,
          unitId,
          mode: ReviewMode.FLASHCARD,
          limit: 50,
          includeNew: true,
          includeReview: true,
        },
        {
          onSuccess: (data) => {
            setTerms(data.terms)
          },
        }
      )
    }
  }, [listId, unitId])

  const currentTerm = terms[currentIndex]
  const progress =
    terms.length > 0 ? ((currentIndex + 1) / terms.length) * 100 : 0

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleRate = (quality: number) => {
    if (!currentTerm) return

    setReviews([...reviews, { termId: currentTerm.id, quality }])

    if (currentIndex < terms.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
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

  if (terms.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No cards to review</p>
          <Button onClick={() => navigate(`/vocabulary/lists/${listId}`)}>
            Back to List
          </Button>
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
          <p className="text-gray-600 text-lg mb-8">
            You reviewed {terms.length} cards
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/vocabulary/lists/${listId}`)}
              className="flex-1 border-2 border-gray-300 rounded-xl py-3"
            >
              Back to List
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-3 font-semibold"
            >
              Review Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(`/vocabulary/lists/${listId}`)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <p className="text-gray-600 font-medium">
              {currentIndex + 1} / {terms.length} cards
            </p>
          </div>

          {/* Progress Bar - Parroto Style */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Flashcard Area - Parroto Style (Light Mode) */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Flashcard */}
        <div
          className="bg-white border-2 border-gray-200 rounded-3xl p-12 mb-6 min-h-[500px] flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-all"
          onClick={handleFlip}
        >
          {!isFlipped ? (
            /* Front Side - Word */
            <div className="text-center w-full">
              {/* Image */}
              {currentTerm?.imageUrl && (
                <div className="mb-6">
                  <img
                    src={currentTerm.imageUrl}
                    alt={currentTerm.word}
                    className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-lg"
                  />
                </div>
              )}

              {/* Part of Speech */}
              {currentTerm?.partOfSpeech && (
                <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                  {currentTerm.partOfSpeech}
                </span>
              )}

              {/* Word */}
              <h1 className="text-6xl font-bold text-gray-900 mb-4">
                {currentTerm?.word}
              </h1>

              {/* Pronunciation */}
              {(currentTerm?.ipaUs || currentTerm?.pronunciation) && (
                <p className="text-xl text-gray-600 mb-6">
                  US: {currentTerm.ipaUs || currentTerm.pronunciation}
                  {currentTerm?.ipaUk && (
                    <span className="ml-4">UK: {currentTerm.ipaUk}</span>
                  )}
                </p>
              )}

              {/* Audio Button */}
              {currentTerm?.audioUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio()
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-semibold transition-colors"
                >
                  <Volume2 className="h-5 w-5" />
                  <span>Play Audio</span>
                </button>
              )}

              {/* Translation */}
              {currentTerm?.translationVi && (
                <p className="text-2xl text-blue-600 font-semibold mt-8">
                  {currentTerm.translationVi}
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-12 text-gray-400">
                <Eye className="h-5 w-5" />
                <p className="text-sm font-medium">Click to see definition</p>
              </div>
            </div>
          ) : (
            /* Back Side - Definition */
            <div className="text-center w-full">
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-4">
                Definition
              </p>

              {/* EN Definition */}
              <div className="mb-6 p-6 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-600 font-semibold mb-2">EN: </p>
                <p className="text-lg text-gray-900">
                  {currentTerm?.definition}
                </p>
              </div>

              {/* VI Definition */}
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

              {/* Example */}
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

        {/* Flip Back Button */}
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

        {/* Rating Buttons - Parroto Style (Light Mode) */}
        {isFlipped && (
          <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
            {/* Again / Don't Know */}
            <button
              onClick={() => handleRate(0)}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Eye className="h-5 w-5" />
                <span>Again</span>
              </div>
              <p className="text-sm opacity-90">10 min</p>
            </button>

            {/* Hard */}
            <button
              onClick={() => handleRate(2)}
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>Hard</span>
              </div>
              <p className="text-sm opacity-90">1-4 day</p>
            </button>

            {/* Good */}
            <button
              onClick={() => handleRate(4)}
              className="bg-green-400 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>Good</span>
              </div>
              <p className="text-sm opacity-90">1-4 day</p>
            </button>

            {/* Easy */}
            <button
              onClick={() => handleRate(5)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>Easy</span>
              </div>
              <p className="text-sm opacity-90">1-7 day</p>
            </button>
          </div>
        )}

        {/* Hint/Input (if not flipped yet) */}
        {!isFlipped && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <p className="text-sm text-gray-700 font-semibold">
                  Hint: Try to recall the meaning
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors border border-gray-300">
                  <Eye className="h-5 w-5 inline-block mr-2" />
                  Don't Know
                </button>
                <button
                  onClick={handleFlip}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
                >
                  Check Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Info */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Learning group {currentIndex + 1}/{terms.length} • {terms.length}{' '}
          cards in total
        </p>
      </div>
    </div>
  )
}

export default VocabularyReviewPage
