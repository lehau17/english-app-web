import api from '../lib/api'
import type { AssignmentCreateRequest } from '../types/assignment.type'
import type { BaseResponse } from '../types/base-response.type'

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

// New APIs for assignment taking flow
export async function getAssignmentForTaking(assignmentId: string) {
  const res = await api.get<BaseResponse<any>>(
    `/private/v1/assignments/${assignmentId}`
  )
  return res.data
}

export async function submitAssignment(
  assignmentId: string,
  payload: {
    answers: Record<string, any>
    timeSpent?: number
    notes?: string
  }
) {
  const res = await api.post<BaseResponse<any>>(
    `/private/v1/assignments/${assignmentId}/submit`,
    payload
  )
  return res.data
}

export async function getMySubmissionResult(assignmentId: string) {
  const res = await api.get<BaseResponse<any>>(
    `/private/v1/assignments/${assignmentId}/my-submission`
  )
  return res.data
}

export async function getMySubmissionHistory(assignmentId: string) {
  const res = await api.get<BaseResponse<any>>(
    `/private/v1/assignments/${assignmentId}/my-submission-history`
  )
  return res.data
}

// Import APIs
export async function downloadAssignmentTemplate() {
  const res = await api.get(`/private/v1/assignments/import/template`, {
    responseType: 'blob',
  })
  return res.data
}

export async function previewAssignmentImport(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<BaseResponse<any>>(
    `/private/v1/assignments/import/preview`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return res.data
}

export async function importAssignment(
  classroomId: string,
  file: File,
  importData?: any
) {
  const formData = new FormData()
  formData.append('file', file)

  if (importData) {
    Object.keys(importData).forEach((key) => {
      formData.append(key, importData[key])
    })
  }

  const res = await api.post<BaseResponse<any>>(
    `/private/v1/assignments/classroom/${classroomId}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return res.data
}

// PDF Download API
export async function downloadAssignmentPdf(assignmentId: string) {
  const res = await api.get(`/private/v1/assignments/${assignmentId}/pdf`, {
    responseType: 'blob',
  })
  return res.data
}

// Utility function to download PDF from blob
export function downloadPdfFromBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Upload audio for speaking/pronunciation activities
export async function uploadActivityAudio(
  audioBlob: Blob
): Promise<{ audioUrl: string }> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')

  const res = await api.post<BaseResponse<{ url: string }>>(
    `/private/v1/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return { audioUrl: res.data.data.url }
}
