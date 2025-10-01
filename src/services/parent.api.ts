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

export const getParentActivitiesApi = async (): Promise<BaseResponse<any>> => {
  const { data } = await api.get<BaseResponse<any>>(
    '/private/v1/parent/activities'
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
}
