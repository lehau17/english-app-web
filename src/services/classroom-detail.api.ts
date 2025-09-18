import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  ClassroomAnnouncement,
  ClassroomDetailResponse,
} from '../types/classroom-detail.type'

type PageResponse<T> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function getClassroomDetail(id: string) {
  const response = await api.get<BaseResponse<ClassroomDetailResponse>>(
    `/private/v1/classrooms/${id}/detail`
  )
  return response.data
}

export async function getClassroomAnnouncements(
  id: string,
  params?: { page?: number; limit?: number; search?: string; priority?: string }
) {
  const response = await api.get<
    BaseResponse<PageResponse<ClassroomAnnouncement>>
  >(`/private/v1/classrooms/${id}/announcements`, { params })
  return response.data
}

export async function createClassroomAnnouncement(
  classroomId: string,
  payload: { title: string; content: string; priority?: string }
) {
  const response = await api.post<BaseResponse<ClassroomAnnouncement>>(
    `/private/v1/classrooms/${classroomId}/announcements`,
    payload
  )
  return response.data
}
