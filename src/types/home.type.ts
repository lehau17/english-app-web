import type { ClassroomStatus } from '../hooks/useClassroomStatus'

export interface Classroom {
  id: string
  name: string
  teacherName: string
  students: number
  maxStudents: number
  assignments: number
}

export interface MyClassroomResponse {
  id: string
  courseId: string
  teacherId: string
  name: string
  description: string
  classCode: string
  isActive: boolean
  maxStudents: number
  status: ClassroomStatus
  periodStart: string
  periodEnd: string
  timezone: string
  plannedHours: number
  plannedSessions: number
  settings: any
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  students: Array<{
    studentId: string
    isPurchased: boolean
    isActive: boolean
    joinedAt: string
    student: {
      id: string
      firstName: string
      lastName: string
      displayName: string | null
      avatarUrl: string | null
    }
  }>
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
    displayName: string
    gender: string | null
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
  course: {
    id: string
    title: string
    price: number
    currency: string
  }
  _count: {
    students: number
    assignments: number
  }
}

export interface NextLesson {
  id: string
  courseId?: string
  title: string
  description: string
  orderNo?: number
  difficulty?: string
  estimatedTime?: number
  isLocked?: boolean
  objectives?: string[]
  createdAt?: string
  updatedAt?: string
  activities?: any[]
  activity?: {
    id: string
    lessonId: string
    type: string
    orderNo: number
    title: string
    content: any
    timeLimit?: number
    maxAttempts?: number
    passingScore?: number
    difficulty?: string
    points?: number
    progress?: {
      state: string
      score?: number
      bestScore?: number
      attemptsCount?: number
      updatedAt?: string
    }
  }
}

export interface DailyQuest {
  id: string
  text: string
  done: boolean
}

export interface LeaderboardItem {
  id: string | number
  name: string
  xp: number
}

export interface StudentDashboard {
  dailyQuests: DailyQuest[]
  leaderboard: LeaderboardItem[]
  streak: number
  coins: number
}
