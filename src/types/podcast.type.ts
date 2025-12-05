// Media type enum
export enum PodcastMediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

// Unified create podcast data - matches backend CreatePodcastDto
export interface CreatePodcastGapData {
  startIndex: number
  endIndex: number
  answer: string
  orderNo?: number
}

// Gap interface for existing gaps (includes id)
export interface PodcastGap {
  id: string
  startIndex: number
  endIndex: number
  answer: string
  orderNo: number
}

// Update gap data (id optional - if present, update; if absent, create)
export interface UpdatePodcastGapData {
  id?: string
  startIndex: number
  endIndex: number
  answer: string
  orderNo?: number
}

export interface CreatePodcastData {
  title: string
  description: string
  content: string // transcript cho upload hoặc text cho generate
  audioUrl?: string // Optional for video
  videoUrl?: string // New for video
  mediaType: PodcastMediaType // New field
  thumbnailUrl?: string
  category: string
  difficulty: string
  audioMode: 'upload' | 'generate'
  voiceType?: string
  speechSpeed?: number
  duration?: number
  tags?: string[]
  gaps: CreatePodcastGapData[] // Frontend sẽ tự tính từ [word] format
}

export interface PodcastActivity {
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

export interface Podcast {
  id: string
  title: string
  description: string
  audioUrl?: string // Optional now
  videoUrl?: string // New field
  mediaType: PodcastMediaType // New field
  duration: number
  transcript: string
  category: string
  difficulty: string
  tags: string[]
  status: string
  code: string
  createdAt: string
  updatedAt: string
  gaps?: PodcastGap[] // Gaps for fill-in-the-blank
  isPublic?: boolean // Public/private status
}

export interface CreatePodcastResponse {
  id: string
  title: string
  audioUrl: string
}

// Update podcast data
export interface UpdatePodcastData {
  title?: string
  description?: string
  isPublic?: boolean
  gaps?: UpdatePodcastGapData[]
}
