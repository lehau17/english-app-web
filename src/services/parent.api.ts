import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  ParentChildProgressItem,
  ParentDashboardData,
} from '../types/parent.type'

type PageResponse<T> = {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const getParentDashboardApi = async (): Promise<
  BaseResponse<ParentDashboardData>
> => {
  const { data } = await api.get<BaseResponse<ParentDashboardData>>(
    '/private/v1/parent/dashboard'
  )
  return data
}

export const getParentChildrenApi = async (): Promise<BaseResponse<any[]>> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    '/private/v1/parent/children'
  )
  return data
}

export const getParentRewardsApi = async (): Promise<BaseResponse<any[]>> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    '/private/v1/parent/rewards'
  )
  return data
}

export const createParentRewardApi = async (payload: {
  title: string
  description?: string
  type: 'privilege' | 'activity' | 'item' | 'experience'
  imageUrl?: string
  targetChildId: string
  cost?: number
}): Promise<BaseResponse<any>> => {
  const { data } = await api.post<BaseResponse<any>>(
    '/private/v1/parent/rewards',
    payload
  )
  return data
}

export const updateParentRewardApi = async (
  rewardId: string,
  payload: {
    title?: string
    description?: string
    type?: 'privilege' | 'activity' | 'item' | 'experience'
    imageUrl?: string
    targetChildId?: string
    cost?: number
  }
): Promise<BaseResponse<any>> => {
  const { data } = await api.put<BaseResponse<any>>(
    `/private/v1/parent/rewards/${rewardId}`,
    payload
  )
  return data
}

export const deleteParentRewardApi = async (
  rewardId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.delete<BaseResponse<any>>(
    `/private/v1/parent/rewards/${rewardId}`
  )
  return data
}

export const toggleParentRewardApi = async (
  rewardId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.patch<BaseResponse<any>>(
    `/private/v1/parent/rewards/${rewardId}/toggle`
  )
  return data
}

export const getParentNotificationsApi = async (): Promise<
  BaseResponse<any[]>
> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    '/private/v1/parent/notifications'
  )
  return data
}

export const updateChildNotificationSettingsApi = async (
  childId: string,
  settings: any
): Promise<BaseResponse<any>> => {
  const { data } = await api.patch<BaseResponse<any>>(
    `/private/v1/parent/children/${childId}/settings`,
    settings
  )
  return data
}

export const getChildNotificationSettingsApi = async (
  childId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.get<BaseResponse<any>>(
    `/private/v1/parent/children/${childId}/settings`
  )
  return data
}

export type ParentActivitiesQuery = {
  page?: number
  limit?: number
  childId?: string
  type?: string
  status?: string
  from?: string
  to?: string
}

export const getParentActivitiesApi = async (
  params?: ParentActivitiesQuery
): Promise<BaseResponse<PageResponse<any>>> => {
  const { data } = await api.get<BaseResponse<PageResponse<any>>>(
    '/private/v1/parent/activities',
    { params }
  )
  return data
}

export const getParentChildProgressApi = async (
  childId: string,
  params?: { from?: string; to?: string; page?: number; limit?: number }
): Promise<BaseResponse<PageResponse<ParentChildProgressItem>>> => {
  const { data } = await api.get<
    BaseResponse<PageResponse<ParentChildProgressItem>>
  >(`/private/v1/parent/children/${childId}/progress`, { params })

  return data
}

// Payment related APIs
export const getParentUnpaidClassroomsApi = async (): Promise<
  BaseResponse<any[]>
> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    '/private/v1/parent/unpaid-classrooms'
  )
  return data
}

export const getParentPaymentSummaryApi = async (): Promise<
  BaseResponse<any>
> => {
  const { data } = await api.get<BaseResponse<any>>(
    '/private/v1/parent/payment-summary'
  )
  return data
}

// ==================== LINK REQUEST APIs ====================

export const createLinkRequestApi = async (
  studentIdentifier: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.post<BaseResponse<any>>(
    '/private/v1/parent-child/request',
    { studentIdentifier }
  )
  return data
}

export interface ParentChildrenGrades {
  children: {
    childId: string
    childName: string
    classrooms: {
      classroomId: string
      classroomName: string
      courseName: string
      midterm?: number | null
      final?: number | null
      tests?: number | null
      activities?: number | null
      finalGrade: number
    }[]
  }[]
}

