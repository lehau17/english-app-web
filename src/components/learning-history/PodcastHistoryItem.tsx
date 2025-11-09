import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  TrendingUp,
} from 'lucide-react'
import React from 'react'

export interface PodcastHistoryItemData {
  podcastId: string
  podcastTitle: string
  podcastCategory: string
  podcastDifficulty: string
  totalAttempts: number
  bestScore: number
  latestAttemptDate: string
  latestScore: number
  totalTimeSpent: number
}

interface PodcastHistoryItemProps {
  item: PodcastHistoryItemData
  onClick: () => void
}

export const PodcastHistoryItem: React.FC<PodcastHistoryItemProps> = ({
  item,
  onClick,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'vừa xong'
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    elementary: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    upper_intermediate: 'bg-orange-100 text-orange-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate mb-2">
                {item.podcastTitle}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {item.podcastCategory}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    difficultyColors[item.podcastDifficulty] ||
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.podcastDifficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Latest Score */}
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${getScoreBg(item.latestScore)}`}
            >
              <CheckCircle2
                size={16}
                className={getScoreColor(item.latestScore)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Lần gần nhất</p>
                <p
                  className={`text-sm font-bold ${getScoreColor(item.latestScore)}`}
                >
                  {item.latestScore.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Best Score */}
            <div
              className={`flex items-center gap-2 p-2 rounded-lg ${getScoreBg(item.bestScore)}`}
            >
              <TrendingUp size={16} className={getScoreColor(item.bestScore)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600">Điểm cao nhất</p>
                <p
                  className={`text-sm font-bold ${getScoreColor(item.bestScore)}`}
                >
                  {item.bestScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTime(item.totalTimeSpent)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} />
              {item.totalAttempts} lần làm
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(item.latestAttemptDate)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>
    </div>
  )
}
