import { useMutation, useQuery } from '@tanstack/react-query'
import {
  loginApi,
  meApi,
  parentLoginApi,
  refreshApi,
} from '../services/auth.api'
import type { LoginPayload, LoginResponse } from '../types/auth.type'
import type { User } from '../types/user.type'

export const useMeQuery = (enabled: boolean) =>
  useQuery<User>({
    queryKey: ['me'],
    queryFn: meApi,
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useLoginMutation = () =>
  useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (payload) => {
      const response = await loginApi(payload)
      return response.data
    },
  })

export const useParentLoginMutation = () =>
  useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (payload) => {
      const response = await parentLoginApi(payload)
      return response.data
    },
  })

// Dùng trong interceptor (không phải hook)
export const refreshAccessTokenFn = async (
  refreshToken: string
): Promise<string> => {
  const response = await refreshApi(refreshToken)
  return response.data.accessToken
}
