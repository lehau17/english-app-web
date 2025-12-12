import { BookOpen, ChevronRight } from 'lucide-react'
import type { JSX } from 'react'
import type { LearningPath } from '../../services/learning-path.api'

interface ParentLearningPathCardProps {
  childName: string
  learningPath: LearningPath | null
  onView?: (pathId: string) => void
}

export default function ParentLearningPathCard({
  childName,
  learningPath,
  onView,
}: ParentLearningPathCardProps): JSX.Element {
  if (!learningPath) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{childName}</p>
            <p className="mt-1 text-sm text-gray-500">Chưa có lộ trình học</p>
          </div>
        </div>
      </div>
    )
  }

  const progress =
    learningPath.courseIds.length > 0
      ? Math.round(
          (learningPath.currentStep / learningPath.courseIds.length) * 100
        )
      : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-medium text-gray-600">{childName}</p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                learningPath.isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {learningPath.isCompleted ? 'Hoàn thành' : 'Đang học'}
            </span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-2">
            {learningPath.name}
          </h3>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">Mục tiêu:</span>
              <span className="capitalize">{learningPath.targetLevel}</span>
            </div>
            {learningPath.focusAreas && learningPath.focusAreas.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-600">
                  Tập trung:
                </span>
                {learningPath.focusAreas.slice(0, 3).map((area, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-gray-900">
                {learningPath.currentStep}/{learningPath.courseIds.length} khóa
                học
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

        {onView && (
          <button
            onClick={() => onView(learningPath.id)}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            Xem chi tiết
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
