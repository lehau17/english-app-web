import { motion } from 'framer-motion'
import {
  Crown,
  Filter,
  Pause,
  Play,
  Search,
  SortAsc,
  Sparkles,
} from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePodcasts } from '../hooks/podcast.hooks'

const ListeningPracticePage: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSource, setFilterSource] = useState('all')
  const [filterDuration, setFilterDuration] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage] = useState(1)

  // Fetch podcasts data
  const {
    data: podcastsResponse,
    isLoading,
    error,
  } = usePodcasts({
    page: currentPage,
    limit: 12,
    category: filterCategory === 'all' ? undefined : filterCategory,
    search: searchQuery || undefined,
  })

  console.log('Podcasts Response:', podcastsResponse)

  const podcasts = podcastsResponse?.data || []

  const tabs = [
    { key: 'all', label: 'Tất cả', count: podcasts.length },
    { key: 'recommended', label: 'Bài bạn đáng', icon: Crown },
    { key: 'listening', label: 'Bài đang nghe' },
    { key: 'completed', label: 'Bài đã nghe' },
  ]

  const handlePlayPause = (id: number) => {
    setCurrentPlaying(currentPlaying === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Luyện Nghe
              </h1>
              <p className="text-gray-600">
                Nâng cao kỹ năng nghe tiếng Anh với các bài học chất lượng cao
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/listening-practice/create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={20} />
              Tạo Podcast
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all flex flex-row items-center
                  ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon && <tab.icon size={16} className="mr-2" />}
                {tab.label}
                {tab.count && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả thể loại</option>
              <option value="study">Du học</option>
              <option value="business">Kinh doanh</option>
              <option value="tech">Công nghệ</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="wele">WELE Partners</option>
              <option value="ted">TED Talks</option>
              <option value="bbc">BBC</option>
            </select>

            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả độ dài</option>
              <option value="short">&lt; 10 phút</option>
              <option value="medium">10-20 phút</option>
              <option value="long">&gt; 20 phút</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Sắp xếp:
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
              <option value="duration">Thời lượng</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">Đang tải podcasts...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">
              Có lỗi xảy ra khi tải danh sách podcasts
            </p>
          </div>
        )}

        {/* Podcast Grid */}
        {!isLoading && !error && (
          <div className="grid gap-6">
            {podcasts.map((podcast: any, index: number) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:border-blue-300"
              >
                <div className="flex gap-6 items-center">
                  {/* Thumbnail with enhanced design */}
                  <div className="relative flex-shrink-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md">
                      {podcast.thumbnailUrl ? (
                        <img
                          src={podcast.thumbnailUrl}
                          alt={podcast.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-red-500 flex items-center justify-center">
                          <span className="text-white text-xs font-medium text-center px-2">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <motion.button
                          onClick={() => handlePlayPause(podcast.id)}
                          className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 shadow-md"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {currentPlaying === podcast.id ? (
                            <Pause size={24} />
                          ) : (
                            <Play size={24} className="ml-0.5" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Progress indicator - có thể sẽ có sau khi user nghe */}
                    {podcast.status === 'COMPLETED' && (
                      <div className="absolute -bottom-2 left-0 right-0">
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="absolute -top-6 -right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                          Hoàn thành
                        </div>
                      </div>
                    )}

                    {/* Duration badge */}
                    <div className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-lg px-2 py-1 text-xs font-medium">
                      {Math.floor(podcast.duration / 60)}:
                      {String(podcast.duration % 60).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-xl mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {podcast.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 mb-3">
                          <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                            {podcast.code}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {podcast.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        {new Date(podcast.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {podcast.description || 'Không có mô tả'}
                    </p>

                    {/* Tags */}
                    {podcast.tags && podcast.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {podcast.tags
                          .slice(0, 3)
                          .map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {podcast.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {podcast.status}
                        </span>
                      </div>

                      <motion.button
                        onClick={() =>
                          navigate(`/listening-practice/${podcast.id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Học ngay
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more button */}
        <div className="text-center mt-8">
          <motion.button
            className="bg-white border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Xem thêm bài học
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default ListeningPracticePage
