/**
 * Type definitions for AI Speaking evaluation and metrics data
 */

export interface EvaluationCategory {
  name: string
  comment: string
}

export interface EvaluationDetail {
  duration: number
  suggestedPhrases: string[]
}

export interface TurnEvaluation {
  score: number
  detail: EvaluationDetail
  feedback: string
  categories: EvaluationCategory[]
  transcript: string
}

export interface WordMetric {
  word: string
  start: number
  end: number
  conf: number // confidence score
}

export interface TurnMetrics {
  words: WordMetric[]
  durationSec: number
  finalizedAt: string
  fluencyScore: number
  accuracyScore: number
  evaluationScore: number
  finalConfidence: number
  pronunciationScore: number
  evaluationCreatedAt: string
}

/**
 * Type guard to check if evaluation data is valid
 */
export function isValidEvaluation(data: unknown): data is TurnEvaluation {
  if (!data || typeof data !== 'object') return false

  const evaluation = data as Record<string, unknown>

  return (
    typeof evaluation.score === 'number' &&
    typeof evaluation.feedback === 'string' &&
    Array.isArray(evaluation.categories) &&
    evaluation.categories.every(
      (cat: unknown) =>
        typeof cat === 'object' &&
        cat !== null &&
        'name' in cat &&
        'comment' in cat
    )
  )
}

/**
 * Type guard to check if metrics data is valid
 */
export function isValidMetrics(data: unknown): data is TurnMetrics {
  if (!data || typeof data !== 'object') return false

  const metrics = data as Record<string, unknown>

  return (
    typeof metrics.fluencyScore === 'number' &&
    typeof metrics.accuracyScore === 'number' &&
    typeof metrics.pronunciationScore === 'number'
  )
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): {
  bg: string
  text: string
  border: string
} {
  if (score >= 80) {
    return {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    }
  } else if (score >= 60) {
    return {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    }
  } else {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    }
  }
}

/**
 * Get category icon class for lucide-react based on category name
 * Returns icon name for use with lucide-react library
 */
export function getCategoryIconName(categoryName: string): string {
  const name = categoryName.toLowerCase()

  if (name.includes('fluency')) return 'Mic'
  if (name.includes('pronunciation')) return 'Volume2'
  if (name.includes('vocabulary')) return 'BookOpen'
  if (name.includes('grammar')) return 'FileText'

  return 'MessageSquare'
}

/**
 * Format suggested phrases for display
 */
export function formatSuggestedPhrases(phrases: string[]): string[] {
  return phrases.filter((phrase) => phrase && phrase.trim().length > 0)
}
