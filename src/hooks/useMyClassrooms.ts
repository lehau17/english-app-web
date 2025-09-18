import { useQuery } from '@tanstack/react-query'
import { fetchMyClassrooms } from '../services/home.api'

export const useMyClassrooms = (role?: string, enabled = true) => {
  return useQuery({
    queryKey: ['my-classrooms', role],
    queryFn: () => fetchMyClassrooms(),
    enabled,
    select: (res) => res?.data ?? [],
  })
}
