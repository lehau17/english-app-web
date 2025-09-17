import { useQuery } from '@tanstack/react-query'
import { fetchMyClassrooms } from '../services/home.api'

export const useMyClassrooms = () => {
  return useQuery({
    queryKey: ['my-classrooms'],
    queryFn: () => fetchMyClassrooms(),
    select: (res) => res?.data || [],
  })
}
