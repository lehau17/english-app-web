import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { ClassroomDetailResponse } from '../types/classroom-detail.type'

export async function getClassroomDetail(id: string) {
  const response = await api.get<BaseResponse<ClassroomDetailResponse>>(
    `/private/v1/classrooms/${id}/detail`
  )
  return response.data
}
