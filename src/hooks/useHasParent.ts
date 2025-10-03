import { useQuery } from '@tanstack/react-query'
import { hasParentApi } from '../services/auth.api'

export const useHasParent = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['has-parent'],
    queryFn: hasParentApi,
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  })
}
