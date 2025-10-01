import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Headphones,
  MessageCircle,
} from 'lucide-react'

// Simple time ago utility
function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'vừa xong'
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`

  return date.toLocaleDateString('vi-VN')
}

interface Activity {
  id: string
  type: 'lesson' | 'assignment' | 'podcast' | 'discussion' | 'achievement'
  title: string
  description: string
  timestamp: Date
  metadata?: {
    score?: number
    duration?: number
    course?: string
  }
}

interface RecentActivityCardProps {
  activities: Activity[]
}

const activityIcons = {
  lesson: BookOpen,
  assignment: FileText,
  podcast: Headphones,
  discussion: MessageCircle,
  achievement: CheckCircle,
}

const activityColors = {
  lesson: { icon: 'text-blue-600', bg: 'bg-blue-100' },
  assignment: { icon: 'text-green-600', bg: 'bg-green-100' },
  podcast: { icon: 'text-purple-600', bg: 'bg-purple-100' },
  discussion: { icon: 'text-orange-600', bg: 'bg-orange-100' },
  achievement: { icon: 'text-yellow-600', bg: 'bg-yellow-100' },
}

function BookOpen({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

export default function RecentActivityCard({
  activities,
}: RecentActivityCardProps) {
  const sortedActivities = [...activities]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10) // Show last 10 activities

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có hoạt động nào</p>
          <p className="text-sm text-gray-400 mt-1">
            Bắt đầu học một bài học để xem hoạt động của bạn
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {sortedActivities.map((activity) => {
          const Icon = activityIcons[activity.type]
          const colors = activityColors[activity.type]

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
            >
              <div className={`rounded-lg p-2 ${colors.bg} flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>

                    {/* Activity metadata */}
                    {activity.metadata && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {activity.metadata.course && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {activity.metadata.course}
                          </span>
                        )}
                        {activity.metadata.score && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {activity.metadata.score}%
                          </span>
                        )}
                        {activity.metadata.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.metadata.duration}m
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 ml-2 flex-shrink-0">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={activity.timestamp.toISOString()}>
                      {timeAgo(activity.timestamp)}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-gray-600 hover:text-gray-900 py-2">
            Xem thêm {activities.length - 10} hoạt động khác
          </button>
        </div>
      )}
    </div>
  )
}
