import { Calendar, Lightbulb, Target, TrendingUp } from 'lucide-react'
import React from 'react'
import type { ReviewStats } from '../../../types/vocabulary.type'

interface ReviewStatsSummaryProps {
  stats?: ReviewStats
  sessionMeta?: {
    totalDue: number
    newCount: number
    reviewCount: number
  }
}

const formatNonNegative = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0
  }
  return Math.max(0, value)
}

const StatCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: string | number
  accentClassName: string
}> = ({ icon, label, value, accentClassName }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${accentClassName}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
)

export const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({
  stats,
  sessionMeta,
}) => {
  const streak = formatNonNegative(stats?.currentStreak)
  const mastered = formatNonNegative(stats?.masteredCount)
  const totalDue = formatNonNegative(sessionMeta?.totalDue ?? stats?.dueToday)
  const newCount = formatNonNegative(sessionMeta?.newCount ?? stats?.newCount)
  const reviewCount = formatNonNegative(
    sessionMeta?.reviewCount ?? stats?.reviewCount
  )
  const totalTerms = formatNonNegative(stats?.totalTerms)

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
      <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm sm:text-base text-blue-600 font-semibold uppercase tracking-wide">
              Daily Review
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tiếp tục hành trình chinh phục từ vựng của bạn
            </h1>
            {stats?.lastStudiedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Lần học gần nhất:{' '}
                {new Date(stats.lastStudiedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-medium">
                Streak hiện tại
              </p>
              <p className="text-2xl font-bold text-blue-600">{streak} ngày</p>
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-gray-500 uppercase font-medium">
                Thành thạo
              </p>
              <p className="text-2xl font-bold text-green-600">{mastered}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            label="Thẻ đến hạn hôm nay"
            value={totalDue}
            accentClassName="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<Lightbulb className="h-5 w-5 text-yellow-600" />}
            label="Từ mới trong phiên"
            value={newCount}
            accentClassName="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            icon={<Target className="h-5 w-5 text-purple-600" />}
            label="Đang ôn tập"
            value={reviewCount}
            accentClassName="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={<Calendar className="h-5 w-5 text-green-600" />}
            label="Tổng số đã học"
            value={totalTerms}
            accentClassName="bg-green-100 text-green-600"
          />
        </div>
      </div>
    </section>
  )
}
