import { Calendar, Clock, Eye, TrendingUp } from 'lucide-react'
import React from 'react'

export interface PodcastAttemptItemData {
  attemptId: string
  attemptNo: number
  status: 'in_progress' | 'submitted' | 'abandoned'
  scorePercent: number
  correctCount: number
  totalQuestions: number
  timeSpent?: number
  createdAt: string
  answers: Record<string, string>
}

interface PodcastAttemptItemProps {
  attempt: PodcastAttemptItemData
  isLatest?: boolean
  isBest?: boolean
  onViewDetail?: () => void
}

export const PodcastAttemptItem: React.FC<PodcastAttemptItemProps> = ({
  attempt,
  isLatest = false,
  isBest = false,
  onViewDetail,
}) => {
  const getStatusBadge = () => {
    if (attempt.status === 'in_progress') {
      return (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
          Đang làm
        </span>
      )
    }
    if (attempt.status === 'submitted') {
      return (
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          Hoàn thành
        </span>
      )
    }
    return (
      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
        Bỏ dở
      </span>
    )
  }

  const getScoreColor = () => {
    if (attempt.scorePercent >= 80) return 'text-green-600'
    if (attempt.scorePercent >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 phút'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return minutes > 0 ? `${minutes} phút ${secs} giây` : `${secs} giây`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
        isLatest
          ? 'border-blue-200 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">
            Lần {attempt.attemptNo}
          </h4>
          {isLatest && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              Mới nhất
            </span>
          )}
          {isBest && !isLatest && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={12} />
              Điểm cao nhất
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Score */}
      {attempt.status === 'submitted' && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Kết quả</span>
            <span className={`text-lg font-bold ${getScoreColor()}`}>
              {attempt.scorePercent.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {attempt.correctCount}/{attempt.totalQuestions} câu đúng
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <span>{formatDuration(attempt.timeSpent)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          <span>{formatDate(attempt.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      {attempt.status === 'submitted' && onViewDetail && (
        <button
          onClick={onViewDetail}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Eye size={16} />
          Xem chi tiết
        </button>
      )}
    </div>
  )
}
