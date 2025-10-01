import api from '../lib/api'

// Types matching the backend DTOs
export interface CreatePlaylistDto {
  name: string
  description?: string
  isPublic?: boolean
  thumbnailUrl?: string
  tags?: string[]
  category?: string
}

export interface UpdatePlaylistDto {
  name?: string
  description?: string
  isPublic?: boolean
  thumbnailUrl?: string
  tags?: string[]
  category?: string
}

export interface AddToPlaylistDto {
  podcastId: string
}

export interface RemoveFromPlaylistDto {
  podcastId: string
}

export interface GetPlaylistsQueryDto {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'newest' | 'oldest' | 'name' | 'updated'
  sortOrder?: 'asc' | 'desc'
  privacy?: 'public' | 'private'
}

// Response types matching backend entities
export interface PlaylistUser {
  id: string
  displayName: string
  firstName: string
  lastName: string
  avatarUrl?: string
}

export interface Playlist {
  id: string
  name: string
  description?: string
  isPublic: boolean
  isSystem: boolean
  thumbnailUrl?: string
  tags: string[]
  category?: string
  podcastCount: number
  totalDuration: number
  playCount: number
  likeCount: number
  user: PlaylistUser
  createdAt: string
  updatedAt: string
}

export interface PodcastAuthor {
  id: string
  displayName: string
  firstName: string
  lastName: string
  avatarUrl?: string
}

export interface PodcastInPlaylist {
  id: string
  code: string
  title: string
  description: string
  audioUrl: string
  thumbnailUrl?: string
  transcript: string
  averageRating?: number
  difficultyRating?: number
  qualityRating?: number
  totalRatings: number
  category: string
  difficulty: string
  duration: number
  viewCount: number
  authorId: string
  author?: PodcastAuthor
  createdAt: string
  updatedAt: string
}

export interface PlaylistItem {
  orderNo: number
  addedAt: string
  podcast: PodcastInPlaylist
}

export interface PlaylistItemsResponse {
  playlist: {
    id: string
    name: string
    description?: string
    isPublic: boolean
    podcastCount: number
    user: PlaylistUser
    createdAt: string
    updatedAt: string
  }
  items: PlaylistItem[]
}

export interface PageResponse<T> {
  items: T[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}

export const playlistApi = {
  // Get user playlists with pagination and filters
  getUserPlaylists: async (
    query?: GetPlaylistsQueryDto
  ): Promise<PageResponse<Playlist>> => {
    const response = await api.get('/private/v1/playlists', { params: query })
    return response.data.data
  },

  // Get a single playlist by ID
  getById: async (id: string): Promise<Playlist> => {
    const response = await api.get(`/private/v1/playlists/${id}`)
    return response.data.data
  },

  // Create a new playlist
  create: async (data: CreatePlaylistDto): Promise<Playlist> => {
    const response = await api.post('/private/v1/playlists', data)
    return response.data.data
  },

  // Update an existing playlist
  update: async (id: string, data: UpdatePlaylistDto): Promise<Playlist> => {
    const response = await api.patch(`/private/v1/playlists/${id}`, data)
    return response.data.data
  },

  // Delete a playlist
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/private/v1/playlists/${id}`)
    return response.data.data
  },

  // Add a podcast to playlist
  addPodcast: async (
    playlistId: string,
    data: AddToPlaylistDto
  ): Promise<{ message: string }> => {
    const response = await api.post(
      `/private/v1/playlists/${playlistId}/items`,
      data
    )
    return response.data.data
  },

  // Remove a podcast from playlist
  removePodcast: async (
    playlistId: string,
    podcastId: string
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/private/v1/playlists/${playlistId}/items/${podcastId}`
    )
    return response.data.data
  },

  // Get playlist items with podcast details
  getPlaylistItems: async (
    playlistId: string
  ): Promise<PlaylistItemsResponse> => {
    const response = await api.get(`/private/v1/playlists/${playlistId}/items`)
    return response.data.data
  },
}
