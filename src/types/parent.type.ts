export interface ChildProgress {
  id: string
  name: string
  avatar?: string
  level: number
  xp: number
  xpToNext: number
  streak: number
  coins: number
  todayStudyTime: number
  completedActivities: number
  totalActivities: number
  recentActivity: string
  lastActive: string
}

export interface ParentReward {
  id: string
  title: string
  description?: string
  cost: number
  claimed: boolean
}

export interface ParentNotification {
  id: string
  type: 'achievement' | 'activity' | 'reminder' | 'system'
  title: string
  message: string
  time: string
  read: boolean
}

export interface ParentDashboardData {
  children: ChildProgress[]
  rewards: ParentReward[]
  notifications: ParentNotification[]
  totalStudyTime: number
  completionRate: number
}
