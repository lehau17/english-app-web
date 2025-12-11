/**
 * Makeup Attendance Request types for student-facing UI
 */

export type MakeupRequestStatus = 'pending' | 'approved' | 'rejected'

export const MAKEUP_STATUS_LABELS: Record<MakeupRequestStatus, string> = {
  pending: 'Đang chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Đã từ chối',
}

export const MAKEUP_STATUS_COLORS: Record<
  MakeupRequestStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
}

export interface MakeupRequestSession {
  id: string
  title: string
  startTime: string
  endTime: string
  classroomId?: string
  classroom?: {
    id: string
    name: string
    classCode: string
  }
}

export interface MakeupRequestReviewer {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
}

export interface MakeupAttendanceRequest {
  id: string
  sessionId: string
  studentId: string
  reason: string
  evidenceUrls: string[]
  status: MakeupRequestStatus
  reviewedById?: string | null
  reviewedAt?: string | null
  reviewNote?: string | null
  createdAt: string
  updatedAt: string
  session?: MakeupRequestSession
  reviewedBy?: MakeupRequestReviewer | null
}

export interface CreateMakeupRequestDto {
  reason: string
  evidenceUrls?: string[]
}

export interface PaginatedMakeupRequests {
  data: MakeupAttendanceRequest[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MakeupRequestFilter {
  page?: number
  limit?: number
  status?: MakeupRequestStatus
  classroomId?: string
}
