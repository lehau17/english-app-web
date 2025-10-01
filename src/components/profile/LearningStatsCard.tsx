import { Award, BookOpen, Clock, Target, TrendingUp } from 'lucide-react'

interface LearningStats {
  completedLessons: number
  totalLessons: number
  studyStreak: number
  hoursThisWeek: number
  averageScore: number
  certificatesEarned: number
}

interface LearningStatsCardProps {
  stats: LearningStats
}

export default function LearningStatsCard({ stats }: LearningStatsCardProps) {
  const completionPercentage =
    Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0

  const statItems = [
    {
      icon: BookOpen,
      label: 'Bài học hoàn thành',
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      percentage: completionPercentage,
    },
    {
      icon: Target,
      label: 'Chuỗi học tập',
      value: `${stats.studyStreak} ngày`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: Clock,
      label: 'Giờ học tuần này',
      value: `${stats.hoursThisWeek}h`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: 'Điểm trung bình',
      value: `${stats.averageScore}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Award,
      label: 'Chứng chỉ đạt được',
      value: stats.certificatesEarned.toString(),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thống kê học tập</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>30 ngày qua</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition"
          >
            <div className={`rounded-lg p-2 ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate">{item.label}</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{item.value}</p>
                {item.percentage !== undefined && (
                  <div className="flex-1 max-w-20">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiến độ tổng thể
          </span>
          <span className="text-sm font-bold text-blue-600">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Bạn đã hoàn thành {stats.completedLessons} trên {stats.totalLessons}{' '}
          bài học
        </p>
      </div>
    </div>
  )
}
