import type { ActivityType } from './learn.type'

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  QUIZ = 'QUIZ',
  MIDTERM_EXAM = 'MIDTERM_EXAM',
  FINAL_EXAM = 'FINAL_EXAM',
}

export interface Assignment {
  id: string
  title: string
  description?: string | null
  instructions?: string | null
  startTime?: string | null // Thời gian bắt đầu làm bài (ISO)
  dueDate?: string | null // ISO
  status?: string
  isPublished: boolean
  totalPoints: number
  timeLimit?: number | null // minutes
  maxAttempts: number
  createdAt: string // ISO
  type: AssignmentType // NEW
  weight?: number | null // NEW - weight for final grade calculation
  _count: { submissions: number }
  activities?: any[]
  submission?: {
    id: string
    score: number | null
    status: 'submitted' | 'graded' | 'late' | 'missing'
    attempt: number
    submittedAt: string | null
  } | null
}

export interface AssignmentCreateActivity {
  type: ActivityType
  title: string
  instructions?: string
  points: number
  passingScore?: number
  difficulty?: string
  hints?: string[]
  content: any
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
  startTime?: string // ISO
  type?: AssignmentType // NEW
  weight?: number // NEW - weight for final grade calculation
}
