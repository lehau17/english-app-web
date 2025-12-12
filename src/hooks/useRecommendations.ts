import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  dismissRecommendation,
  fetchRecommendations,
  generateRecommendations,
  markRecommendationAsClicked,
  markRecommendationAsViewed,
  type GenerateRecommendationsRequest,
  type RecommendationType,
} from '../services/recommendation.api'

// Get recommendations
export const useRecommendations = (params?: {
  type?: RecommendationType
  viewed?: boolean
  dismissed?: boolean
}) => {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: () => fetchRecommendations(params),
    select: (res) => res?.data ?? [],
  })
}

// Generate recommendations mutation
export const useGenerateRecommendations = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request?: GenerateRecommendationsRequest) =>
      generateRecommendations(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

// Mark as viewed mutation
export const useMarkRecommendationAsViewed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markRecommendationAsViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

// Mark as clicked mutation
export const useMarkRecommendationAsClicked = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markRecommendationAsClicked(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}

// Dismiss recommendation mutation
export const useDismissRecommendation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dismissRecommendation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
    },
  })
}
