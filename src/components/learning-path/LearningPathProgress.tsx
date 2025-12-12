import type { JSX } from 'react'
import type { LearningPath } from '../../services/learning-path.api'

interface LearningPathProgressProps {
  path: LearningPath
  showDetails?: boolean
}

export default function LearningPathProgress({
  path,
  showDetails = false,
}: LearningPathProgressProps): JSX.Element {
  const progress =
    path.courseIds.length > 0
      ? Math.round((path.currentStep / path.courseIds.length) * 100)
      : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Tiến độ lộ trình
        </span>
        <span className="text-sm font-semibold text-gray-900">{progress}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            Bước {path.currentStep + 1} / {path.courseIds.length}
          </span>
          <span>
            {path.courseIds.length - path.currentStep} khóa học còn lại
          </span>
        </div>
      )}

      {/* Step indicators */}
      {showDetails && path.courseIds.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          {path.courseIds.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full ${
                idx < path.currentStep
                  ? 'bg-green-500'
                  : idx === path.currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
