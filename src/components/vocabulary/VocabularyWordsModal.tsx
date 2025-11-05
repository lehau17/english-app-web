import { Volume2, X } from 'lucide-react'
import React from 'react'
import type { VocabularyUnit } from '../../types/vocabulary.type'

interface VocabularyWordsModalProps {
  unit: VocabularyUnit | undefined
  isOpen: boolean
  onClose: () => void
}

export const VocabularyWordsModal: React.FC<VocabularyWordsModalProps> = ({
  unit,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !unit) return null

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{unit.title}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {unit.terms?.length || 0} words
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {unit.terms?.map((term, index) => (
              <div
                key={term.id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5"
              >
                {/* Word Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {term.word}
                      </h3>
                      {term.partOfSpeech && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {term.partOfSpeech}
                        </span>
                      )}
                    </div>
                    {/* Pronunciation */}
                    {(term.ipaUs || term.pronunciation) && (
                      <p className="text-gray-600 mt-1">
                        /{term.ipaUs || term.pronunciation}/
                      </p>
                    )}
                  </div>
                  {/* Audio Button */}
                  {term.audioUrl && (
                    <button
                      onClick={() => playAudio(term.audioUrl!)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Translation Vietnamese */}
                {term.translationVi && (
                  <div className="mb-3">
                    <p className="text-blue-600 font-semibold">
                      {term.translationVi}
                    </p>
                  </div>
                )}

                {/* Definition English */}
                {term.definition && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 font-semibold mb-1">
                      Definition:
                    </p>
                    <p className="text-gray-700">{term.definition}</p>
                  </div>
                )}

                {/* Examples */}
                {term.examples && term.examples.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 font-semibold mb-2">
                      Examples:
                    </p>
                    <div className="space-y-2">
                      {term.examples.map((example, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <p className="text-gray-900 italic mb-1">
                            {example.sentence
                              .split(new RegExp(`(${term.word})`, 'gi'))
                              .map((part, i) =>
                                part.toLowerCase() ===
                                term.word.toLowerCase() ? (
                                  <span
                                    key={i}
                                    className="font-bold text-blue-600"
                                  >
                                    {part}
                                  </span>
                                ) : (
                                  part
                                )
                              )}
                          </p>
                          {example.translation && (
                            <p className="text-sm text-blue-600">
                              → {example.translation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
