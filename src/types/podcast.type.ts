// Unified create podcast data - matches backend CreatePodcastDto
export interface CreatePodcastGapData {
  startIndex: number
  endIndex: number
  answer: string
  orderNo?: number
}

export interface CreatePodcastData {
  title: string
  description: string
  content: string // transcript cho upload hoặc text cho generate
  audioUrl: string
  thumbnailUrl?: string
  category: string
  difficulty: string
  audioMode: 'upload' | 'generate'
  voiceType?: string
  speechSpeed?: number
  duration?: number
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

export interface CreatePodcastResponse {
  id: string
  title: string
  audioUrl: string
}
