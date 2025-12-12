// Dynamic Activity Feed - Phase 5 Student UX
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLearningPathWebSocket } from '../../../hooks/useLearningPathWebSocket'

interface Activity {
  id: string
  title: string
  type: string
  difficulty: number
  estimatedTime: number
  status: 'pending' | 'in_progress' | 'completed'
  isAIGenerated?: boolean
}

interface DynamicActivityFeedProps {
  pathId: string
  onActivityClick?: (activity: Activity) => void
}

export const DynamicActivityFeed: React.FC<DynamicActivityFeedProps> = ({
  pathId,
  onActivityClick,
}) => {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['learning-path', pathId, 'activities'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return []
    },
  })

  useLearningPathWebSocket({
    pathId,
    enabled: true,
  })

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 0.7) return { label: 'Easy', color: 'text-green-600' }
    if (difficulty < 1.3) return { label: 'Medium', color: 'text-yellow-600' }
    return { label: 'Hard', color: 'text-red-600' }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Your Learning Path
      </h2>
      <div className="space-y-3">
        {activities?.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No activities yet. Start your learning journey!
          </p>
        )}
        {activities?.map((activity) => {
          const difficultyInfo = getDifficultyLabel(activity.difficulty)
          return (
            <div
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {activity.title}
                    {activity.isAIGenerated && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        AI Generated
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.type} • {activity.estimatedTime} min •{' '}
                    <span className={difficultyInfo.color}>
                      {difficultyInfo.label}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded text-sm capitalize ${getStatusStyles(
                      activity.status
                    )}`}
                  >
                    {activity.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DynamicActivityFeed
