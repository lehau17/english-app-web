import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { DifficultyLevel } from '../types/activity.types'

export interface Topic {
  id: string
  name: string
  description?: string
  category?: string
  difficulty: DifficultyLevel
  isActive: boolean
  isFeatured: boolean
  usageCount: number
  trendScore: number
  createdAt: string
  updatedAt: string
  isTrending?: boolean
}

export interface UseTopicsFilters {
  category?: string
  difficulty?: DifficultyLevel
  isActive?: boolean
  isFeatured?: boolean
  trending?: boolean
}

interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export const useTopics = (filters?: UseTopicsFilters) => {
  return useQuery({
    queryKey: ['topics', filters],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Topic[]>>(
        '/private/v1/topics',
        {
          params: filters,
        }
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: ['topics', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Topic>>(
        `/private/v1/topics/${id}`
      )
      return response.data.data
    },
    enabled: !!id,
  })
}
