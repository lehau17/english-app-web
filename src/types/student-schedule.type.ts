export type ScheduleState =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  | 'postponed'

export interface StudentScheduleInstructor {
  id: string
  displayName?: string | null
  avatarUrl?: string | null
}

export interface StudentScheduleCourse {
  id: string
  title: string
  description?: string | null
}

export interface StudentScheduleSessionSchedule {
  courseSessionScheduleId: string
  sessionNumber: number
}

export interface StudentScheduleActivity {
  activityId: string
  orderNo: number
  activity: {
    id: string
    title: string
    type: string
  }
}

export interface StudentScheduleSession {
  sessionId: string
  classroomId: string
  classroomName: string
  title: string
  description?: string | null
  status: string
  type: string
  startTime: string
  endTime: string
  timezone: string
  durationHours: number
  meetingUrl?: string | null
  recordingUrl?: string | null
  agenda?: Record<string, unknown> | null
  materials?: Record<string, unknown> | null
  instructor: StudentScheduleInstructor | null
  attendanceStatus?: string | null
  state: ScheduleState
  stateLabel: string
  startsInMinutes: number | null
  endsInMinutes: number | null
  // Thông tin course và giáo trình
  course?: StudentScheduleCourse | null
  sessionSchedule?: StudentScheduleSessionSchedule | null
  activities?: StudentScheduleActivity[]
}

export interface StudentDailyScheduleSummary {
  total: number
  upcoming: number
  ongoing: number
  completed: number
  firstSessionStart: string | null
  lastSessionEnd: string | null
  hasConflicts: boolean
}

export interface StudentDailySchedule {
  studentId: string
  timezone: string
  date: string
  range: {
    startUtc: string
    endUtc: string
  }
  sessions: StudentScheduleSession[]
  summary: StudentDailyScheduleSummary
}

export interface StudentWeeklyScheduleDay {
  date: string
  dayOfWeek: string
  label: string
  sessions: StudentScheduleSession[]
}

export interface StudentWeeklyScheduleSummary {
  totalSessions: number
  byState: Record<string, number>
}

export interface StudentWeeklySchedule {
  studentId: string
  timezone: string
  weekStart: string
  weekEnd: string
  days: StudentWeeklyScheduleDay[]
  summary: StudentWeeklyScheduleSummary
}
