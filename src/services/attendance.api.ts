import api from '../lib/api'
import type {
  AttendanceHistoryFilter,
  PaginatedAttendanceHistory,
} from '../types/attendance.type'
import type { BaseResponse } from '../types/base-response.type'

/**
 * Build query params for attendance history
 */
const buildAttendanceQueryParams = (filter?: AttendanceHistoryFilter) => {
  if (!filter) return undefined
  const query: Record<string, string> = {}

  if (filter.page) query.page = String(filter.page)
  if (filter.limit) query.limit = String(filter.limit)
  if (filter.fromDate) query.fromDate = filter.fromDate
  if (filter.toDate) query.toDate = filter.toDate
  if (filter.status) query.status = filter.status

  return Object.keys(query).length ? query : undefined
}

/**
 * Get current user's attendance history for a classroom
 */
export const getMyAttendanceHistory = async (
  classroomId: string,
  filter?: AttendanceHistoryFilter
): Promise<BaseResponse<PaginatedAttendanceHistory>> => {
  const { data } = await api.get<BaseResponse<PaginatedAttendanceHistory>>(
    `/private/v1/classrooms/${classroomId}/my-attendance`,
    {
      params: buildAttendanceQueryParams(filter),
    }
  )
  return data
}
