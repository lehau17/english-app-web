import { useQuery } from '@tanstack/react-query'
import {
  getBlockingStatus,
  getMyAttendanceHistory,
} from '../services/attendance.api'
import type {
  AttendanceHistoryFilter,
  BlockingStatus,
} from '../types/attendance.type'

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

/**
 * Hook to fetch blocking status for a student in a classroom
 */
export const useBlockingStatus = (
  classroomId: string,
  studentId: string,
  enabled = true
) => {
  return useQuery<BlockingStatus>({
    queryKey: ['blocking-status', classroomId, studentId],
    queryFn: () =>
      getBlockingStatus(classroomId, studentId).then((res) => res.data),
    enabled: enabled && !!classroomId && !!studentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
