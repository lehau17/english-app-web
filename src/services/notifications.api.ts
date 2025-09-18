import api from '../lib/api'

export type NotificationType =
  | 'achievement'
  | 'reminder'
  | 'system'
  | 'social'
  | 'assignment'
  | 'streak'
  | 'parent_child'

export type NotificationChannel = 'socket' | 'fcm' | 'email' | 'sms' | 'in_app'

type BroadcastPayload = {
  type: NotificationType
  title: string
  body?: string
  data?: Record<string, any>
  channel: NotificationChannel
}

export async function broadcastClassroomNotification(
  classroomId: string,
  payload: BroadcastPayload
) {
  const body: any = {
    type: payload.type,
    title: payload.title,
    body: payload.body,
    channel: payload.channel,
  }
  if (payload.data) body.data = JSON.stringify(payload.data)
  const { data } = await api.post(
    `/private/v1/notifications/classrooms/${classroomId}/broadcast`,
    body
  )
  return data
}

// -------- Listing & actions --------
export type ApiNotification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  data?: any
  channel: NotificationChannel
  createdAt: string
  readAt?: string | null
}

export type PageResponse<T> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function listNotifications(params: {
  page?: number
  limit?: number
  read?: boolean
  channel?: NotificationChannel
}) {
  const { data } = await api.get<{
    statusCode: number
    message: string
    data: PageResponse<ApiNotification>
  }>('/private/v1/notifications', { params })
  return data.data
}

export async function markNotificationRead(id: string) {
  const { data } = await api.put<{
    statusCode: number
    message: string
    data: any
  }>(`/private/v1/notifications/${id}`, {
    read: true,
  })
  return data.data
}

export async function deleteNotification(id: string) {
  const { data } = await api.delete<{
    statusCode: number
    message: string
    data: any
  }>(`/private/v1/notifications/${id}`)
  return data.data
}
