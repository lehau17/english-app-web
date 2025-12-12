import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { ParentActivitiesQuery } from '../services/parent.api'
import {
  acceptInvitationCode,
  cancelInvitation,
  createLinkRequestApi,
  getChildNotificationSettingsApi,
  getParentActivitiesApi,
  getParentChildActiveLearningPathApi,
  getParentChildLearningPathDetailApi,
  getParentChildLearningPathProgressApi,
  getParentChildLearningPathsApi,
  getParentChildProgressApi,
  getParentChildrenApi,
  getParentDashboardApi,
  getParentLearningPathsOverviewApi,
  getParentNotificationsApi,
  getParentRewardsApi,
  getPendingInvitations,
  studentInviteParent,
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

export const useParentActivitiesQuery = (
  params: ParentActivitiesQuery,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-activities', params],
    queryFn: async () => {
      const response = await getParentActivitiesApi(params)
      return response.data
    },
    enabled,
    retry: 1,
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  })

// Learning Path Hooks for Parent
export const useParentLearningPathsOverviewQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ['parent-learning-paths-overview'],
    queryFn: async () => {
      const response = await getParentLearningPathsOverviewApi()
      return response.data
    },
    enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentChildLearningPathsQuery = (
  childId: string | null,
  params?: { isCompleted?: boolean },
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-child-learning-paths', childId, params],
    queryFn: async () => {
      if (!childId) return []
      const response = await getParentChildLearningPathsApi(childId, params)
      return response.data
    },
    enabled: enabled && !!childId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentChildActiveLearningPathQuery = (
  childId: string | null,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-child-active-learning-path', childId],
    queryFn: async () => {
      if (!childId) return null
      const response = await getParentChildActiveLearningPathApi(childId)
      return response.data
    },
    enabled: enabled && !!childId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentChildLearningPathDetailQuery = (
  childId: string | null,
  pathId: string | null,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-child-learning-path-detail', childId, pathId],
    queryFn: async () => {
      if (!childId || !pathId) return null
      const response = await getParentChildLearningPathDetailApi(
        childId,
        pathId
      )
      return response.data
    },
    enabled: enabled && !!childId && !!pathId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

export const useParentChildLearningPathProgressQuery = (
  childId: string | null,
  pathId: string | null,
  enabled: boolean = true
) =>
  useQuery({
    queryKey: ['parent-child-learning-path-progress', childId, pathId],
    queryFn: async () => {
      if (!childId || !pathId) return null
      const response = await getParentChildLearningPathProgressApi(
        childId,
        pathId
      )
      return response.data
    },
    enabled: enabled && !!childId && !!pathId,
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

// ==================== LINK REQUEST MUTATIONS ====================

export const useCreateLinkRequestMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentIdentifier: string) => {
      const response = await createLinkRequestApi(studentIdentifier)
      return response.data
    },
    onSuccess: () => {
      // Invalidate children query để refresh danh sách con sau khi request được approve
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
      queryClient.invalidateQueries({ queryKey: ['parent-dashboard'] })
    },
  })
}

// ==================== STUDENT INVITATION HOOKS ====================

// Query: Get pending invitations
export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['parent-invitations', 'pending'],
    queryFn: async () => {
      const response = await getPendingInvitations()
      return response.data
    },
  })
}

// Mutation: Student invites parent
export const useStudentInviteParent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentInviteParent,
    onSuccess: (response) => {
      toast.success('Invitation sent successfully!')
      queryClient.invalidateQueries({ queryKey: ['parent-invitations'] })
      return response.data
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to send invitation'
      toast.error(message)
    },
  })
}

// Mutation: Cancel invitation
export const useCancelInvitation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      toast.success('Invitation cancelled')
      queryClient.invalidateQueries({ queryKey: ['parent-invitations'] })
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to cancel invitation'
      toast.error(message)
    },
  })
}

// Mutation: Parent accepts code (for parent side, not used in this phase)
export const useAcceptInvitationCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptInvitationCode,
    onSuccess: () => {
      toast.success('Invitation accepted! Parent linked successfully.')
      queryClient.invalidateQueries({ queryKey: ['parent-children'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Invalid or expired code'
      toast.error(message)
    },
  })
}
