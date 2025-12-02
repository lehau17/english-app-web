import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  bulkMarkAttendance,
  deleteAttendance,
  getClassroomSessions,
  getSessionAttendances,
  getSessionAttendanceSummary,
  getUnmarkedStudents,
  markAllAbsent,
  markAttendance,
  quickCheckIn,
  quickCheckOut,
  type BulkAttendanceDto,
  type MarkAttendanceDto,
} from '../services/teacher-attendance.api'

/**
 * Hook to get session attendances
 */
export const useSessionAttendances = (
  sessionId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['session-attendances', sessionId],
    queryFn: () => getSessionAttendances(sessionId!),
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get session attendance summary
 */
export const useSessionAttendanceSummary = (
  sessionId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['session-attendance-summary', sessionId],
    queryFn: () => getSessionAttendanceSummary(sessionId!),
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to get unmarked students
 */
export const useUnmarkedStudents = (
  sessionId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['unmarked-students', sessionId],
    queryFn: () => getUnmarkedStudents(sessionId!),
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 30, // 30 seconds
  })
}

/**
 * Hook to mark attendance
 */
export const useMarkAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
      dto,
    }: {
      sessionId: string
      studentId: string
      dto: MarkAttendanceDto
    }) => markAttendance(sessionId, studentId, dto),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['unmarked-students', variables.sessionId],
      })
    },
  })
}

/**
 * Hook to bulk mark attendance
 */
export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      dto,
    }: {
      sessionId: string
      dto: BulkAttendanceDto
    }) => bulkMarkAttendance(sessionId, dto),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['unmarked-students', variables.sessionId],
      })
    },
  })
}

/**
 * Hook to mark all absent
 */
export const useMarkAllAbsent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => markAllAbsent(sessionId),
    onSuccess: (_, sessionId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['unmarked-students', sessionId],
      })
    },
  })
}

/**
 * Hook to delete attendance
 */
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
    }: {
      sessionId: string
      studentId: string
    }) => deleteAttendance(sessionId, studentId),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['unmarked-students', variables.sessionId],
      })
    },
  })
}

/**
 * Hook to quick check-in
 */
export const useQuickCheckIn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
    }: {
      sessionId: string
      studentId: string
    }) => quickCheckIn(sessionId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', variables.sessionId],
      })
    },
  })
}

/**
 * Hook to quick check-out
 */
export const useQuickCheckOut = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      studentId,
    }: {
      sessionId: string
      studentId: string
    }) => quickCheckOut(sessionId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['session-attendances', variables.sessionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['session-attendance-summary', variables.sessionId],
      })
    },
  })
}

/**
 * Hook to get classroom sessions
 */
export const useClassroomSessions = (
  classroomId: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['classroom-sessions', classroomId],
    queryFn: () => getClassroomSessions(classroomId!),
    enabled: enabled && !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => data.data || [],
  })
}
