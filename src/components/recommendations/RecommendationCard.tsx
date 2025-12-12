import { BookOpen, FileText, Headphones, PlayCircle, X } from 'lucide-react'
import type { JSX } from 'react'
import type { Recommendation } from '../../services/recommendation.api'

interface RecommendationCardProps {
  recommendation: Recommendation
  onAction?: (id: string, type: string) => void
  onDismiss?: (id: string) => void
}

const TYPE_ICONS: Record<string, JSX.Element> = {
  course: <BookOpen className="h-5 w-5" />,
  lesson: <FileText className="h-5 w-5" />,
  activity: <PlayCircle className="h-5 w-5" />,
  podcast: <Headphones className="h-5 w-5" />,
  vocabulary: <BookOpen className="h-5 w-5" />,
}

const TYPE_LABELS: Record<string, string> = {
  course: 'Khóa học',
  lesson: 'Bài học',
  activity: 'Hoạt động',
  podcast: 'Podcast',
  vocabulary: 'Từ vựng',
}

export default function RecommendationCard({
  recommendation,
  onAction,
  onDismiss,
}: RecommendationCardProps): JSX.Element {
  const confidenceColor =
    recommendation.confidence >= 80
      ? 'text-green-600 bg-green-50'
      : recommendation.confidence >= 60
        ? 'text-blue-600 bg-blue-50'
        : 'text-gray-600 bg-gray-50'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`rounded-lg p-2 ${confidenceColor}`}>
            {TYPE_ICONS[recommendation.type] || (
              <BookOpen className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase">
                {TYPE_LABELS[recommendation.type] || recommendation.type}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${confidenceColor}`}
              >
                {recommendation.confidence}% phù hợp
              </span>
            </div>

            {recommendation.reasoning && (
              <p className="text-sm text-gray-700 line-clamp-2">
                {recommendation.reasoning}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() =>
                  onAction?.(recommendation.id, recommendation.type)
                }
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <PlayCircle className="h-3 w-3" />
                Xem ngay
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDismiss?.(recommendation.id)}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition shrink-0"
          title="Bỏ qua"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
