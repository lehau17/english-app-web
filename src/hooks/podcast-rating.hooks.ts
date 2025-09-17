import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createOrUpdateRating,
  deleteMyRating,
  getAggregateRating,
  getMyRating,
  hasUserRated,
  listRatings,
} from '../services/podcast-rating.api'

export const useAggregateRating = (podcastId: string | undefined) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'aggregate'],
    queryFn: async () => {
      const result = await getAggregateRating(podcastId!)
      return result.data
    },
    enabled: !!podcastId,
  })
}

export const useMyRating = (podcastId: string | undefined) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'my-rating'],
    queryFn: () => getMyRating(podcastId!),
    enabled: !!podcastId,
  })
}

export const useSaveRating = (podcastId: string | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => createOrUpdateRating(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'aggregate'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'my-rating'] })
    },
  })
}

export const useDeleteRating = (podcastId: string | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteMyRating(podcastId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'aggregate'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'my-rating'] })
    },
  })
}

export const useListRatings = (
  podcastId: string | undefined,
  page = 1,
  limit = 10
) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'ratings', page, limit],
    queryFn: () => listRatings(podcastId!, page, limit),
    enabled: !!podcastId,
  })
}

export const useHasUserRated = (podcastId: string | undefined) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'has-rated'],
    queryFn: () => hasUserRated(podcastId!),
    enabled: !!podcastId,
  })
}
