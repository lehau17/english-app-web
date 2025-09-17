import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  CommentRepliesResponse,
  CreatePodcastCommentRequest,
  LikeCommentRequest,
  PodcastComment,
  PodcastCommentsResponse,
  ReportCommentRequest,
  UpdatePodcastCommentRequest,
  UserCommentsResponse,
} from '../types/podcast-comment.type'

export const podcastCommentApi = {
  // Tạo comment mới
  createComment: async (
    data: CreatePodcastCommentRequest
  ): Promise<BaseResponse<PodcastComment>> => {
    const response = await api.post('/private/v1/podcast-comments', data)
    return response.data
  },

  // Lấy comments của podcast
  getCommentsByPodcast: async (
    podcastId: string,
    params?: {
      page?: number
      limit?: number
      includeReplies?: boolean
    }
  ): Promise<BaseResponse<PodcastCommentsResponse>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.includeReplies !== undefined)
      queryParams.append('includeReplies', params.includeReplies.toString())

    const response = await api.get(
      `/private/v1/podcast-comments/podcast/${podcastId}?${queryParams}`
    )
    return response.data
  },

  // Lấy replies của comment
  getReplies: async (
    parentCommentId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<BaseResponse<CommentRepliesResponse>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(
      `/private/v1/podcast-comments/replies/${parentCommentId}?${queryParams}`
    )
    return response.data
  },

  // Lấy comments của user hiện tại
  getUserComments: async (params?: {
    page?: number
    limit?: number
  }): Promise<BaseResponse<UserCommentsResponse>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(
      `/private/v1/podcast-comments/user/my-comments?${queryParams}`
    )
    return response.data
  },

  // Cập nhật comment
  updateComment: async (
    commentId: string,
    data: UpdatePodcastCommentRequest
  ): Promise<BaseResponse<PodcastComment>> => {
    const response = await api.put(
      `/private/v1/podcast-comments/${commentId}`,
      data
    )
    return response.data
  },

  // Xóa comment
  deleteComment: async (
    commentId: string
  ): Promise<BaseResponse<{ message: string }>> => {
    const response = await api.delete(
      `/private/v1/podcast-comments/${commentId}`
    )
    return response.data
  },

  // Like/Unlike comment
  likeComment: async (
    commentId: string,
    data: LikeCommentRequest
  ): Promise<BaseResponse<{ likeCount: number; isLiked: boolean }>> => {
    const response = await api.post(
      `/private/v1/podcast-comments/${commentId}/like`,
      data
    )
    return response.data
  },

  // Báo cáo comment
  reportComment: async (
    commentId: string,
    data: ReportCommentRequest
  ): Promise<BaseResponse<{ message: string }>> => {
    const response = await api.post(
      `/private/v1/podcast-comments/${commentId}/report`,
      data
    )
    return response.data
  },
}
