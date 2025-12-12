export type PodcastStatus = 'not_started' | 'in_progress' | 'completed'

export interface PodcastAttempt {
  attemptId: string
  attemptNo: number
  status: 'in_progress' | 'submitted' | 'abandoned'
  scorePercent: number
  correctCount: number
  totalQuestions: number
  timeSpent?: number
  createdAt: string
  answers: Record<string, string>
}

export interface PodcastStatusInfo {
  status: PodcastStatus
  latestAttempt?: PodcastAttempt
  bestScore?: number
  totalAttempts: number
}

/**
 * Determine podcast status based on user attempts
 */
export function getPodcastStatus(
  attempts: PodcastAttempt[]
): PodcastStatusInfo {
  if (!attempts || attempts.length === 0) {
    return {
      status: 'not_started',
      totalAttempts: 0,
    }
  }

  // Sort attempts by creation date (newest first)
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const latestAttempt = sortedAttempts[0]
  const completedAttempts = attempts.filter((a) => a.status === 'submitted')
  const inProgressAttempts = attempts.filter((a) => a.status === 'in_progress')

  // If there's an in-progress attempt, status is in_progress
  if (inProgressAttempts.length > 0) {
    return {
      status: 'in_progress',
      latestAttempt: inProgressAttempts[0],
      bestScore:
        completedAttempts.length > 0
          ? Math.max(...completedAttempts.map((a) => a.scorePercent))
          : undefined,
      totalAttempts: attempts.length,
    }
  }

  // If there are completed attempts, status is completed
  if (completedAttempts.length > 0) {
    return {
      status: 'completed',
      latestAttempt: completedAttempts[0],
      bestScore: Math.max(...completedAttempts.map((a) => a.scorePercent)),
      totalAttempts: attempts.length,
    }
  }

  // If only abandoned attempts, consider as not started
  return {
    status: 'not_started',
    latestAttempt: latestAttempt,
    totalAttempts: attempts.length,
  }
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: PodcastStatus): string {
  switch (status) {
    case 'not_started':
      return 'Chưa làm'
    case 'in_progress':
      return 'Đang làm'
    case 'completed':
      return 'Đã hoàn thành'
    default:
      return 'Chưa làm'
  }
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: PodcastStatus): string {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-700'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700'
    case 'completed':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Get button text based on status
 */
export function getButtonText(status: PodcastStatus): string {
  switch (status) {
    case 'not_started':
      return 'Bắt đầu nghe'
    case 'in_progress':
      return 'Tiếp tục'
    case 'completed':
      return 'Làm lại'
    default:
      return 'Bắt đầu nghe'
  }
}

/**
 * Get button color class based on status
 */
export function getButtonColorClass(status: PodcastStatus): string {
  switch (status) {
    case 'not_started':
      return 'bg-red-500 hover:bg-red-600'
    case 'in_progress':
      return 'bg-yellow-500 hover:bg-yellow-600'
    case 'completed':
      return 'bg-green-500 hover:bg-green-600'
    default:
      return 'bg-red-500 hover:bg-red-600'
  }
}
