import {
  BookOpen,
  Clock,
  Lightbulb,
  Link as LinkIcon,
  Search,
  Volume2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  useDictionaryLookup,
  useDictionaryRhymes,
  useDictionarySuggestions,
  useRecentSearches,
} from '../hooks/useDictionary'
import type { WordDefinition } from '../services/dictionary.api'

export default function DictionaryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWord, setSelectedWord] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const {
    data: wordData,
    isLoading,
    error,
  } = useDictionaryLookup(selectedWord, !!selectedWord)
  const { data: suggestions } = useDictionarySuggestions(
    searchQuery,
    isSearching
  )
  const { data: recentSearches } = useRecentSearches()
  const { data: rhymes } = useDictionaryRhymes(selectedWord)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only search if 3+ characters to reduce API calls
      setIsSearching(searchQuery.length >= 3)
    }, 500) // Increased debounce to 500ms
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (word: string) => {
    setSelectedWord(word)
    setSearchQuery(word)
    setIsSearching(false)
  }

  const playPronunciation = () => {
    if (wordData?.audioUrl) {
      const audio = new Audio(wordData.audioUrl)
      audio.play().catch((err) => console.error('Audio playback failed:', err))
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

  const getPartOfSpeechColor = (pos: string): string => {
    const colors: Record<string, string> = {
      noun: 'bg-blue-100 text-blue-800 border-blue-300',
      verb: 'bg-green-100 text-green-800 border-green-300',
      adjective: 'bg-purple-100 text-purple-800 border-purple-300',
      adverb: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pronoun: 'bg-pink-100 text-pink-800 border-pink-300',
      preposition: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      conjunction: 'bg-orange-100 text-orange-800 border-orange-300',
      interjection: 'bg-red-100 text-red-800 border-red-300',
    }
    return (
      colors[pos.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300'
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Từ Điển Tiếng Anh
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Tra cứu nghĩa, phát âm và nhiều hơn nữa
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Tìm kiếm từ vựng tiếng Anh..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all
                shadow-sm hover:shadow-md"
            />
          </div>

          {/* Autocomplete Suggestions */}
          {isSearching && suggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((word) => (
                <button
                  key={word}
                  onClick={() => handleSearch(word)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 font-medium">
                  Không tìm thấy từ hoặc có lỗi xảy ra
                </p>
                <p className="text-red-500 text-sm mt-2">{error.message}</p>
              </div>
            )}

            {wordData && (
              <div className="space-y-6">
                {/* Word Header */}
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-4xl font-bold text-gray-900">
                      {wordData.word}
                    </h2>
                    {wordData.audioUrl && (
                      <button
                        onClick={playPronunciation}
                        className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors shadow-md hover:shadow-lg"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  {wordData.pronunciation && (
                    <p className="text-gray-600 text-lg mb-2">
                      /{wordData.pronunciation}/
                    </p>
                  )}

                  {wordData.syllables && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Âm tiết:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                        {wordData.syllables.list.join(' · ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Definitions */}
                {wordData.definitions.map(
                  (def: WordDefinition, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getPartOfSpeechColor(def.partOfSpeech)}`}
                        >
                          {translatePartOfSpeech(def.partOfSpeech)}
                        </span>
                      </div>

                      <p className="text-gray-800 text-lg mb-4">
                        {def.definition}
                      </p>

                      {def.example && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                          <p className="text-gray-700 italic">
                            "{def.example}"
                          </p>
                        </div>
                      )}

                      {def.synonyms && def.synonyms.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Từ đồng nghĩa:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {def.synonyms.map((syn) => (
                              <button
                                key={syn}
                                onClick={() => handleSearch(syn)}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors"
                              >
                                {syn}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {def.antonyms && def.antonyms.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Từ trái nghĩa:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {def.antonyms.map((ant) => (
                              <button
                                key={ant}
                                onClick={() => handleSearch(ant)}
                                className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm hover:bg-red-100 transition-colors"
                              >
                                {ant}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {!selectedWord && !isLoading && (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Tìm kiếm một từ để bắt đầu
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches && recentSearches.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    Tìm kiếm gần đây
                  </h3>
                </div>
                <div className="space-y-2">
                  {recentSearches.slice(0, 10).map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSearch(word)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rhymes */}
            {rhymes && rhymes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">Từ vần điệu</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rhymes.slice(0, 15).map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSearch(word)}
                      className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm hover:bg-yellow-100 transition-colors"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-md p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Mẹo sử dụng</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Nhấn biểu tượng loa để nghe phát âm</li>
                <li>• Nhấn vào từ đồng nghĩa để khám phá thêm</li>
                <li>• Nhấn Enter để tìm kiếm nhanh</li>
                <li>• Lịch sử tìm kiếm được lưu tự động</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
