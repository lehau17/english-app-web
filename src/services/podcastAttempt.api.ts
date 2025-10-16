import api from '../lib/api'
import type {
  StartPodcastResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from '../types/podcastAttempt.type'

export const podcastAttemptApi = {
  // Start a podcast attempt
  startPodcast: async (podcastId: string): Promise<StartPodcastResponse> => {
    const response = await api.post(`/private/v1/podcasts/${podcastId}/start`)
    return response.data
  },

  // Submit answer for a gap
  submitAnswer: async (
    data: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> => {
    const response = await api.post(
      `/private/v1/podcast-attempts/${data.attemptId}/answers`,
      {
        gapId: data.gapId,
        answer: data.answer,
      }
    )
    return response.data
  },

  // Complete attempt
  completeAttempt: async (attemptId: string): Promise<any> => {
    const response = await api.post(
      `/private/v1/podcast-attempts/${attemptId}/complete`
    )
    return response.data
  },

  // Get attempt details
  getAttempt: async (attemptId: string): Promise<any> => {
    const response = await api.get(`/private/v1/podcast-attempts/${attemptId}`)
    return response.data
  },

  // Save draft
  saveDraft: async (
    podcastId: string,
    attemptId: string,
    answers: Record<string, string>,
    timeSpent?: number
  ): Promise<any> => {
    const response = await api.post(
      `/private/v1/podcasts/${podcastId}/save-draft`,
      {
        attemptId,
        answers,
        timeSpent,
      }
    )
    return response.data
  },

  // Submit attempt
  submitAttempt: async (
    podcastId: string,
    attemptId: string,
    answers: Record<string, string>
  ): Promise<any> => {
    const response = await api.post(
      `/private/v1/podcasts/${podcastId}/submit`,
      {
        attemptId,
        answers,
      }
    )
    return response.data
  },

  // Get attempts for a podcast
  getPodcastAttempts: async (podcastId: string): Promise<any> => {
    const response = await api.get(`/private/v1/podcasts/${podcastId}/attempts`)
    return response.data
  },
}
