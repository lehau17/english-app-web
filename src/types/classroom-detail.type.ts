import type { AssignmentType } from './assignment.type'

export interface ClassroomDetailResponse {
  id: string
  name: string
  description: string
  classCode: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  teacher: {
    id: string
    email: string
    phone: string
    passwordHash: string
    role: string
    status: string
    provider: string
    providerId: string | null
    firstName: string
    lastName: string
    displayName: string | null
    gender: string
    dob: string | null
    nationality: string | null
    nativeLanguage: string | null
    avatarUrl: string | null
    bio: string | null
    language: string
    timezone: string
    lastLoginAt: string | null
    lastActiveAt: string | null
    emailVerified: boolean
    phoneVerified: boolean
    twoFactorEnabled: boolean
    preferences: any
    privacySettings: any
    notificationSettings: any
    parentalConsent: any
    profileCompleteness: number
    isOnline: boolean
    createdAt: string
    updatedAt: string
  }
  isActive: boolean
  maxStudents: number
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  settings: Record<string, any>
  _count: {
    students: number
    assignments: number
    announcements: number
  }
  students: Array<{
    id: string
    firstName: string
    lastName: string
    displayName: string | null
    avatarUrl: string | null
    studentRecord: {
      joinedAt: string
      isActive: boolean
      notes: string | null
    }
  }>
  assignments: Array<{
    id: string
    title: string
    description?: string | null
    instructions?: string | null
    startTime?: string | null // Thời gian bắt đầu làm bài
    dueDate?: string | null
    status: string
    isPublished: boolean
    totalPoints: number
    timeLimit?: number | null
    type: AssignmentType
    maxAttempts: number
    createdAt: string
    _count: {
      submissions: number
    }
    submission?: {
      id: string
      score: number | null
      status: 'submitted' | 'graded' | 'late' | 'missing'
      attempt: number
      submittedAt: string | null
    } | null
    activities: Array<{
      id: string
      type: string
      title: string
      instructions?: string | null
      content: any
      points: number
      timeLimit?: number | null
      maxAttempts?: number | null
      passingScore?: number | null
      difficulty?: string | null
      hints?: string[]
      createdAt: string
      updatedAt: string
    }>
  }>
  announcements: ClassroomAnnouncement[]
  lessons: Array<{
    id: string
    title: string
    orderNo: number
    estimatedTime: number
    difficulty: string
    isLocked: boolean
    activities: Array<{
      id: string
      lessonId: string
      orderNo: number
      type: string
      title: string
      duration: number | null
      passingScore: number | null
    }>
  }>
  course?: {
    id: string
    title: string
    description: string | null
    price: number | null
    currency: string | null
    difficulty: string
    estimatedHours: number | null
    imageUrl: string | null
    tags: string[]
    isPublished: boolean
    language: string
  } | null
}

export interface ClassroomAnnouncement {
  id: string
  title: string
  content: string
  priority: string
  targetAll: boolean
  targetIds: string[]
  attachments?: any
  createdAt: string
  updatedAt: string
}
