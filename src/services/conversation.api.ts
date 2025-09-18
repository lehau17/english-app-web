import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  ConversationMessage,
  ConversationSummary,
  PaginatedResult,
  SendConversationMessagePayload,
  SendMessageResponse,
  CreateConversationPayload,
  MarkConversationReadPayload,
} from '../types/conversation.type'

export async function fetchClassroomConversations(
  classroomId: string,
  params?: {
    page?: number
    limit?: number
    type?: string
  }
) {
  console.log('fetchClassroomConversations', classroomId, params)
  const { data } = await api.get<
    BaseResponse<PaginatedResult<ConversationSummary>>
  >(`/private/v1/classrooms/${classroomId}/conversations`, {
    params,
  })
  return data.data
}

export async function createClassroomConversation(
  classroomId: string,
  payload: CreateConversationPayload
) {
  const { data } = await api.post<BaseResponse<ConversationSummary>>(
    `/private/v1/classrooms/${classroomId}/conversations`,
    payload
  )
  return data.data
}

export async function fetchConversationMessages(
  classroomId: string,
  conversationId: string,
  params?: {
    page?: number
    limit?: number
    sortOrder?: 'asc' | 'desc'
    before?: string
    after?: string
  }
) {
  const { data } = await api.get<
    BaseResponse<PaginatedResult<ConversationMessage>>
  >(
    `/private/v1/classrooms/${classroomId}/conversations/${conversationId}/messages`,
    {
      params,
    }
  )
  return data.data
}

export async function sendConversationMessage(
  classroomId: string,
  conversationId: string,
  payload: SendConversationMessagePayload
) {
  const { data } = await api.post<BaseResponse<SendMessageResponse>>(
    `/private/v1/classrooms/${classroomId}/conversations/${conversationId}/messages`,
    payload
  )
  return data.data
}

export async function markConversationRead(
  classroomId: string,
  conversationId: string,
  payload?: MarkConversationReadPayload
) {
  const { data } = await api.post<BaseResponse<ConversationSummary>>(
    `/private/v1/classrooms/${classroomId}/conversations/${conversationId}/read`,
    payload ?? {}
  )
  return data.data
}
