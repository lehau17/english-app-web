import { useMutation, useQuery } from '@tanstack/react-query'
import type { LoginPayload, LoginResponse } from '../services/auth.api'
import { loginApi, meApi, refreshApi } from '../services/auth.api'
import type { User } from '../types/auth'

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
    mutationFn: loginApi,
  })

// Dùng trong interceptor (không phải hook)
export const refreshAccessTokenFn = async (
  refreshToken: string
): Promise<string> => {
  const data = await refreshApi(refreshToken)
  return data.accessToken
}
