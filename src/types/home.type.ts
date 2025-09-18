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
  name: string
  teacherName: string
  teacher: {
    displayName: string
  }
  students: number
  maxStudents: number
  assignments: number
  classCode?: string
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
