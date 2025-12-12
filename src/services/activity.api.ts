import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export interface Activity {
  id: string
  lessonId: string
  classroomId?: string
  type: string
  title: string
  content: any
  orderNo: number
  difficulty?: string
  points?: number
  passingScore?: string
  hints?: string[]
  createdAt: string
  updatedAt: string
}

// Get activity by ID
export const fetchActivityById = async (
  id: string
): Promise<BaseResponse<Activity>> => {
  const { data } = await api.get<BaseResponse<Activity>>(
    `/private/v1/activities/${id}`
  )
  return data
}

// Get multiple activities by IDs
export const fetchActivitiesByIds = async (
  ids: string[]
): Promise<BaseResponse<Activity[]>> => {
  // Since there's no bulk endpoint, fetch individually
  const activities = await Promise.all(ids.map((id) => fetchActivityById(id)))
  return {
    statusCode: 200,
    data: activities.map((res) => res.data).filter(Boolean) as Activity[],
    message: 'Activities fetched successfully',
  }
}
