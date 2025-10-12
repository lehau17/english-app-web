import {
  ArrowLeft,
  BookOpen,
  Check,
  RefreshCw,
  Shuffle,
  Volume2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavedWords } from '../hooks/useVocabulary'
import { dictionaryAPI } from '../services/dictionary.api'
import type { WordResult } from '../services/dictionary.api'

export default function FlashcardReviewPage() {
  const navigate = useNavigate()
  const { data: savedWords = [], isLoading } = useSavedWords()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [wordDetails, setWordDetails] = useState<Map<string, WordResult>>(
    new Map()
  )
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set())
  const [unknownWords, setUnknownWords] = useState<Set<string>>(new Set())
  const [shuffledWords, setShuffledWords] = useState(savedWords)
  const [isPlaying, setIsPlaying] = useState(false)

  // Shuffle words on mount
  useEffect(() => {
    if (savedWords.length > 0) {
      const shuffled = [...savedWords].sort(() => Math.random() - 0.5)
      setShuffledWords(shuffled)
    }
  }, [savedWords])

  // Load current word details
  useEffect(() => {
    const loadWordDetails = async () => {
      if (shuffledWords.length === 0) return

      const currentWord = shuffledWords[currentIndex].word
      if (wordDetails.has(currentWord)) return

      setIsLoadingWord(true)
      try {
        const details = await dictionaryAPI.lookupWord(currentWord)
        setWordDetails(new Map(wordDetails).set(currentWord, details))
      } catch (error) {
        console.error('Failed to load word details:', error)
      } finally {
        setIsLoadingWord(false)
      }
    }

    loadWordDetails()
  }, [currentIndex, shuffledWords, wordDetails])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKnow = () => {
    const word = shuffledWords[currentIndex].word
    setKnownWords(new Set(knownWords).add(word))
    unknownWords.delete(word)
    nextCard()
  }

  const handleDontKnow = () => {
    const word = shuffledWords[currentIndex].word
    setUnknownWords(new Set(unknownWords).add(word))
    knownWords.delete(word)
    nextCard()
  }

  const nextCard = () => {
    setIsFlipped(false)
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const previousCard = () => {
    setIsFlipped(false)
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...shuffledWords].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownWords(new Set())
    setUnknownWords(new Set())
  }

  const handlePlayAudio = async () => {
    if (isPlaying) return

    const currentWord = shuffledWords[currentIndex].word
    const details = wordDetails.get(currentWord)

    if (details?.audioUrl) {
      setIsPlaying(true)
      const audio = new Audio(details.audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      try {
        await audio.play()
      } catch (error) {
        console.error('Audio playback failed:', error)
        setIsPlaying(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (savedWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có từ để ôn tập
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy lưu một số từ vựng trước khi bắt đầu ôn tập với Flashcard!
            </p>
            <button
              onClick={() => navigate('/dictionary')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Đi tới Từ điển
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentWord = shuffledWords[currentIndex]
  const details = wordDetails.get(currentWord.word)
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100
  const isComplete = currentIndex === shuffledWords.length - 1 && isFlipped

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShuffle}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Xáo trộn"
            >
              <Shuffle className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleRestart}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Bắt đầu lại"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Thẻ {currentIndex + 1} / {shuffledWords.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% hoàn thành
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-6">
          <div
            className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            {/* Front Side - Word */}
            <div
              className={`absolute w-full h-full backface-hidden ${
                isFlipped ? 'invisible' : 'visible'
              }`}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-12 h-full flex flex-col items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wide mb-4 opacity-90">
                    Từ vựng
                  </p>
                  <h1 className="text-6xl font-bold mb-6">
                    {currentWord.word}
                  </h1>
                  {details?.pronunciation && (
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <p className="text-xl opacity-90">
                        /{details.pronunciation}/
                      </p>
                      {details.audioUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayAudio()
                          }}
                          disabled={isPlaying}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-sm opacity-75 mt-8">Nhấp để xem nghĩa</p>
                </div>
              </div>
            </div>

            {/* Back Side - Definition */}
            <div
              className={`absolute w-full h-full backface-hidden rotate-y-180 ${
                isFlipped ? 'visible' : 'invisible'
              }`}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 h-full overflow-y-auto">
                {isLoadingWord ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : details ? (
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      {currentWord.word}
                    </h2>

                    {details.definitions.map((def, idx) => (
                      <div key={idx} className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {def.partOfSpeech}
                          </span>
                        </div>
                        <p className="text-lg text-gray-900 mb-2">
                          {def.definition}
                        </p>
                        {def.example && (
                          <p className="text-gray-600 italic pl-4 border-l-2 border-blue-300">
                            "{def.example}"
                          </p>
                        )}
                      </div>
                    ))}

                    <p className="text-sm text-gray-500 text-center mt-8">
                      Nhấp để quay lại
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Không tải được nghĩa
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isFlipped && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDontKnow()
              }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
              Chưa nhớ
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleKnow()
              }}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-medium transition-colors shadow-lg"
            >
              <Check className="w-5 h-5" />
              Đã nhớ
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousCard}
            disabled={currentIndex === 0}
            className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Trước
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === shuffledWords.length - 1}
            className="px-6 py-3 bg-white rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Tiếp →
          </button>
        </div>

        {/* Stats */}
        {(knownWords.size > 0 || unknownWords.size > 0) && (
          <div className="mt-6 bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Thống kê ôn tập
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">
                  {knownWords.size}
                </p>
                <p className="text-sm text-gray-600">Đã nhớ</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-3xl font-bold text-red-600">
                  {unknownWords.size}
                </p>
                <p className="text-sm text-gray-600">Chưa nhớ</p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">🎉 Hoàn thành!</h3>
            <p className="mb-4">
              Bạn đã ôn xong {shuffledWords.length} từ vựng
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRestart}
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Ôn lại
              </button>
              <button
                onClick={() => navigate('/my-vocabulary')}
                className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
              >
                Về danh sách
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  )
}
