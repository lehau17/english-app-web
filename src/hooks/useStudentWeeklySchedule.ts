import { useQuery } from '@tanstack/react-query'
import type { WeeklyScheduleParams } from '../services/schedule.api'
import { getMyWeeklySchedule } from '../services/schedule.api'
import type { StudentWeeklySchedule } from '../types/student-schedule.type'

export const useStudentWeeklySchedule = (
  weekStart?: string,
  options?: WeeklyScheduleParams & { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [
      'student-weekly-schedule',
      weekStart,
      options?.timezone,
      options?.days,
    ],
    queryFn: async () => {
      const response = await getMyWeeklySchedule({
        weekStart,
        timezone: options?.timezone,
        days: options?.days,
      })
      return response.data as StudentWeeklySchedule
    },
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  })
}
