import type { ActivityType } from './learn.type'

export interface AssignmentCreateActivity {
  type: ActivityType
  title: string
  instructions?: string
  points: number
  timeLimit?: number
  maxAttempts?: number
  passingScore?: number
  difficulty?: string
  hints?: string[]
  content: any // should follow { kind: ActivityType; data: ... }
}

export interface AssignmentCreateRequest {
  title: string
  description?: string
  instructions?: string
  dueDate?: string // ISO
  isPublished?: boolean
  totalPoints?: number
  timeLimit?: number
  maxAttempts?: number
  activities: AssignmentCreateActivity[]
}
