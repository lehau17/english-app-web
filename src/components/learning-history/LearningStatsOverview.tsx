import { Award, BookOpen, Clock, TrendingUp } from 'lucide-react'
import React from 'react'

interface LearningStatsOverviewProps {
  totalAttempts: number
  totalPodcasts: number
  averageScore: number
  totalTimeMinutes: number
}

export const LearningStatsOverview: React.FC<LearningStatsOverviewProps> = ({
  totalAttempts,
  totalPodcasts,
  averageScore,
  totalTimeMinutes,
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getScoreColor = () => {
    if (averageScore >= 80) return 'text-green-600'
    if (averageScore >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Tổng số bài',
      value: totalPodcasts,
      color: 'bg-blue-100 text-blue-600',
      description: 'Podcasts đã làm',
    },
    {
      icon: TrendingUp,
      label: 'Số lần làm',
      value: totalAttempts,
      color: 'bg-purple-100 text-purple-600',
      description: 'Tổng attempts',
    },
    {
      icon: Award,
      label: 'Điểm trung bình',
      value: `${averageScore.toFixed(1)}%`,
      color: `${
        averageScore >= 80
          ? 'bg-green-100 text-green-600'
          : averageScore >= 60
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-red-100 text-red-600'
      }`,
      description: 'Hiệu suất học tập',
    },
    {
      icon: Clock,
      label: 'Thời gian học',
      value: formatTime(totalTimeMinutes),
      color: 'bg-orange-100 text-orange-600',
      description: 'Tổng thời gian',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p
                className={`text-3xl font-bold ${
                  stat.label === 'Điểm trung bình'
                    ? getScoreColor()
                    : 'text-gray-900'
                }`}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
