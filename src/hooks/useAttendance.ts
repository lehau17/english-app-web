import { useQuery } from '@tanstack/react-query'
import { getMyAttendanceHistory } from '../services/attendance.api'
import type { AttendanceHistoryFilter } from '../types/attendance.type'

/**
 * Hook to fetch current user's attendance history for a classroom
 */
export const useMyAttendanceHistory = (
  classroomId: string,
  filter?: AttendanceHistoryFilter,
  enabled = true
) => {
  return useQuery({
    queryKey: ['my-attendance', classroomId, filter],
    queryFn: () => getMyAttendanceHistory(classroomId, filter),
    enabled: enabled && !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
