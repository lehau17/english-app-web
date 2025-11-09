import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export interface EvaluationCategory {
  name: string
  comment: string
}

export interface EvaluationResult {
  attemptId: string
  score: number
  feedback: string
  categories?: EvaluationCategory[]
  transcript?: string
  detail?: Record<string, unknown> | null
}

type PronunciationPayload = {
  activityId?: string // Optional - only needed if saving to Activity attempts
  audioBase64: string
  mimeType?: string
  phrase: string
}

type SpeakingPayload = {
  activityId: string
  audioBase64: string
  mimeType?: string
  prompt?: string
  minSeconds?: number
}

type WritingPayload = {
  activityId: string
  submission: string
  prompt?: string
  minWords?: number
}

export async function evaluatePronunciation(payload: PronunciationPayload) {
  const response = await api.post<BaseResponse<EvaluationResult>>(
    '/private/v1/ai-evaluation/pronunciation',
    payload
  )
  return response.data
}

export async function evaluateSpeaking(payload: SpeakingPayload) {
  const response = await api.post<BaseResponse<EvaluationResult>>(
    '/private/v1/ai-evaluation/speaking',
    payload
  )
  return response.data
}

export async function evaluateWriting(payload: WritingPayload) {
  const response = await api.post<BaseResponse<EvaluationResult>>(
    '/private/v1/ai-evaluation/writing',
    payload
  )
  return response.data
}
