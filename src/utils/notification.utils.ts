import type { ApiNotification } from '../services/notifications.api'

/**
 * Parse notification data JSON string
 */
export function parseNotificationData(
  data: string | null | undefined
): any | null {
  if (!data) return null
  try {
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch {
    return null
  }
}

/**
 * Check if notification is a makeup attendance request
 */
export function isMakeupRequestNotification(
  notification: ApiNotification
): boolean {
  const data = parseNotificationData(notification.data)
  return data?.type === 'makeup_attendance_request'
}

/**
 * Get classroomId from makeup request notification
 */
export function getClassroomIdFromNotification(
  notification: ApiNotification
): string | null {
  const data = parseNotificationData(notification.data)
  return data?.classroomId || null
}
