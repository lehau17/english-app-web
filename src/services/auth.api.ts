import api from '../lib/api'
import type { LoginPayload, LoginResponse } from '../types/auth.type'
import type { BaseResponse } from '../types/base-response.type'
import type { User } from '../types/user.type'

export type RefreshResponse = { accessToken: string }

export const loginApi = async (
  payload: LoginPayload
): Promise<BaseResponse<LoginResponse>> => {
  const { data } = await api.post<BaseResponse<LoginResponse>>(
    '/public/v1/auth/student-login',
    payload
  )
  return data
}

export const parentLoginApi = async (
  payload: LoginPayload
): Promise<BaseResponse<LoginResponse>> => {
  const { data } = await api.post<BaseResponse<LoginResponse>>(
    '/public/v1/auth/parent-login',
    payload
  )
  return data
}

export const refreshApi = async (
  refreshToken: string
): Promise<BaseResponse<LoginResponse>> => {
  const { data } = await api.post<BaseResponse<LoginResponse>>(
    '/auth/refresh',
    { refreshToken },
    { headers: { Authorization: '' } }
  )
  return data
}

export const meApi = async (): Promise<User> => {
  const { data } = await api.get('private/v1/auth/me')
  return data
}
