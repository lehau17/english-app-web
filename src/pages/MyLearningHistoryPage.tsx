import { ArrowLeft, Calendar, Filter, History } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LearningStatsOverview,
  PodcastHistoryItem,
  type PodcastHistoryItemData,
} from '../components/learning-history'
import { useAllUserAttempts } from '../hooks/podcastAttempt.hooks'

type PeriodFilter = 'all' | 'week' | 'month' | 'year'

const MyLearningHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')

  // Fetch all user attempts
  const { data: attemptsResponse, isLoading } = useAllUserAttempts({
    status: 'completed',
    limit: 100,
  })

  // Group attempts by podcast
  const podcastHistory = useMemo((): PodcastHistoryItemData[] => {
    // Handle nested data structure: response.data.data contains the array
    const attemptsData = attemptsResponse?.data?.data
    if (!attemptsData || !Array.isArray(attemptsData)) return []

    const grouped = new Map<
      string,
      {
        podcast: any
        attempts: any[]
      }
    >()

    // Group by podcast
    attemptsData.forEach((attempt: any) => {
      const podcastId = attempt.podcastId
      if (!grouped.has(podcastId)) {
        grouped.set(podcastId, {
          podcast: attempt.podcast,
          attempts: [],
        })
      }
      grouped.get(podcastId)!.attempts.push(attempt)
    })

    // Transform to PodcastHistoryItemData
    const history: PodcastHistoryItemData[] = Array.from(grouped.values()).map(
      ({ podcast, attempts }) => {
        const sortedAttempts = attempts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return {
          podcastId: podcast.id,
          podcastTitle: podcast.title,
          podcastCategory: podcast.category,
          podcastDifficulty: podcast.difficulty,
          totalAttempts: attempts.length,
          bestScore: Math.max(...attempts.map((a) => a.scorePercent)),
          latestAttemptDate: sortedAttempts[0].createdAt,
          latestScore: sortedAttempts[0].scorePercent,
          totalTimeSpent: attempts.reduce(
            (sum, a) => sum + (a.timeSpent || 0),
            0
          ),
        }
      }
    )

    // Sort by latest attempt date (most recent first)
    return history.sort(
      (a, b) =>
        new Date(b.latestAttemptDate).getTime() -
        new Date(a.latestAttemptDate).getTime()
    )
  }, [attemptsResponse])

  // Filter by period
  const filteredHistory = useMemo(() => {
    if (periodFilter === 'all') return podcastHistory

    const now = new Date()
    const filterDate = new Date()

    switch (periodFilter) {
      case 'week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return podcastHistory.filter(
      (item) => new Date(item.latestAttemptDate) >= filterDate
    )
  }, [podcastHistory, periodFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const totalAttempts = podcastHistory.reduce(
      (sum, item) => sum + item.totalAttempts,
      0
    )
    const totalPodcasts = podcastHistory.length
    const averageScore =
      totalPodcasts > 0
        ? podcastHistory.reduce((sum, item) => sum + item.bestScore, 0) /
          totalPodcasts
        : 0
    const totalTimeMinutes = Math.floor(
      podcastHistory.reduce((sum, item) => sum + item.totalTimeSpent, 0) / 60
    )

    return {
      totalAttempts,
      totalPodcasts,
      averageScore,
      totalTimeMinutes,
    }
  }, [podcastHistory])

  const periodOptions: Array<{ value: PeriodFilter; label: string }> = [
    { value: 'all', label: 'Tất cả' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'year', label: 'Năm này' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử học tập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <History size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Lịch sử học tập</h1>
              <p className="text-white/90 mt-1">
                Xem lại toàn bộ quá trình học Podcast của bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="mb-8">
          <LearningStatsOverview {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Lọc theo:
              </span>
            </div>
            <div className="flex items-center gap-2">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriodFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    periodFilter === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có lịch sử học tập
              </h3>
              <p className="text-gray-600 mb-6">
                {periodFilter === 'all'
                  ? 'Bạn chưa hoàn thành podcast nào.'
                  : 'Không có hoạt động nào trong khoảng thời gian này.'}
              </p>
              <button
                onClick={() => navigate('/listening-practice')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Bắt đầu học ngay
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredHistory.length} podcast đã học
                </h2>
                <span className="text-sm text-gray-600">
                  {periodFilter !== 'all' &&
                    `Hiển thị ${periodOptions.find((o) => o.value === periodFilter)?.label.toLowerCase()}`}
                </span>
              </div>

              {filteredHistory.map((item) => (
                <PodcastHistoryItem
                  key={item.podcastId}
                  item={item}
                  onClick={() =>
                    navigate(`/listening-practice/${item.podcastId}`)
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyLearningHistoryPage
