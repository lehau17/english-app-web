import axiosConfig from '../config/axiosConfig'

export interface SubmitTestRequest {
  answers: Record<string, string>
  timeSpent?: number
}

export interface PodcastTestResponse {
  podcastId: string
  title: string
  audioUrl: string
  transcript?: string
  fillBlankContent?: {
    sentences: Array<{
      id: string
      sentence: string
      correctAnswers: string[]
    }>
    timeLimit?: number
    totalQuestions: number
  }
  bestScore?: number
  attemptCount?: number
}

export interface TestResult {
  id: string
  scorePercent: number
  correctCount: number
  totalQuestions: number
  timeSpent?: number
  attemptNo: number
  createdAt: string
}

export const podcastTestApi = {
  // Get podcast test content
  getPodcastTest: async (podcastId: string): Promise<PodcastTestResponse> => {
    const response = await axiosConfig.get(
      `/private/v1/podcast-tests/${podcastId}`
    )
    return response.data.data
  },

  // Submit test attempt
  submitTest: async (
    podcastId: string,
    data: SubmitTestRequest
  ): Promise<TestResult> => {
    const response = await axiosConfig.post(
      `/private/v1/podcast-tests/${podcastId}/submit`,
      data
    )
    return response.data.data
  },

  // Get user attempts
  getAttempts: async (
    podcastId: string,
    limit?: number
  ): Promise<TestResult[]> => {
    const response = await axiosConfig.get(
      `/private/v1/podcast-tests/${podcastId}/attempts`,
      {
        params: { limit },
      }
    )
    return response.data.data
  },

  // Get best score
  getBestScore: async (
    podcastId: string
  ): Promise<{ bestScore: number; attemptCount: number }> => {
    const response = await axiosConfig.get(
      `/private/v1/podcast-tests/${podcastId}/best-score`
    )
    return response.data.data
  },
}
