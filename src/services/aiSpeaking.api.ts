import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export interface StartAiSpeakingSessionRequest {
  conversationId?: string
  topic?: string
  goal?: string
  targetDifficulty?: string
  maxTurns?: number
}

export interface AiSpeakingConversationDto {
  conversationId: string
  latestSession: AiSpeakingSessionDto
  sessionCount: number
}

export interface AiSpeakingConversationDetailDto {
  conversationId: string
  sessions: AiSpeakingSessionDto[]
}

export interface AiSpeakingTurnSegmentDto {
  id: string
  role: string
  orderNo: number
  transcript?: string | null
  audioUrl?: string | null
  durationSec?: number | null
  payload?: Record<string, unknown> | null
  createdAt: string
}

export interface AiSpeakingTurnDto {
  id: string
  turnIndex: number
  state: string
  aiPrompt?: string | null
  aiAudioUrl?: string | null
  userTranscript?: string | null
  userAudioUrl?: string | null
  userDurationSec?: number | null
  metrics?: Record<string, unknown> | null
  evaluation?: Record<string, unknown> | null
  suggestions: string[]
  score?: number | null
  relevanceScore?: number | null
  silenceDetected: boolean
  createdAt: string
  updatedAt: string
  segments: AiSpeakingTurnSegmentDto[]
}

export interface AiSpeakingSessionDto {
  id: string
  userId: string
  conversationId: string
  topic?: string | null
  goal?: string | null
  state: string
  maxTurns: number
  turnCount: number
  targetDifficulty: string
  currentDifficulty?: string | null
  silenceWarnings: number
  offTopicWarnings: number
  config?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  analytics?: Record<string, unknown> | null
  summary?: string | null
  summaryPayload?: Record<string, unknown> | null
  startedAt: string
  lastActivityAt: string
  endedAt?: string | null
  createdAt: string
  updatedAt: string
  turns: AiSpeakingTurnDto[]
}

export const startAiSpeakingSession = async (
  payload: StartAiSpeakingSessionRequest
): Promise<AiSpeakingSessionDto> => {
  const response = await api.post<BaseResponse<AiSpeakingSessionDto>>(
    '/private/v1/ai-speaking/sessions',
    payload
  )
  return response.data.data
}

export const getAiSpeakingSession = async (
  sessionId: string
): Promise<AiSpeakingSessionDto> => {
  const response = await api.get<BaseResponse<AiSpeakingSessionDto>>(
    `/private/v1/ai-speaking/sessions/${sessionId}`
  )
  return response.data.data
}

export const finalizeAiSpeakingSession = async (
  sessionId: string,
  payload: { reason?: string; learnerReflection?: string }
): Promise<AiSpeakingSessionDto> => {
  const response = await api.post<BaseResponse<AiSpeakingSessionDto>>(
    `/private/v1/ai-speaking/sessions/${sessionId}/finalize`,
    payload
  )
  return response.data.data
}

export const getAiSpeakingConversations = async (
  limit?: number,
  cursor?: string
): Promise<AiSpeakingConversationDto[]> => {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (cursor) params.append('cursor', cursor)

  const response = await api.get<BaseResponse<AiSpeakingConversationDto[]>>(
    `/private/v1/ai-speaking/sessions/conversations?${params.toString()}`
  )
  return response.data.data
}

export const getAiSpeakingConversation = async (
  conversationId: string
): Promise<AiSpeakingConversationDetailDto> => {
  const response = await api.get<BaseResponse<AiSpeakingConversationDetailDto>>(
    `/private/v1/ai-speaking/sessions/conversations/${conversationId}`
  )
  return response.data.data
}

export const listAiSpeakingSessions = async (
  limit?: number,
  cursor?: string
): Promise<AiSpeakingSessionDto[]> => {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (cursor) params.append('cursor', cursor)

  const response = await api.get<BaseResponse<AiSpeakingSessionDto[]>>(
    `/private/v1/ai-speaking/sessions?${params.toString()}`
  )
  return response.data.data
}
