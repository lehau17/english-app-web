import { useQuery } from '@tanstack/react-query'
import { fetchNextLesson } from '../services/home.api'

export const useNextLesson = (enabled = true) => {
  return useQuery({
    queryKey: ['next-lesson'],
    queryFn: fetchNextLesson,
    enabled,
    select: (res) => res?.data ?? null,
  })
}
