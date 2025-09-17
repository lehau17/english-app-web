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

export interface CreatePodcastFromTextDto {
  title: string
  description?: string
  textContent: string
  voiceType?: string
  speechSpeed?: number
  category: string
  difficulty: string
  thumbnailUrl?: string
  tags?: string[]
  numberOfBlanks?: number
  questionDifficulty?: 'easy' | 'medium' | 'hard'
  timeLimit?: number
}

export interface CreatePodcastDto {
  code: string
  title: string
  subtitle?: string
  description: string
  audioUrl: string
  thumbnailUrl?: string
  transcript?: string
  fillBlankContent?: {
    sentences: Array<{
      id: string
      sentence: string
      correctAnswers: string[]
    }>
    timeLimit: number
    totalQuestions: number
  }
  category: string
  source: string
  difficulty?: string
  tags?: string[]
  duration?: number
  durationFormatted?: string
  slug?: string
  keywords?: string[]
  isRecommended?: boolean
  isPremium?: boolean
  authorName?: string
}

export interface PodcastResponse {
  podcast: {
    id: string
    title: string
    description: string
    audioUrl: string
    duration: number
    transcript: string
    category: string
    difficulty: string
    tags: string[]
    status: string
    code: string
    createdAt: string
    updatedAt: string
  }
  activity: {
    id: string
    type: string
    title: string
    description: string
    content: {
      type: string
      totalQuestions: number
      questions: Array<{
        id: string
        sentence: string
        correctAnswers: string[]
      }>
    }
    points: number
  }
  audioGeneration: {
    success: boolean
    audioUrl: string
    duration: number
  }
}

export const podcastApi = {
  createFromText: async (
    data: CreatePodcastFromTextDto
  ): Promise<PodcastResponse> => {
    const response = await api.post('/private/v1/podcasts/from-text', data)
    return response.data.data
  },

  create: async (data: CreatePodcastDto): Promise<any> => {
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
}
