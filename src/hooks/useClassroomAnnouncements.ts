import { useQuery } from '@tanstack/react-query'
import { getClassroomAnnouncements } from '../services/classroom-detail.api'

export const useClassroomAnnouncements = (
  classroomId: string | undefined,
  page: number,
  limit = 10
) => {
  return useQuery({
    queryKey: ['classroom-announcements', classroomId, page, limit],
    enabled: !!classroomId,
    queryFn: () =>
      getClassroomAnnouncements(classroomId as string, { page, limit }),
    select: (res) => res?.data ?? null,
  })
}
