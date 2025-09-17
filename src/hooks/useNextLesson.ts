import { useQuery } from '@tanstack/react-query'
import { fetchNextLesson } from '../services/home.api'

export const useNextLesson = () => {
  return useQuery({
    queryKey: ['next-lesson'],
    queryFn: fetchNextLesson,
    select: (res) => res?.data || null,
  })
}
