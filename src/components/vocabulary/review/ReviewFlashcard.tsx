import { EyeOff, Lightbulb, Mic, Volume2 } from 'lucide-react'
import React from 'react'
import type { VocabularyTerm } from '../../../types/vocabulary.type'
import { VocabularyPronunciationPractice } from '../../learn/VocabularyPronunciationPractice'

interface ReviewFlashcardProps {
  term?: VocabularyTerm
  isFlipped: boolean
  onFlip: () => void
  showPronunciation: boolean
  onTogglePronunciation: () => void
  onPlayAudio: () => void
  maskedExample: string | null
}

export const ReviewFlashcard: React.FC<ReviewFlashcardProps> = ({
  term,
  isFlipped,
  onFlip,
  showPronunciation,
  onTogglePronunciation,
  onPlayAudio,
  maskedExample,
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl hover:shadow-2xl transition-shadow min-h-[360px] sm:min-h-[420px] flex flex-col justify-between">
      <div>
        {!isFlipped ? (
          <div>
            {term?.imageUrl && (
              <div className="mb-6 flex justify-center">
                <img
                  src={term.imageUrl}
                  alt={term.word}
                  className="w-40 h-40 rounded-2xl object-cover shadow-md"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {term?.partOfSpeech && (
                <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  {term.partOfSpeech}
                </span>
              )}

              {term?.audioUrl && (
                <button
                  onClick={onPlayAudio}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 font-semibold text-sm transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                  Nghe
                </button>
              )}

              {term?.word && (
                <button
                  onClick={onTogglePronunciation}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 font-semibold text-sm transition-colors"
                >
                  <Mic className="h-4 w-4" />
                  {showPronunciation ? 'Ẩn phát âm' : 'Luyện phát âm'}
                </button>
              )}
            </div>

            {term?.translationVi && (
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-600 text-center mb-6">
                {term.translationVi}
              </h2>
            )}

            {term?.definition && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                <p className="text-xs uppercase text-blue-600 font-semibold mb-2">
                  English Definition
                </p>
                <p className="text-base sm:text-lg text-blue-900 leading-relaxed">
                  {term.definition}
                </p>
              </div>
            )}

            {showPronunciation && term?.word && (
              <div className="mb-6">
                <VocabularyPronunciationPractice
                  word={term.word}
                  activityId={undefined}
                />
              </div>
            )}

            {maskedExample && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs uppercase text-gray-500 font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Ví dụ
                </p>
                <p className="text-lg text-gray-900 italic mb-3 leading-relaxed">
                  {maskedExample}
                </p>
                {term?.examples?.[0]?.translation && (
                  <p className="text-sm text-blue-600">
                    → {term.examples[0].translation}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs uppercase text-gray-400 tracking-wide mb-4">
              Đáp án đầy đủ
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
              <p className="text-sm text-blue-600 font-semibold mb-2">
                Nghĩa tiếng Việt
              </p>
              <p className="text-lg text-blue-900">{term?.translationVi}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 text-left">
              <p className="text-sm text-gray-500 font-semibold mb-3">
                Ví dụ chi tiết
              </p>
              {term?.examples?.map((example, index) => (
                <div
                  key={`${example.sentence}-${index}`}
                  className="mb-3 last:mb-0"
                >
                  <p className="text-gray-800 italic mb-1">
                    {example.sentence}
                  </p>
                  {example.translation && (
                    <p className="text-sm text-blue-600">
                      → {example.translation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-400">
              <EyeOff className="h-4 w-4" />
              <p className="text-sm font-medium">Nhấn để lật lại thẻ</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onFlip}
        className="mt-5 inline-flex items-center justify-center gap-2 self-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        {isFlipped ? 'Lật lại mặt trước' : 'Lật thẻ xem đáp án'}
      </button>
    </div>
  )
}
