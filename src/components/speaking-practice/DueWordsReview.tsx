import React from 'react'
import { Clock, Volume2 } from 'lucide-react'
import type { DueWord } from '../../types/speaking-practice.types'

interface DueWordsReviewProps {
  words: DueWord[]
  total: number
  onSelectWord: (word: DueWord) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export const DueWordsReview: React.FC<DueWordsReviewProps> = ({
  words,
  total,
  onSelectWord,
  onLoadMore,
  hasMore,
}) => {
  const playAudio = (url: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation()
    if (url) {
      const audio = new Audio(url)
      audio.play()
    }
  }

  const getDifficultyColor = (easeFactor: number) => {
    if (easeFactor >= 2.5) return 'bg-green-100 text-green-700'
    if (easeFactor >= 2.0) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const getDifficultyLabel = (easeFactor: number) => {
    if (easeFactor >= 2.5) return 'De'
    if (easeFactor >= 2.0) return 'Trung binh'
    return 'Kho'
  }

  if (words.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-green-600 mb-2">Tuyet voi!</h3>
        <p className="text-gray-600">
          Ban da on tap het cac tu can luyen tap hom nay.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold">Tu can on tap</h3>
        </div>
        <span className="text-sm text-gray-500">
          {words.length} / {total} tu
        </span>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {words.map((word) => (
          <div
            key={word.id}
            onClick={() => onSelectWord(word)}
            className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="font-medium">{word.word}</div>
              {word.phonetic && (
                <div className="text-sm text-blue-500">{word.phonetic}</div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                Da luyen {word.attemptCount} lan
              </div>
            </div>

            <div className="flex items-center gap-3">
              {word.audioUrl && (
                <button
                  onClick={(e) => playAudio(word.audioUrl, e)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Volume2 className="w-4 h-4 text-gray-500" />
                </button>
              )}

              <span
                className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                  word.easeFactor
                )}`}
              >
                {getDifficultyLabel(word.easeFactor)}
              </span>

              <div className="text-xs text-gray-400">{word.interval}d</div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="p-3 border-t text-center">
          <button
            onClick={onLoadMore}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            Xem them
          </button>
        </div>
      )}
    </div>
  )
}
