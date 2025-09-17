export interface PodcastComment {
  id: string
  userId: string
  podcastId: string
  parentId?: string
  content: string
  isEdited: boolean
  isReported: boolean
  isModerated: boolean
  likeCount: number
  replyCount: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatarUrl?: string
  }
  replies?: PodcastComment[]
}

export interface CreatePodcastCommentRequest {
  podcastId: string
  content: string
  parentId?: string
}

export interface UpdatePodcastCommentRequest {
  content: string
}

export interface LikeCommentRequest {
  isLiked: boolean
}

export interface ReportCommentRequest {
  reason: string
}

export interface PodcastCommentsResponse {
  data: PodcastComment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CommentRepliesResponse {
  data: PodcastComment[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UserCommentsResponse {
  data: (PodcastComment & {
    podcast: {
      id: string
      title: string
      thumbnailUrl?: string
    }
  })[]
  total: number
  page: number
  limit: number
  totalPages: number
}
