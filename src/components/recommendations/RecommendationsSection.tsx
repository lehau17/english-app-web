import { Sparkles } from 'lucide-react'
import type { JSX } from 'react'
import {
  useDismissRecommendation,
  useMarkRecommendationAsClicked,
  useRecommendations,
} from '../../hooks/useRecommendations'
import RecommendationCard from './RecommendationCard'

interface RecommendationsSectionProps {
  limit?: number
  onAction?: (id: string, type: string) => void
}

export default function RecommendationsSection({
  limit = 5,
  onAction,
}: RecommendationsSectionProps): JSX.Element | null {
  const { data: recommendations, isLoading } = useRecommendations({
    dismissed: false,
  })

  const markAsClicked = useMarkRecommendationAsClicked()
  const dismiss = useDismissRecommendation()

  const handleAction = (id: string, type: string) => {
    markAsClicked.mutate(id)
    onAction?.(id, type)
  }

  const handleDismiss = (id: string) => {
    dismiss.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return null
  }

  const displayedRecommendations = recommendations.slice(0, limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Đề xuất cho bạn</h3>
      </div>

      <div className="space-y-3">
        {displayedRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onAction={handleAction}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {recommendations.length > limit && (
        <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Xem thêm {recommendations.length - limit} đề xuất
        </button>
      )}
    </div>
  )
}
