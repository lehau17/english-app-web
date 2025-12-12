import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export type RecommendationType =
  | 'course'
  | 'lesson'
  | 'activity'
  | 'podcast'
  | 'vocabulary'

export interface Recommendation {
  id: string
  userId: string
  type: RecommendationType
  courseId?: string
  lessonId?: string
  activityId?: string
  podcastId?: string
  vocabularyId?: string
  confidence: number
  reasoning: string
  viewed: boolean
  clicked: boolean
  dismissed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRecommendationRequest {
  type: RecommendationType
  courseId?: string
  lessonId?: string
  activityId?: string
  podcastId?: string
  vocabularyId?: string
  confidence: number
  reasoning: string
}

export interface GenerateRecommendationsRequest {
  limit?: number
}

// Get recommendations for current user
export const fetchRecommendations = async (params?: {
  type?: RecommendationType
  viewed?: boolean
  dismissed?: boolean
}): Promise<BaseResponse<Recommendation[]>> => {
  const { data } = await api.get<BaseResponse<Recommendation[]>>(
    '/private/v1/recommendations',
    { params }
  )
  return data
}

// Create recommendation (admin/system)
export const createRecommendation = async (
  request: CreateRecommendationRequest
): Promise<BaseResponse<Recommendation>> => {
  const { data } = await api.post<BaseResponse<Recommendation>>(
    '/private/v1/recommendations',
    request
  )
  return data
}

// Mark recommendation as viewed
export const markRecommendationAsViewed = async (
  id: string
): Promise<BaseResponse<Recommendation>> => {
  const { data } = await api.post<BaseResponse<Recommendation>>(
    `/private/v1/recommendations/${id}/view`
  )
  return data
}

// Mark recommendation as clicked
export const markRecommendationAsClicked = async (
  id: string
): Promise<BaseResponse<Recommendation>> => {
  const { data } = await api.post<BaseResponse<Recommendation>>(
    `/private/v1/recommendations/${id}/click`
  )
  return data
}

// Dismiss recommendation
export const dismissRecommendation = async (
  id: string
): Promise<BaseResponse<Recommendation>> => {
  const { data } = await api.post<BaseResponse<Recommendation>>(
    `/private/v1/recommendations/${id}/dismiss`
  )
  return data
}

// Generate personalized recommendations
export const generateRecommendations = async (
  request?: GenerateRecommendationsRequest
): Promise<BaseResponse<{ recommendationIds: string[]; count: number }>> => {
  const { data } = await api.post<
    BaseResponse<{ recommendationIds: string[]; count: number }>
  >('/private/v1/recommendations/generate', request || {})
  return data
}
