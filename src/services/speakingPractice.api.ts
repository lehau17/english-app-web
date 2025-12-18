import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  SpeakingPracticeProgress,
  NextPracticeItem,
  SubmitAttemptRequest,
  SubmitResult,
  PersonalizedDrill,
  DueWordsResponse,
} from '../types/speaking-practice.types'

const BASE_URL = '/private/v1/speaking-practice'

/**
 * Get current user progress
 */
export const getCurrentProgress =
  async (): Promise<SpeakingPracticeProgress> => {
    const response = await api.get<BaseResponse<SpeakingPracticeProgress>>(
      `${BASE_URL}/current`
    )
    return response.data.data
  }

/**
 * Get next practice item
 */
export const getNextItem = async (params?: {
  level?: number
  lessonId?: string
  includeRemedial?: boolean
}): Promise<NextPracticeItem> => {
  const searchParams = new URLSearchParams()
  if (params?.level) searchParams.append('level', params.level.toString())
  if (params?.lessonId) searchParams.append('lessonId', params.lessonId)
  if (params?.includeRemedial) searchParams.append('includeRemedial', 'true')

  const url = searchParams.toString()
    ? `${BASE_URL}/next-item?${searchParams}`
    : `${BASE_URL}/next-item`

  const response = await api.get<BaseResponse<NextPracticeItem>>(url)
  return response.data.data
}

/**
 * Submit practice attempt with audio
 */
export const submitAttempt = async (
  data: SubmitAttemptRequest,
  audioFile?: File
): Promise<SubmitResult> => {
  const formData = new FormData()
  formData.append('lessonId', data.lessonId)
  formData.append('itemIndex', data.itemIndex.toString())
  formData.append('referenceText', data.referenceText)
  if (data.attemptNumber) {
    formData.append('attemptNumber', data.attemptNumber.toString())
  }

  if (audioFile) {
    formData.append('audio', audioFile)
  } else if (data.audioBase64) {
    formData.append('audioBase64', data.audioBase64)
  }

  const response = await api.post<BaseResponse<SubmitResult>>(
    `${BASE_URL}/submit`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data.data
}

/**
 * Get personalized drills
 */
export const getPersonalizedDrills = async (params?: {
  status?: string
  limit?: number
}): Promise<PersonalizedDrill[]> => {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.append('status', params.status)
  if (params?.limit) searchParams.append('limit', params.limit.toString())

  const url = searchParams.toString()
    ? `${BASE_URL}/drills?${searchParams}`
    : `${BASE_URL}/drills`

  const response = await api.get<BaseResponse<PersonalizedDrill[]>>(url)
  return response.data.data
}

/**
 * Get words due for SM-2 review
 */
export const getDueWords = async (params?: {
  limit?: number
  offset?: number
}): Promise<DueWordsResponse> => {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.append('limit', params.limit.toString())
  if (params?.offset) searchParams.append('offset', params.offset.toString())

  const url = searchParams.toString()
    ? `${BASE_URL}/due-words?${searchParams}`
    : `${BASE_URL}/due-words`

  const response = await api.get<BaseResponse<DueWordsResponse>>(url)
  return response.data.data
}
