// Activity Explanation Modal - Phase 5 Student UX
import React from 'react'

interface ActivityExplanationProps {
  activity: {
    title: string
    type: string
  }
  explanation: {
    reason: string
    skillTargets: string[]
    difficulty: number
    estimatedTime: number
  }
  onClose: () => void
}

export const ActivityExplanation: React.FC<ActivityExplanationProps> = ({
  activity,
  explanation,
  onClose,
}) => {
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.7) return 'Easy'
    if (difficulty < 1.3) return 'Medium'
    return 'Hard'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Why this activity?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {activity.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activity.type}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Reason
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {explanation.reason}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              Target Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {explanation.skillTargets.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Difficulty
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getDifficultyLabel(explanation.difficulty)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Estimated Time
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {explanation.estimatedTime} min
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

export default ActivityExplanation
