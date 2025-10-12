import {
  BookmarkCheck,
  BookmarkPlus,
  BookOpen,
  Calendar,
  ChevronRight,
  Lightbulb,
  Volume2,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWordOfTheDay } from '../hooks/useDictionary'
import {
  useDeleteWord,
  useIsWordSaved,
  useSaveWord,
} from '../hooks/useVocabulary'

export function WordOfTheDayWidget() {
  const navigate = useNavigate()
  const { data: wordData, isLoading, error } = useWordOfTheDay()
  const { mutate: saveWord, isPending: isSaving } = useSaveWord()
  const { mutate: deleteWord, isPending: isDeleting } = useDeleteWord()
  const isWordSaved = useIsWordSaved(wordData?.word || '')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const playPronunciation = () => {
    if (wordData?.audioUrl) {
      setIsPlayingAudio(true)
      const audio = new Audio(wordData.audioUrl)
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err)
        setIsPlayingAudio(false)
      })
      audio.onended = () => setIsPlayingAudio(false)
    }
  }

  const handleToggleSave = () => {
    if (!wordData?.word) return
    if (isWordSaved) {
      deleteWord(wordData.word)
    } else {
      saveWord(wordData.word)
    }
  }

  const translatePartOfSpeech = (pos: string): string => {
    const translations: Record<string, string> = {
      noun: 'Danh từ',
      verb: 'Động từ',
      adjective: 'Tính từ',
      adverb: 'Trạng từ',
      pronoun: 'Đại từ',
      preposition: 'Giới từ',
      conjunction: 'Liên từ',
      interjection: 'Thán từ',
    }
    return translations[pos.toLowerCase()] || pos
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-2xl animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-white/30 rounded-full" />
          <div className="h-6 w-40 bg-white/30 rounded" />
        </div>
        <div className="h-10 w-3/4 bg-white/30 rounded mb-3" />
        <div className="h-4 w-full bg-white/30 rounded mb-2" />
        <div className="h-4 w-5/6 bg-white/30 rounded" />
      </div>
    )
  }

  if (error || !wordData) {
    return (
      <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6" />
          <BookOpen className="w-6 h-6" />
          <h3 className="text-xl font-bold">Từ Vựng Hôm Nay</h3>
        </div>
        <p className="text-white/90">
          Không thể tải từ vựng hôm nay. Vui lòng thử lại sau.
        </p>
      </div>
    )
  }

  const firstDefinition = wordData.definitions[0]

  return (
    <div className="bg-gradient-to-br from-blue-500 via-blue-800 to-pink-500 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-shadow duration-300 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* <Lightbulb className="w-6 h-6 text-yellow-300 animate-pulse" /> */}
            <BookOpen className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Từ Vựng Hôm Nay</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/80 bg-white/20 px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date().toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Word Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center gap-2">
                {wordData.word}
                {/* <Sparkles className="w-6 h-6 text-yellow-300" /> */}
              </h2>
              {wordData.pronunciation && (
                <p className="text-blue-100 text-sm font-medium">
                  {wordData.pronunciation}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <button
              onClick={playPronunciation}
              disabled={!wordData.audioUrl || isPlayingAudio}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Volume2
                className={`w-4 h-4 ${isPlayingAudio ? 'animate-pulse' : ''}`}
              />
              {isPlayingAudio ? 'Đang phát...' : 'Phát âm'}
            </button>

            <button
              onClick={handleToggleSave}
              disabled={isSaving || isDeleting}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isWordSaved
                  ? 'bg-green-500/80 hover:bg-green-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isWordSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Đã lưu
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  Lưu từ
                </>
              )}
            </button>
          </div>
        </div>

        {/* Definition */}
        {firstDefinition && (
          <div className="mb-4">
            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium mb-2">
              {translatePartOfSpeech(firstDefinition.partOfSpeech)}
            </span>
            <p className="text-white/95 text-base leading-relaxed">
              {firstDefinition.definition}
            </p>
            {firstDefinition.example && (
              <div className="mt-3 bg-white/10 rounded-lg p-3 border-l-4 border-white/30">
                <p className="text-white/90 text-sm italic">
                  "{firstDefinition.example}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* View Details Button */}
        <button
          onClick={() =>
            navigate(`/dictionary?word=${encodeURIComponent(wordData.word)}`)
          }
          className="w-full bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
        >
          Xem chi tiết
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Stats */}
        {wordData.definitions.length > 1 && (
          <div className="mt-3 text-center">
            <span className="text-xs text-white/70">
              +{wordData.definitions.length - 1} nghĩa khác
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
