import type { LeaderboardScope } from './leaderboardScope.type'

export interface LeaderboardEntry {
  userId: string
  displayName: string
  avatarUrl?: string | null
  totalScore: number
  rank: number
  metadata?: Record<string, unknown>
}

export interface LeaderboardApiResponse {
  success: boolean
  message?: string
  data: {
    scope: LeaderboardScope
    classroomId?: string
    year?: number
    month?: number | null
    from?: string | null
    to?: string | null
    entries: LeaderboardEntry[]
  }
}
