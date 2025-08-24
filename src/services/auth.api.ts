import api from '../lib/api'
import type { User } from '../types/auth'

export type LoginPayload = { email: string; password: string }
export type LoginResponse = {
  accessToken: string
  refreshToken?: string | null
  user: User
}
export type RefreshResponse = { accessToken: string }

export const loginApi = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const refreshApi = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  const { data } = await api.post(
    '/auth/refresh',
    { refreshToken },
    { headers: { Authorization: '' } } // không gửi Bearer cũ
  )
  return data
}

export const meApi = async (): Promise<User> => {
  const { data } = await api.get('/auth/me')
  return data
}
