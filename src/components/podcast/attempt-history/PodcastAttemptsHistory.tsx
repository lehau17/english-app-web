import { ChevronDown, ChevronUp, History } from 'lucide-react'
import React, { useState } from 'react'
import { PodcastAttemptDetailModal } from './PodcastAttemptDetailModal'
import {
  PodcastAttemptItem,
  type PodcastAttemptItemData,
} from './PodcastAttemptItem'

interface PodcastAttemptsHistoryProps {
  attempts: PodcastAttemptItemData[]
  gaps: Array<{
    id: string
    orderNo: number
    answer: string
  }>
}

export const PodcastAttemptsHistory: React.FC<PodcastAttemptsHistoryProps> = ({
  attempts,
  gaps,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedAttempt, setSelectedAttempt] =
    useState<PodcastAttemptItemData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter only submitted attempts for history
  const completedAttempts = attempts.filter((a) => a.status === 'submitted')

  // Don't show if no completed attempts
  if (completedAttempts.length === 0) {
    return null
  }

  // Sort by date (newest first)
  const sortedAttempts = [...completedAttempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const latestAttempt = sortedAttempts[0]
  const bestScore = Math.max(...sortedAttempts.map((a) => a.scorePercent))
  const bestAttempt = sortedAttempts.find((a) => a.scorePercent === bestScore)

  const handleViewDetail = (attempt: PodcastAttemptItemData) => {
    setSelectedAttempt(attempt)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Lịch sử làm bài
              </h3>
              <p className="text-sm text-gray-600">
                {completedAttempts.length} lần đã hoàn thành
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 font-medium">
              {isExpanded ? 'Ẩn bớt' : 'Xem tất cả'}
            </span>
            {isExpanded ? (
              <ChevronUp size={20} className="text-blue-600" />
            ) : (
              <ChevronDown size={20} className="text-blue-600" />
            )}
          </div>
        </button>

        {/* Summary Stats */}
        {!isExpanded && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Tổng số lần</div>
              <div className="text-2xl font-bold text-gray-900">
                {completedAttempts.length}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Điểm cao nhất</div>
              <div className="text-2xl font-bold text-green-600">
                {bestScore.toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Trung bình</div>
              <div className="text-2xl font-bold text-blue-600">
                {(
                  sortedAttempts.reduce((sum, a) => sum + a.scorePercent, 0) /
                  sortedAttempts.length
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
        )}

        {/* Expanded List */}
        {isExpanded && (
          <div className="mt-6 space-y-3">
            {sortedAttempts.map((attempt) => (
              <PodcastAttemptItem
                key={attempt.attemptId}
                attempt={attempt}
                isLatest={attempt.attemptId === latestAttempt?.attemptId}
                isBest={attempt.attemptId === bestAttempt?.attemptId}
                onViewDetail={() => handleViewDetail(attempt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <PodcastAttemptDetailModal
        attempt={selectedAttempt}
        gaps={gaps}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAttempt(null)
        }}
      />
    </>
  )
}
