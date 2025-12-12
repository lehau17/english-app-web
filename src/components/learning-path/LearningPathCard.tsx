import { CheckCircle2, Edit, MoreVertical, Play, Trash2 } from 'lucide-react'
import type { JSX } from 'react'
import type { LearningPath } from '../../services/learning-path.api'

interface LearningPathCardProps {
  path: LearningPath
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSetActive?: (id: string) => void
}

export default function LearningPathCard({
  path,
  onView,
  onEdit,
  onDelete,
  onSetActive,
}: LearningPathCardProps): JSX.Element {
  const progress =
    path.courseIds.length > 0
      ? Math.round((path.currentStep / path.courseIds.length) * 100)
      : 0

  const statusBadge = path.isCompleted ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      <CheckCircle2 className="h-3 w-3" />
      Hoàn thành
    </span>
  ) : path.currentStep > 0 ? (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      Đang học
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      Chưa bắt đầu
    </span>
  )

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {path.name}
            </h3>
            {statusBadge}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">Mục tiêu:</span>
              <span className="capitalize">{path.targetLevel}</span>
            </div>
            {path.focusAreas && path.focusAreas.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">
                  Tập trung:
                </span>
                {path.focusAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
            {path.timeframe && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Thời gian:</span> {path.timeframe}{' '}
                ngày
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-gray-900">
                {path.currentStep}/{path.courseIds.length} khóa học
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{progress}% hoàn thành</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {!path.isCompleted && (
            <button
              onClick={() => onView?.(path.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
              <Play className="h-4 w-4" />
              Tiếp tục
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit?.(path.id)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(path.id)}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              title="Xóa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onSetActive?.(path.id)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50"
              title="Đặt làm lộ trình chính"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
