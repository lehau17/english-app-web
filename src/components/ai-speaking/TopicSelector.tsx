import React from 'react'
import { useTopics, type Topic } from '../../hooks/useTopics'
import { DifficultyLevel } from '../../types/activity.types'

interface TopicSelectorProps {
  value: Topic | null
  onChange: (topic: Topic) => void
  difficulty?: DifficultyLevel
  className?: string
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  value,
  onChange,
  difficulty,
  className = '',
}) => {
  const { data: topics, isLoading } = useTopics({
    difficulty,
    isActive: true,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Choose a topic
        </label>
        <div className="text-sm text-gray-500">Loading topics...</div>
      </div>
    )
  }

  // Ensure topics is an array
  const topicsArray = Array.isArray(topics) ? topics : []

  if (topicsArray.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Choose a topic
        </label>
        <div className="text-sm text-gray-500">No topics available</div>
      </div>
    )
  }

  // Group topics by category
  const groupedTopics = topicsArray.reduce(
    (acc, topic) => {
      const category = topic.category || 'other'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(topic)
      return acc
    },
    {} as Record<string, Topic[]>
  )

  const categoryNames: Record<string, string> = {
    daily_life: 'Daily Life',
    travel: 'Travel',
    business: 'Work & Business',
    current_events: 'Current Events',
    personal: 'Personal Growth',
    other: 'Other',
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Choose a topic
      </label>

      {Object.entries(groupedTopics).map(([category, categoryTopics]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">
            {categoryNames[category] || category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categoryTopics.map((topic) => {
              const isSelected = value?.id === topic.id
              const isTrending =
                topic.isTrending ||
                (topic.usageCount >= 5 && topic.trendScore >= 120)

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onChange(topic)}
                  className={`
                    p-3 rounded-lg border text-left transition-all
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate">
                          {topic.name}
                        </span>
                        {topic.isFeatured && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                        {isTrending && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                            Trending
                          </span>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {topicsArray.length > 0 && !Object.keys(groupedTopics).length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topicsArray.map((topic) => {
            const isSelected = value?.id === topic.id
            const isTrending =
              topic.isTrending ||
              (topic.usageCount >= 5 && topic.trendScore >= 120)

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onChange(topic)}
                className={`
                  p-3 rounded-lg border text-left transition-all
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {topic.name}
                      </span>
                      {topic.isFeatured && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {isTrending && (
                        <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                          Trending
                        </span>
                      )}
                    </div>
                    {topic.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
