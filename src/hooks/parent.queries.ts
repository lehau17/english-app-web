import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getChildNotificationSettingsApi,
  getParentActivitiesApi,
  getParentChildrenApi,
  getParentDashboardApi,
  getParentNotificationsApi,
  getParentChildProgressApi,
  getParentRewardsApi,
  updateChildNotificationSettingsApi,
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

export const useChildNotificationSettingsQuery = (
  childId: string,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['child-notification-settings', childId],
    queryFn: async () => {
      const response = await getChildNotificationSettingsApi(childId)
      return response.data
    },
    enabled: enabled && !!childId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useUpdateChildNotificationSettingsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      childId,
      settings,
    }: {
      childId: string
      settings: any
    }) => {
      const response = await updateChildNotificationSettingsApi(
        childId,
        settings
      )
      return response.data
    },
    onSuccess: (_, { childId }) => {
      queryClient.invalidateQueries({
        queryKey: ['child-notification-settings', childId],
      })
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard'] })
    },
  })
}

export const useParentActivitiesQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['parent-activities'],
    queryFn: async () => {
      const response = await getParentActivitiesApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentChildProgressQuery = (
  childId: string | null,
  params: { from?: string; to?: string; page?: number; limit?: number },
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-child-progress', childId, params],
    queryFn: async () => {
      const response = await getParentChildProgressApi(
        childId as string,
        params
      )
      return response.data
    },
    enabled: enabled && !!childId,
    retry: 1,
    staleTime: 60 * 1000,
  })
