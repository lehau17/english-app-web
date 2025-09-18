import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export interface User {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
  avatarUrl?: string
  role?: string
}

export interface PaginatedUsers {
  data: User[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export async function searchUsers(
  query: string,
  params?: {
    page?: number
    limit?: number
  }
): Promise<PaginatedUsers> {
  const { data } = await api.get<BaseResponse<PaginatedUsers>>(
    '/private/v1/users/search',
    {
      params: {
        q: query,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    }
  )
  return data.data
}
