import { useMutation, useQuery } from '@tanstack/react-query'
import { podcastAttemptApi } from '../services/podcastAttempt.api'
import type { SubmitAnswerRequest } from '../types/podcastAttempt.type'

// Start podcast attempt
export const useStartPodcast = () => {
  return useMutation({
    mutationFn: (podcastId: string) =>
      podcastAttemptApi.startPodcast(podcastId),
  })
}

// Submit answer
export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: (data: SubmitAnswerRequest) =>
      podcastAttemptApi.submitAnswer(data),
  })
}

// Complete attempt
export const useCompleteAttempt = () => {
  return useMutation({
    mutationFn: (attemptId: string) =>
      podcastAttemptApi.completeAttempt(attemptId),
  })
}

// Get attempt details
export const useGetAttempt = (attemptId: string) => {
  return useQuery({
    queryKey: ['podcast-attempt', attemptId],
    queryFn: () => podcastAttemptApi.getAttempt(attemptId),
    enabled: !!attemptId,
  })
}

// Save draft
export const useSaveDraft = () => {
  return useMutation({
    mutationFn: ({
      podcastId,
      attemptId,
      answers,
      timeSpent,
    }: {
      podcastId: string
      attemptId: string
      answers: Record<string, string>
      timeSpent?: number
    }) => podcastAttemptApi.saveDraft(podcastId, attemptId, answers, timeSpent),
  })
}

// Submit attempt
export const useSubmitAttempt = () => {
  return useMutation({
    mutationFn: ({
      podcastId,
      attemptId,
      answers,
    }: {
      podcastId: string
      attemptId: string
      answers: Record<string, string>
    }) => podcastAttemptApi.submitAttempt(podcastId, attemptId, answers),
  })
}

// Get attempts for a podcast
export const usePodcastAttempts = (podcastId: string) => {
  return useQuery({
    queryKey: ['podcast-attempts', podcastId],
    queryFn: () => podcastAttemptApi.getPodcastAttempts(podcastId),
    enabled: !!podcastId,
  })
}
