import api from '../lib/api'

export interface VoiceType {
  MALE_EN_US: 'male_en_us'
  FEMALE_EN_US: 'female_en_us'
  MALE_EN_UK: 'male_en_uk'
  FEMALE_EN_UK: 'female_en_uk'
  MALE_EN_AU: 'male_en_au'
  FEMALE_EN_AU: 'female_en_au'
}

export interface PodcastCategory {
  EDUCATION: 'EDUCATION'
  BUSINESS: 'BUSINESS'
  TECHNOLOGY: 'TECHNOLOGY'
  ENTERTAINMENT: 'ENTERTAINMENT'
  NEWS: 'NEWS'
  LIFESTYLE: 'LIFESTYLE'
  HEALTH: 'HEALTH'
  SCIENCE: 'SCIENCE'
  HISTORY: 'HISTORY'
  CULTURE: 'CULTURE'
}

export interface PodcastDifficulty {
  BEGINNER: 'BEGINNER'
  INTERMEDIATE: 'INTERMEDIATE'
  ADVANCED: 'ADVANCED'
}

// Unified create podcast DTO - matches backend structure
export interface CreatePodcastGapDto {
  startIndex: number
  endIndex: number
  answer: string
  orderNo?: number
}

export interface CreatePodcastDto {
  title: string
  description: string
  content: string // transcript cho upload hoặc text cho generate
  audioUrl?: string // Optional - for audio podcasts
  videoUrl?: string // Optional - for video podcasts
  mediaType: 'audio' | 'video' // Required - type of media
  thumbnailUrl?: string
  category: string
  difficulty: string
  audioMode: 'upload' | 'generate'
  voiceType?: string
  speechSpeed?: number
  duration?: number
  gaps: CreatePodcastGapDto[]
}

export interface PodcastResponse {
  id: string
  title: string
  audioUrl: string
}

export const podcastApi = {
  // Unified create endpoint - handles both upload and generate modes
  create: async (data: CreatePodcastDto): Promise<PodcastResponse> => {
    const response = await api.post('/private/v1/podcasts', data)
    return response.data.data
  },

  getAll: async (params?: {
    page?: number
    limit?: number
    category?: string
    difficulty?: string
    search?: string
    source?: string
    duration?: 'short' | 'medium' | 'long'
    hasActivities?: boolean
    premium?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    // UI tabs: 'all' | 'recommended' | 'listening' | 'completed'
    tab?: 'all' | 'recommended' | 'listening' | 'completed'
  }) => {
    // forward params directly to backend; backend already supports `tab` and other filters
    const response = await api.get('/private/v1/podcasts', { params })
    return response.data.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/private/v1/podcasts/${id}`)
    return response.data.data
  },

  // AI-powered recommendations
  getAIRecommendations: async (limit?: number) => {
    const response = await api.get('/private/v1/podcasts/ai-recommendations', {
      params: { limit },
    })
    return response.data.data
  },
}
