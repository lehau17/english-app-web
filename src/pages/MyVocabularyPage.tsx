import {
  BookOpen,
  BookmarkCheck,
  Calendar,
  ChevronRight,
  Search,
  Trash2,
  Sparkles,
  Target,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteWord, useSavedWords } from '../hooks/useVocabulary'

export default function MyVocabularyPage() {
  const navigate = useNavigate()
  const { data: savedWords = [], isLoading, error } = useSavedWords()
  const { mutate: deleteWord, isPending: isDeleting } = useDeleteWord()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>(
    'newest'
  )

  // Filter and sort words
  const filteredWords = savedWords
    .filter((word) =>
      word.word.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'alphabetical':
          return a.word.localeCompare(b.word)
        default:
          return 0
      }
    })

  const handleDeleteWord = (word: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent navigation when clicking delete
    if (confirm(`Bạn có chắc muốn xóa từ "${word}" khỏi danh sách?`)) {
      deleteWord(word)
    }
  }

  const handleWordClick = (word: string) => {
    navigate(`/dictionary?word=${encodeURIComponent(word)}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">
              Không thể tải danh sách từ vựng
            </p>
            <p className="text-red-500 text-sm mt-2">Vui lòng thử lại sau</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Từ Vựng Của Tôi
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {savedWords.length} từ đã lưu
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'newest' | 'oldest' | 'alphabetical'
                )
              }
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="alphabetical">A → Z</option>
            </select>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-green-600" />
              <span>
                {filteredWords.length} từ{' '}
                {searchQuery && `(lọc từ ${savedWords.length})`}
              </span>
            </div>
          </div>
        </div>

        {/* Words List */}
        {filteredWords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery
                ? 'Không tìm thấy từ nào phù hợp'
                : 'Bạn chưa lưu từ vựng nào'}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Hãy bắt đầu lưu từ vựng từ trang Từ điển hoặc Từ vựng hôm nay!'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/dictionary')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                Đi tới Từ điển
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((savedWord) => (
              <div
                key={savedWord.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 cursor-pointer group"
                onClick={() => handleWordClick(savedWord.word)}
              >
                {/* Word Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {savedWord.word}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(savedWord.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWordClick(savedWord.word)
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors group/play"
                      title="Tra cứu"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover/play:text-blue-600" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWord(savedWord.word, e)}
                      disabled={isDeleting}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group/delete"
                      title="Xóa từ"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <BookmarkCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Đã lưu</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {savedWords.length > 0 && (
          <div className="mt-8 space-y-4">
            {/* Review Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Flashcard */}
              <button
                onClick={() => navigate('/my-vocabulary/flashcard')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold mb-2">Flashcard</h3>
                <p className="text-blue-100 text-sm">
                  Lật thẻ học từ, đánh dấu từ đã nhớ và chưa nhớ
                </p>
              </button>

              {/* Quiz */}
              <button
                onClick={() => navigate('/my-vocabulary/quiz')}
                className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quiz</h3>
                <p className="text-purple-100 text-sm">
                  Trắc nghiệm ghép nghĩa, kiểm tra kiến thức
                </p>
              </button>
            </div>

            {/* Add More Words CTA */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Học từ vựng hiệu quả hơn!
                  </h3>
                  <p className="text-white/90 text-sm">
                    Ôn tập thường xuyên để ghi nhớ lâu hơn
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dictionary')}
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <BookOpen className="w-5 h-5" />
                  Tra từ mới
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
