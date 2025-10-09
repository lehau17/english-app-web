import { useQuery } from '@tanstack/react-query'
import type { WeeklyScheduleParams } from '../services/schedule.api'
import { getStudentWeeklySchedule } from '../services/schedule.api'
import type { StudentWeeklySchedule } from '../types/student-schedule.type'

export const useChildWeeklySchedule = (
  childId: string,
  weekStart?: string,
  options?: WeeklyScheduleParams & { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [
      'child-weekly-schedule',
      childId,
      weekStart,
      options?.timezone,
      options?.days,
    ],
    queryFn: async () => {
      const response = await getStudentWeeklySchedule(childId, {
        weekStart,
        timezone: options?.timezone,
        days: options?.days,
      })
      return response.data as StudentWeeklySchedule
    },
    enabled: (options?.enabled ?? true) && !!childId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
