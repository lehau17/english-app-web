import { Sparkles } from 'lucide-react'
import type { PodcastRecommendation } from '../../hooks/useAIPodcastRecommendations'

// Simple Badge component
const Badge = ({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary'
}) => {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variantStyles =
    variant === 'secondary'
      ? 'bg-gray-100 text-gray-800'
      : 'bg-blue-600 text-white'
  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </span>
  )
}

interface AIRecommendationCardProps {
  recommendation: PodcastRecommendation
  onClick?: () => void
}

export function AIRecommendationCard({
  recommendation,
  onClick,
}: AIRecommendationCardProps) {
  const { podcast, reason, matchScore, aiInsights } = recommendation

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100"
      onClick={onClick}
    >
      {/* AI Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge
          variant="default"
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium gap-1.5 shadow-lg"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI đề xuất
        </Badge>
      </div>

      {/* Match Score Badge */}
      <div className="absolute top-3 left-3 z-10">
        <Badge
          variant="secondary"
          className="bg-white/90 backdrop-blur-sm font-semibold"
        >
          {matchScore}% phù hợp
        </Badge>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {podcast.thumbnailUrl ? (
          <img
            src={podcast.thumbnailUrl}
            alt={podcast.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="h-16 w-16 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Category */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {podcast.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {podcast.category && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                {podcast.category}
              </span>
            )}
            {podcast.difficulty && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {podcast.difficulty}
              </span>
            )}
          </div>
        </div>

        {/* AI Reason */}
        <div className="mb-4 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <p className="text-sm text-gray-700 leading-relaxed">✨ {reason}</p>
        </div>

        {/* AI Insights */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600 min-w-[80px]">
              Độ khó:
            </span>
            <span>{aiInsights.difficultyMatch}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600 min-w-[80px]">
              Chủ đề:
            </span>
            <span>{aiInsights.topicRelevance}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-purple-600 min-w-[80px]">
              Mục tiêu:
            </span>
            <span>{aiInsights.learningGoalAlignment}</span>
          </div>
        </div>

        {/* Podcast Stats */}
        {(podcast.duration || podcast.averageRating) && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
            {podcast.duration && (
              <span>{Math.floor(podcast.duration / 60)} phút</span>
            )}
            {podcast.averageRating && (
              <span>⭐ {podcast.averageRating.toFixed(1)}</span>
            )}
            {podcast.totalRatings > 0 && (
              <span>({podcast.totalRatings} đánh giá)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
