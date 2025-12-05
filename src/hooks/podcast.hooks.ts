import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { podcastApi } from '../services/podcast.api'
import type {
  CreatePodcastData,
  UpdatePodcastData,
} from '../types/podcast.type'

export const usePodcasts = (params?: {
  page?: number
  limit?: number
  category?: string
  difficulty?: string
  search?: string
  tab?: 'all' | 'recommended' | 'listening' | 'completed' | 'my-podcasts'
  source?: string
  duration?: 'short' | 'medium' | 'long'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) => {
  return useQuery({
    queryKey: ['podcasts', params],
    queryFn: () => podcastApi.getAll(params),
  })
}

export const usePodcast = (id: string) => {
  return useQuery({
    queryKey: ['podcast', id],
    queryFn: () => podcastApi.getById(id),
    enabled: !!id,
  })
}

// Unified create podcast hook - handles both upload and generate modes
export const useCreatePodcast = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePodcastData) => podcastApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch podcasts list
      queryClient.invalidateQueries({ queryKey: ['podcasts'] })
    },
  })
}

// Update podcast hook
export const useUpdatePodcast = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePodcastData }) =>
      podcastApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch podcasts list
      queryClient.invalidateQueries({ queryKey: ['podcasts'] })
      // Also invalidate the specific podcast
      queryClient.invalidateQueries({ queryKey: ['podcast', variables.id] })
    },
  })
}
