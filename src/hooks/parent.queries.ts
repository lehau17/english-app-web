import { useQuery } from '@tanstack/react-query'
import {
  getParentChildrenApi,
  getParentDashboardApi,
  getParentNotificationsApi,
  getParentRewardsApi,
} from '../services/parent.api'
import type { ParentDashboardData } from '../types/parent.type'

export const useParentDashboardQuery = (enabled: boolean = true) =>
  useQuery<ParentDashboardData>({
    queryKey: ['parent-dashboard'],
    queryFn: async () => {
      const response = await getParentDashboardApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

export const useParentChildrenQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['parent-children'],
    queryFn: async () => {
      const response = await getParentChildrenApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentRewardsQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['parent-rewards'],
    queryFn: async () => {
      const response = await getParentRewardsApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentNotificationsQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['parent-notifications'],
    queryFn: async () => {
      const response = await getParentNotificationsApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