export const getParentChildrenGradesApi = async (): Promise<
  BaseResponse<ParentChildrenGrades>
> => {
  const { data } = await api.get<BaseResponse<ParentChildrenGrades>>(
    '/private/v1/parent/children/grades'
  )
  return data
}

export const exportParentChildrenGradesApi = async (): Promise<Blob> => {
  const response = await api.get('/private/v1/parent/children/grades/export', {
    responseType: 'blob',
  })
  return response.data
}

export interface AssignmentDetail {
  assignmentId: string
  title: string
  type: string
  totalPoints: number
  weight: number
  score: number | null
  maxScore: number
  submissionId: string | null
  submittedAt: string | null
  gradedAt: string | null
  feedback: string | null
  attemptCount: number
}

export interface ActivityDetail {
  activityId: string
  title: string
  type: string
  lessonTitle: string
  bestScore: number | null
  currentScore: number | null
  attemptsCount: number
  state: string
  timeSpentSec: number
}

export interface ChildGradeDetails {
  studentId: string
  studentName: string
  classroomId: string
  classroomName: string
  assignments: {
    midterm: AssignmentDetail[]
    final: AssignmentDetail[]
    tests: AssignmentDetail[]
  }
  activities: ActivityDetail[]
}

// Learning Path APIs for Parent
export const getParentLearningPathsOverviewApi = async (): Promise<
  BaseResponse<{
    children: Array<{
      childId: string
      childName: string
      activePath: {
        id: string
        name: string
        currentStep: number
        totalSteps: number
        isCompleted: boolean
      } | null
      totalPaths: number
      progress: number
    }>
  }>
> => {
  const { data } = await api.get<
    BaseResponse<{
      children: Array<{
        childId: string
        childName: string
        activePath: {
          id: string
          name: string
          currentStep: number
          totalSteps: number
          isCompleted: boolean
        } | null
        totalPaths: number
        progress: number
      }>
    }>
  >('/private/v1/parent/learning-paths/overview')
  return data
}

export const getParentChildLearningPathsApi = async (
  childId: string,
  params?: { isCompleted?: boolean }
): Promise<BaseResponse<any[]>> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    `/private/v1/parent/children/${childId}/learning-paths`,
    { params }
  )
  return data
}

export const getParentChildActiveLearningPathApi = async (
  childId: string
): Promise<BaseResponse<any | null>> => {
  const { data } = await api.get<BaseResponse<any | null>>(
    `/private/v1/parent/children/${childId}/learning-paths/active`
  )
  return data
}

export const getParentChildLearningPathDetailApi = async (
  childId: string,
  pathId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.get<BaseResponse<any>>(
    `/private/v1/parent/children/${childId}/learning-paths/${pathId}`
  )
  return data
}

export const getParentChildLearningPathProgressApi = async (
  childId: string,
  pathId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.get<BaseResponse<any>>(
    `/private/v1/parent/children/${childId}/learning-paths/${pathId}/progress`
  )
  return data
}

export const getChildGradeDetailsApi = async (
  classroomId: string,
  childId: string
): Promise<ChildGradeDetails> => {
  const response = await api.get<{
    statusCode: number
    message: string
    data: ChildGradeDetails
  }>(
    `/private/v1/gradebook/classrooms/${classroomId}/students/${childId}/details`
  )
  return response.data.data
}

// Export as parentApi object for consistency
export const parentApi = {
  getDashboard: getParentDashboardApi,
  getChildren: getParentChildrenApi,
  getRewards: getParentRewardsApi,
  createReward: createParentRewardApi,
  updateReward: updateParentRewardApi,
  deleteReward: deleteParentRewardApi,
  toggleReward: toggleParentRewardApi,
  getNotifications: getParentNotificationsApi,
  updateChildNotificationSettings: updateChildNotificationSettingsApi,
  getChildNotificationSettings: getChildNotificationSettingsApi,
  getActivities: getParentActivitiesApi,
  getChildProgress: getParentChildProgressApi,
  getUnpaidClassrooms: getParentUnpaidClassroomsApi,
  getPaymentSummary: getParentPaymentSummaryApi,
  createLinkRequest: createLinkRequestApi,
  getChildrenGrades: getParentChildrenGradesApi,
  exportChildrenGrades: exportParentChildrenGradesApi,
}
