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
  const [sortBy, setSortBy] = useState('newest')
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
    tab:
      activeTab === 'all'
        ? undefined
        : (activeTab as 'recommended' | 'listening' | 'completed'),
    source: filterSource === 'all' ? undefined : filterSource,
    duration:
      filterDuration === 'all'
        ? undefined
        : (filterDuration as 'short' | 'medium' | 'long'),
    sortBy: sortBy,
  })

  console.log('Podcasts Response:', podcastsResponse)

  const podcasts = podcastsResponse?.data || []
  const totalPodcasts = podcastsResponse?.total || 0

  const tabs = [
    {
      key: 'all',
      label: 'Tất cả',
      count: activeTab === 'all' ? totalPodcasts : undefined,
    },
    {
      key: 'recommended',
      label: 'Bài bạn đăng',
      icon: Crown,
      count: activeTab === 'recommended' ? totalPodcasts : undefined,
    },
    {
      key: 'listening',
      label: 'Bài đang nghe',
      count: activeTab === 'listening' ? totalPodcasts : undefined,
    },
    {
      key: 'completed',
      label: 'Bài đã nghe',
      count: activeTab === 'completed' ? totalPodcasts : undefined,
    },
  ]

  const handlePlayPause = (id: number) => {
    setCurrentPlaying(currentPlaying === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                Luyện Nghe
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Nâng cao kỹ năng nghe tiếng Anh với các bài học chất lượng cao
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/listening-practice/create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-all shadow-sm w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} />
              Tạo Podcast
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
          <div className="flex space-x-1 sm:space-x-2 bg-white p-1 rounded-lg border border-gray-200 w-max min-w-full sm:min-w-0">
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all flex flex-row items-center whitespace-nowrap
                  ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon && <tab.icon size={16} className="mr-1.5 sm:mr-2" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-1.5 sm:ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Bộ lọc:
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả thể loại</option>
                <option value="study">Du học</option>
                <option value="business">Kinh doanh</option>
                <option value="tech">Công nghệ</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả nguồn</option>
                <option value="wele">WELE Partners</option>
                <option value="ted">TED Talks</option>
                <option value="bbc">BBC</option>
              </select>

              <select
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả độ dài</option>
                <option value="short">&lt; 10 phút</option>
                <option value="medium">10-20 phút</option>
                <option value="long">&gt; 20 phút</option>
              </select>
            </div>
          </div>

          {/* Sort Section */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <SortAsc className="h-4 w-4 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Sắp xếp:
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 xs:flex-initial xs:min-w-[150px] px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="grid gap-4 sm:gap-6">
            {podcasts.map((podcast: any, index: number) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-300 hover:border-blue-300"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Thumbnail with enhanced design */}
                  <div className="relative flex-shrink-0 w-full sm:w-auto flex items-center justify-center">
                    <div className="w-full sm:w-32 aspect-square sm:h-32 rounded-lg overflow-hidden shadow-md">
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

                    {/* Progress indicator - based on userProgress */}
                    {podcast.userProgress &&
                      podcast.userProgress.length > 0 &&
                      podcast.userProgress[0].completionRate > 0 && (
                        <div className="absolute -bottom-2 left-0 right-0">
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                podcast.userProgress[0].isCompleted
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${podcast.userProgress[0].completionRate}%`,
                              }}
                            />
                          </div>
                          {podcast.userProgress[0].isCompleted && (
                            <div className="absolute -top-6 -right-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                              Hoàn thành
                            </div>
                          )}
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {podcast.title}
                        </h3>
                        <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                          <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full font-medium">
                            {podcast.code}
                          </span>
                          <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                            {podcast.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                        {new Date(podcast.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>

                    <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                      {podcast.description || 'Không có mô tả'}
                    </p>

                    {/* Tags */}
                    {podcast.tags && podcast.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {podcast.tags
                          .slice(0, 3)
                          .map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="bg-purple-100 text-purple-700 px-2 py-0.5 sm:py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
                      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                        <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                          {podcast.difficulty}
                        </span>
                        {podcast.userProgress &&
                        podcast.userProgress.length > 0 ? (
                          podcast.userProgress[0].isCompleted ? (
                            <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                              Hoàn thành
                            </span>
                          ) : podcast.userProgress[0].completionRate > 0 ? (
                            <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                              Đang học (
                              {Math.round(
                                podcast.userProgress[0].completionRate
                              )}
                              %)
                            </span>
                          ) : null
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            Chưa học
                          </span>
                        )}
                      </div>

                      <motion.button
                        onClick={() =>
                          navigate(`/listening-practice/${podcast.id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm"
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
        <div className="text-center mt-6 sm:mt-8">
          <motion.button
            className="bg-white border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
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
