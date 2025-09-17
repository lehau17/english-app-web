import { useQuery } from '@tanstack/react-query'
import { fetchUserInfo } from '../services/home.api'

export const useUserInfo = () => {
  return useQuery({
    queryKey: ['user-info'],
    queryFn: fetchUserInfo,
    select: (res) => res?.data || null,
  })
}
