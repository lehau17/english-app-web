import { useQuery } from '@tanstack/react-query'
import { getMyDailySchedule } from '../services/schedule.api'
import type { DailyScheduleParams } from '../services/schedule.api'
import type { StudentDailySchedule } from '../types/student-schedule.type'

export const useStudentDailySchedule = (
  date?: string,
  options?: DailyScheduleParams & { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['student-daily-schedule', date, options?.timezone],
    queryFn: async () => {
      const response = await getMyDailySchedule({
        date,
        timezone: options?.timezone,
      })
      return response.data as StudentDailySchedule
    },
    enabled: (options?.enabled ?? true) && Boolean(date),
    staleTime: 1000 * 60,
  })
}
