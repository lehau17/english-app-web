import api from '../lib/api'
import type { LoginPayload, LoginResponse } from '../types/auth.type'
import type { BaseResponse } from '../types/base-response.type'
import type { User } from '../types/user.type'

export type RefreshResponse = { accessToken: string }

export interface UpdateProfilePayload {
  displayName?: string
  bio?: string
  nationality?: string
  timezone?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

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
  const { data } =
    await api.get<import('../types/base-response.type').BaseResponse<User>>(
      'private/v1/auth/me'
    )
  // unwrap global envelope
  return data.data
}

// Update profile của current user
export const updateProfileApi = async (
  userId: string,
  payload: UpdateProfilePayload
): Promise<User> => {
  const { data } = await api.put<BaseResponse<User>>(
    `/private/v1/students/${userId}`,
    payload
  )
  return data.data
}

// Change password
export const changePasswordApi = async (
  payload: ChangePasswordPayload
): Promise<void> => {
  await api.post('/private/v1/auth/change-password', payload)
}
