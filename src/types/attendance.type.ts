/**
 * Attendance types for student-facing UI
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Co mat',
  absent: 'Vang mat',
  late: 'Di muon',
  excused: 'Co phep',
}

export const ATTENDANCE_STATUS_COLORS: Record<
  AttendanceStatus,
  { bg: string; text: string; border: string }
> = {
  present: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  absent: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  late: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  excused: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
}

export interface AttendanceSession {
  sessionId: string
  sessionTitle: string
  sessionNumber: number
  startTime: string
  endTime: string
}

export interface AttendanceHistoryItem {
  id: string
  status: AttendanceStatus | 'not_marked'
  checkInTime: string | null
  checkOutTime: string | null
  notes: string | null
  createdAt: string
  session: AttendanceSession
}

export interface PaginatedAttendanceHistory {
  data: AttendanceHistoryItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  summary: {
    totalSessions: number
    present: number
    absent: number
    late: number
    excused: number
    attendanceRate: number
  }
}

// API Response type (from backend)
export interface AttendanceHistoryApiResponse {
  totalSessions: number
  attended: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
  history: Array<{
    sessionId: string
    sessionTitle: string
    sessionDate: string
    status: string
  }>
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface AttendanceHistoryFilter {
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
  status?: AttendanceStatus
}

/**
 * Blocking status for attendance-based learning blocking
 */
export interface BlockingStatus {
  isBlocked: boolean
  blockedAt?: string
  blockedReason?: string
  consecutiveAbsences: number
  threshold: number
  lastAbsenceDate?: string
}
