import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { podcastTestApi } from '../services/podcast-test.api'
import type { SubmitTestRequest } from '../services/podcast-test.api'

// Hook to get podcast test content
export const usePodcastTest = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcastTest', podcastId],
    queryFn: () => podcastTestApi.getPodcastTest(podcastId),
    enabled: !!podcastId,
  })
}

// Hook to submit podcast test
export const useSubmitPodcastTest = (podcastId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SubmitTestRequest) =>
      podcastTestApi.submitTest(podcastId, data),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['podcastTest', podcastId] })
      queryClient.invalidateQueries({
        queryKey: ['podcastTestAttempts', podcastId],
      })
      queryClient.invalidateQueries({
        queryKey: ['podcastTestBestScore', podcastId],
      })
    },
  })
}

// Hook to get user attempts
export const usePodcastTestAttempts = (podcastId: string, limit?: number) => {
  return useQuery({
    queryKey: ['podcastTestAttempts', podcastId, limit],
    queryFn: () => podcastTestApi.getAttempts(podcastId, limit),
    enabled: !!podcastId,
  })
}

// Hook to get best score
export const usePodcastTestBestScore = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcastTestBestScore', podcastId],
    queryFn: () => podcastTestApi.getBestScore(podcastId),
    enabled: !!podcastId,
  })
}
