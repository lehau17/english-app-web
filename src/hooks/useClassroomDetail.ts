import { useQuery } from '@tanstack/react-query'
import { getClassroomDetail } from '../services/classroom-detail.api'
export function useClassroomDetail(classroomId?: string) {
  return useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: () => {
      if (!classroomId) throw new Error('Missing classroomId')
      return getClassroomDetail(classroomId)
    },
    select: (res) => res?.data,
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5,
  })
}
