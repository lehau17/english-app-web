import api from '../lib/api'
import type {
  CreateMakeupRequestDto,
  MakeupAttendanceRequest,
  MakeupRequestFilter,
  PaginatedMakeupRequests,
} from '../types/makeup-request.type'

/**
 * Create a makeup attendance request for a session
 */
export const createMakeupRequest = async (
  sessionId: string,
  data: CreateMakeupRequestDto
): Promise<MakeupAttendanceRequest> => {
  const response = await api.post(
    `/private/v1/sessions/${sessionId}/makeup-request`,
    data
  )
  return response.data.data || response.data
}

/**
 * Get my makeup requests
 */
export const getMyMakeupRequests = async (
  filter: MakeupRequestFilter = {}
): Promise<PaginatedMakeupRequests> => {
  const params = new URLSearchParams()
  if (filter.page) params.append('page', filter.page.toString())
  if (filter.limit) params.append('limit', filter.limit.toString())
  if (filter.status) params.append('status', filter.status)
  if (filter.classroomId) params.append('classroomId', filter.classroomId)

  const response = await api.get(
    `/private/v1/sessions/my/makeup-requests?${params.toString()}`
  )
  return response.data.data || response.data
}

/**
 * Cancel a pending makeup request
 */
export const cancelMakeupRequest = async (requestId: string): Promise<void> => {
  await api.delete(`/private/v1/sessions/makeup-requests/${requestId}`)
}

/**
 * Check if a session has a pending or existing makeup request
 */
export const checkExistingMakeupRequest = async (
  sessionId: string
): Promise<MakeupAttendanceRequest | null> => {
  try {
    const response = await getMyMakeupRequests({ limit: 100 })
    const existing = response.data.find((req) => req.sessionId === sessionId)
    return existing || null
  } catch {
    return null
  }
}
