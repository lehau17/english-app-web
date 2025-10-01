import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
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
      if (!podcastId) return null
      const result = await getAggregateRating(podcastId)
      return result.data
    },
    enabled: !!podcastId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

export const useMyRating = (podcastId: string | undefined) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'my-rating'],
    queryFn: async () => {
      if (!podcastId) return null
      return getMyRating(podcastId)
    },
    enabled: !!podcastId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

export const useSaveRating = (podcastId: string | undefined) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => createOrUpdateRating(payload),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'aggregate'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'my-rating'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'ratings'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'has-rated'] })

      toast.success('Đã lưu đánh giá thành công!')
    },
    onError: (error: any) => {
      console.error('Error saving rating:', error)
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi lưu đánh giá'
      )
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
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'ratings'] })
      qc.invalidateQueries({ queryKey: ['podcast', podcastId, 'has-rated'] })

      toast.success('Đã xóa đánh giá')
    },
    onError: (error: any) => {
      console.error('Error deleting rating:', error)
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá'
      )
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
    queryFn: async () => {
      if (!podcastId) return null
      return listRatings(podcastId, page, limit)
    },
    enabled: !!podcastId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

export const useHasUserRated = (podcastId: string | undefined) => {
  return useQuery({
    queryKey: ['podcast', podcastId, 'has-rated'],
    queryFn: async () => {
      if (!podcastId) return null
      return hasUserRated(podcastId)
    },
    enabled: !!podcastId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
