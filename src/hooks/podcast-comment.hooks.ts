import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'react-hot-toast'; // TODO: Install react-hot-toast
import { podcastCommentApi } from '../services/podcast-comment.api'
import type {
  CreatePodcastCommentRequest,
  LikeCommentRequest,
  ReportCommentRequest,
  UpdatePodcastCommentRequest,
} from '../types/podcast-comment.type'

// Query keys
export const podcastCommentKeys = {
  all: ['podcast-comments'] as const,
  byPodcast: (podcastId: string) =>
    [...podcastCommentKeys.all, 'podcast', podcastId] as const,
  replies: (parentCommentId: string) =>
    [...podcastCommentKeys.all, 'replies', parentCommentId] as const,
  userComments: (userId?: string) =>
    [...podcastCommentKeys.all, 'user', userId] as const,
}

// Hook để lấy comments của một podcast
export const usePodcastComments = (
  podcastId: string,
  options?: {
    page?: number
    limit?: number
    includeReplies?: boolean
    enabled?: boolean
  }
) => {
  return useQuery({
    queryKey: [
      ...podcastCommentKeys.byPodcast(podcastId),
      options?.page,
      options?.limit,
      options?.includeReplies,
    ],
    queryFn: () =>
      podcastCommentApi.getCommentsByPodcast(podcastId, {
        page: options?.page,
        limit: options?.limit,
        includeReplies: options?.includeReplies,
      }),
    enabled: options?.enabled !== false,
  })
}

// Hook để lấy replies của một comment
export const useCommentReplies = (
  parentCommentId: string,
  options?: {
    page?: number
    limit?: number
    enabled?: boolean
  }
) => {
  return useQuery({
    queryKey: [
      ...podcastCommentKeys.replies(parentCommentId),
      options?.page,
      options?.limit,
    ],
    queryFn: () =>
      podcastCommentApi.getReplies(parentCommentId, {
        page: options?.page,
        limit: options?.limit,
      }),
    enabled: options?.enabled !== false,
  })
}

// Hook để lấy comments của user hiện tại
export const useUserComments = (options?: {
  page?: number
  limit?: number
  enabled?: boolean
}) => {
  return useQuery({
    queryKey: [
      ...podcastCommentKeys.userComments(),
      options?.page,
      options?.limit,
    ],
    queryFn: () =>
      podcastCommentApi.getUserComments({
        page: options?.page,
        limit: options?.limit,
      }),
    enabled: options?.enabled !== false,
  })
}

// Hook để tạo comment
export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePodcastCommentRequest) =>
      podcastCommentApi.createComment(data),
    onSuccess: (response, variables) => {
      // Invalidate comments của podcast này
      queryClient.invalidateQueries({
        queryKey: podcastCommentKeys.byPodcast(variables.podcastId),
      })

      // Nếu là reply, invalidate cả replies của parent comment
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: podcastCommentKeys.replies(variables.parentId),
        })
      }

      // toast.success('Đã thêm bình luận thành công!');
      console.log('Đã thêm bình luận thành công!')
    },
    onError: (error: any) => {
      // toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm bình luận');
      console.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi thêm bình luận'
      )
    },
  })
}

// Hook để cập nhật comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string
      data: UpdatePodcastCommentRequest
    }) => podcastCommentApi.updateComment(commentId, data),
    onSuccess: () => {
      // Invalidate tất cả comment queries
      queryClient.invalidateQueries({
        queryKey: podcastCommentKeys.all,
      })

      // toast.success('Đã cập nhật bình luận!');
      console.log('Đã cập nhật bình luận!')
    },
    onError: (error: any) => {
      // toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bình luận');
      console.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bình luận'
      )
    },
  })
}

// Hook để xóa comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) =>
      podcastCommentApi.deleteComment(commentId),
    onSuccess: () => {
      // Invalidate tất cả comment queries
      queryClient.invalidateQueries({
        queryKey: podcastCommentKeys.all,
      })

      // toast.success('Đã xóa bình luận!');
      console.log('Đã xóa bình luận!')
    },
    onError: (error: any) => {
      // toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bình luận');
      console.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa bình luận'
      )
    },
  })
}

// Hook để like/unlike comment
export const useLikeComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string
      data: LikeCommentRequest
    }) => podcastCommentApi.likeComment(commentId, data),
    onSuccess: () => {
      // Invalidate tất cả comment queries để update like count
      queryClient.invalidateQueries({
        queryKey: podcastCommentKeys.all,
      })
    },
    onError: (error: any) => {
      // toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
      console.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })
}

// Hook để báo cáo comment
export const useReportComment = () => {
  return useMutation({
    mutationFn: ({
      commentId,
      data,
    }: {
      commentId: string
      data: ReportCommentRequest
    }) => podcastCommentApi.reportComment(commentId, data),
    onSuccess: () => {
      // toast.success('Đã báo cáo bình luận!');
      console.log('Đã báo cáo bình luận!')
    },
    onError: (error: any) => {
      // toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo');
      console.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo'
      )
    },
  })
}
