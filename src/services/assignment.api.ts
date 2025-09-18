import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { AssignmentCreateRequest } from '../types/assignment.type'

type PageResponse<T> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type AssignmentSubmission = {
  id: string
  student: {
    id: string
    firstName: string
    lastName: string
    displayName?: string | null
    avatarUrl?: string | null
  }
  score?: number | null
  status: 'submitted' | 'graded' | 'late' | 'missing'
  attempt: number
  submittedAt?: string | null
}

export async function createAssignment(
  classroomId: string,
  payload: AssignmentCreateRequest
) {
  const res = await api.post<BaseResponse<any>>(
    `/private/v1/classrooms/${classroomId}/assignments`,
    payload
  )
  return res.data
}

export async function updateAssignment(
  classroomId: string,
  assignmentId: string,
  payload: Partial<AssignmentCreateRequest>
) {
  const res = await api.put<BaseResponse<any>>(
    `/private/v1/classrooms/${classroomId}/assignments/${assignmentId}`,
    payload
  )
  return res.data
}

export async function deleteAssignment(
  classroomId: string,
  assignmentId: string
) {
  const res = await api.delete<BaseResponse<any>>(
    `/private/v1/classrooms/${classroomId}/assignments/${assignmentId}`
  )
  return res.data
}

export async function setAssignmentPublish(
  classroomId: string,
  assignmentId: string,
  isPublished: boolean
) {
  return updateAssignment(classroomId, assignmentId, { isPublished })
}

export async function getAssignmentSubmissions(
  classroomId: string,
  assignmentId: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  const res = await api.get<BaseResponse<PageResponse<AssignmentSubmission>>>(
    `/private/v1/classrooms/${classroomId}/assignments/${assignmentId}/submissions`,
    { params }
  )
  return res.data
}
