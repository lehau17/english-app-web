import { useQuery } from '@tanstack/react-query'
import { fetchMyClassrooms } from '../services/home.api'

export const useMyClassrooms = (
  role?: string,
  enabled = true,
  status?: string
) => {
  return useQuery({
    queryKey: ['my-classrooms', role, status],
    queryFn: () => fetchMyClassrooms(status ? { status } : undefined),
    enabled,
    select: (res) => res?.data ?? [],
  })
}
