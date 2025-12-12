import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export interface LearningPath {
  id: string
  userId: string
  name: string
  targetLevel: string
  focusAreas: string[]
  courseIds: string[]
  currentStep: number
  isCompleted: boolean
  timeframe?: number
  customContent?: Record<string, any>
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CreateLearningPathRequest {
  name: string
  targetLevel: string
  focusAreas: string[]
  courseIds: string[]
  timeframe?: number
  customContent?: Record<string, any>
}

export interface UpdateLearningPathRequest {
  name?: string
  targetLevel?: string
  focusAreas?: string[]
  courseIds?: string[]
  timeframe?: number
  customContent?: Record<string, any>
}

export interface LearningPathProgress {
  totalSteps: number
  completedSteps: number
  percentage: number
  currentStep: number
  isCompleted: boolean
}

export interface GenerateLearningPathForNewStudentRequest {
  targetLevel?: string
  focusAreas?: string[]
  timeframe?: number
}

export interface GenerateLearningPathForExistingStudentRequest {
  updateReason: string
}

// Get all learning paths for current user
export const fetchLearningPaths = async (params?: {
  isCompleted?: boolean
}): Promise<BaseResponse<LearningPath[]>> => {
  const { data } = await api.get<BaseResponse<LearningPath[]>>(
    '/private/v1/learning-paths',
    { params }
  )
  return data
}

// Get active learning path
export const fetchActiveLearningPath = async (): Promise<
  BaseResponse<LearningPath | null>
> => {
  const { data } = await api.get<BaseResponse<LearningPath | null>>(
    '/private/v1/learning-paths/active'
  )
  return data
}

// Get learning path by ID
export const fetchLearningPathById = async (
  id: string
): Promise<BaseResponse<LearningPath>> => {
  const { data } = await api.get<BaseResponse<LearningPath>>(
    `/private/v1/learning-paths/${id}`
  )
  return data
}

// Create learning path
export const createLearningPath = async (
  request: CreateLearningPathRequest
): Promise<BaseResponse<LearningPath>> => {
  const { data } = await api.post<BaseResponse<LearningPath>>(
    '/private/v1/learning-paths',
    request
  )
  return data
}

// Update learning path
export const updateLearningPath = async (
  id: string,
  request: UpdateLearningPathRequest
): Promise<BaseResponse<LearningPath>> => {
  const { data } = await api.put<BaseResponse<LearningPath>>(
    `/private/v1/learning-paths/${id}`,
    request
  )
  return data
}

// Delete learning path
export const deleteLearningPath = async (id: string): Promise<void> => {
  await api.delete(`/private/v1/learning-paths/${id}`)
}

// Advance to next step
export const advanceLearningPathStep = async (
  id: string
): Promise<BaseResponse<LearningPath>> => {
  const { data } = await api.post<BaseResponse<LearningPath>>(
    `/private/v1/learning-paths/${id}/advance`
  )
  return data
}

// Get learning path progress
export const fetchLearningPathProgress = async (
  id: string
): Promise<BaseResponse<LearningPathProgress>> => {
  const { data } = await api.get<BaseResponse<LearningPathProgress>>(
    `/private/v1/learning-paths/${id}/progress`
  )
  return data
}

// Generate learning path for new student
export const generateLearningPathForNewStudent = async (
  request?: GenerateLearningPathForNewStudentRequest
): Promise<BaseResponse<{ pathId: string }>> => {
  const { data } = await api.post<BaseResponse<{ pathId: string }>>(
    '/private/v1/learning-paths/generate/new-student',
    request || {}
  )
  return data
}

// Generate learning path for existing student
export const generateLearningPathForExistingStudent = async (
  request: GenerateLearningPathForExistingStudentRequest
): Promise<BaseResponse<{ pathId: string }>> => {
  const { data } = await api.post<BaseResponse<{ pathId: string }>>(
    '/private/v1/learning-paths/generate/existing-student',
    request
  )
  return data
}
