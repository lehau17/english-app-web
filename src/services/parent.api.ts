import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { ParentDashboardData } from '../types/parent.type'

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

export const getParentNotificationsApi = async (): Promise<
  BaseResponse<any[]>
> => {
  const { data } = await api.get<BaseResponse<any[]>>(
    '/private/v1/parent/notifications'
  )
  return data
}
