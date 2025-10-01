export interface ChildProgress {
  id: string
  name: string
  avatar?: string
  level: number
  todayStudyTime: number
  completedActivities: number
  totalActivities: number
  recentActivity: string
  lastActive: string
  settings?: {
    canViewProgress: boolean
    canSetGoals: boolean
    canControlTime: boolean
    dailyTimeLimit?: number
    bedtimeStart?: string
    bedtimeEnd?: string
    notificationsEnabled: boolean
    notificationTypes: string[]
    notificationSchedule: string
    quietHoursStart?: string
    quietHoursEnd?: string
  }
}

export interface ParentChildProgressItem {
  id: string
  activityTitle: string
  activityType: string
  state: string
  score?: number | null
  timeSpent: number
  createdAt: string
}

export interface ParentReward {
  id: string
  title: string
  description?: string
  cost: number
  type: string
  imageUrl?: string
  isActive: boolean
  claimsCount: number
  createdAt: string
}

export interface ParentNotification {
  id: string
  type: string
  title: string
  body?: string
  data?: any
  readAt?: string
  createdAt: string
}

export interface ParentDashboardData {
  children: ChildProgress[]
  rewards: ParentReward[]
  notifications: ParentNotification[]
  totalStudyTime: number
  completionRate: number
}
