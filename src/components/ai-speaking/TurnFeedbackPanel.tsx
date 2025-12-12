import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Mic,
  Volume2,
} from 'lucide-react'
import React, { useState } from 'react'
import {
  formatSuggestedPhrases,
  getCategoryIconName,
  getScoreColor,
  isValidEvaluation,
  isValidMetrics,
  type TurnEvaluation,
  type TurnMetrics,
} from '../../utils/ai-speaking-types'

// Icon mapping for category display
const ICON_MAP = {
  Mic: Mic,
  Volume2: Volume2,
  BookOpen: BookOpen,
  FileText: FileText,
  MessageSquare: MessageSquare,
}

interface TurnFeedbackPanelProps {
  evaluation?: Record<string, unknown> | null
  metrics?: Record<string, unknown> | null
  score?: number | null
}

export const TurnFeedbackPanel: React.FC<TurnFeedbackPanelProps> = ({
  evaluation,
  metrics,
  score,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Validate data
  const validEvaluation = isValidEvaluation(evaluation)
    ? (evaluation as TurnEvaluation)
    : null
  const validMetrics = isValidMetrics(metrics) ? (metrics as TurnMetrics) : null

  // Early return if no data to display
  if (!validEvaluation && !validMetrics && !score) {
    return null
  }

  const displayScore = validEvaluation?.score ?? score ?? 0
  const scoreColors = getScoreColor(displayScore)

  return (
    <div className="pr-2 mt-2">
      {/* Collapsed state - Score badge + Expand button */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${scoreColors.bg} ${scoreColors.text}`}
        >
          Điểm: {displayScore}/100
        </span>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Thu gọn phản hồi' : 'Xem phản hồi'}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Thu gọn</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>Xem phản hồi</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded state - Full feedback panel */}
      {isExpanded && (
        <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-in slide-in-from-top-2">
          {/* Feedback text */}
          {validEvaluation?.feedback && (
            <div className="rounded-md bg-blue-50 p-3">
              <h5 className="text-xs font-semibold text-blue-900 mb-1">
                Nhận xét chung
              </h5>
              <p className="text-sm text-blue-800 leading-relaxed">
                {validEvaluation.feedback}
              </p>
            </div>
          )}

          {/* Metrics scores - Row of badges */}
          {validMetrics && (
            <div className="flex flex-wrap gap-2">
              <ScoreBadge
                label="Độ trôi chảy"
                score={validMetrics.fluencyScore}
              />
              <ScoreBadge
                label="Độ chính xác"
                score={validMetrics.accuracyScore}
              />
              <ScoreBadge
                label="Phát âm"
                score={validMetrics.pronunciationScore}
              />
            </div>
          )}

          {/* Category breakdown */}
          {validEvaluation?.categories &&
            validEvaluation.categories.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-700">
                  Chi tiết đánh giá
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  {validEvaluation.categories.map((category, index) => (
                    <CategoryCard
                      key={index}
                      name={category.name}
                      comment={category.comment}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Suggested phrases */}
          {validEvaluation?.detail?.suggestedPhrases &&
            validEvaluation.detail.suggestedPhrases.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-700">
                  Gợi ý cải thiện
                </h5>
                <ul className="space-y-1.5">
                  {formatSuggestedPhrases(
                    validEvaluation.detail.suggestedPhrases
                  ).map((phrase, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-600 font-bold mt-0.5">•</span>
                      <span className="italic">{phrase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  )
}

/**
 * Score badge component for metrics
 */
const ScoreBadge: React.FC<{ label: string; score: number }> = ({
  label,
  score,
}) => {
  const colors = getScoreColor(score)

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${colors.border} ${colors.bg}`}
    >
      <span className="text-xs font-medium text-gray-600">{label}:</span>
      <span className={`text-xs font-bold ${colors.text}`}>
        {Math.round(score)}
      </span>
    </div>
  )
}

/**
 * Category card component for detailed evaluation
 */
const CategoryCard: React.FC<{ name: string; comment: string }> = ({
  name,
  comment,
}) => {
  const iconName = getCategoryIconName(name)
  const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP]

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {IconComponent && (
          <IconComponent
            className="h-3.5 w-3.5 text-blue-600"
            aria-hidden="true"
          />
        )}
        <span className="text-xs font-semibold text-gray-800">{name}</span>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{comment}</p>
    </div>
  )
}
