// Podcast attempt types
export interface PodcastGap {
  id: string
  orderNo: number
  startIndex: number
  endIndex: number
  length: number // Maximum number of characters allowed
  answer?: string // User's input
  isCorrect?: boolean // For showing results
}

export interface PodcastAttempt {
  podcastId: string
  title: string
  transcriptMasked: string
  gaps: PodcastGap[]
  attemptId: string
  attemptNo: number
  status: 'in_progress' | 'completed' | 'paused'
  metadata: {
    duration: number
    difficulty: string
    authorId: string
  }
  timeSpent?: number // in seconds
  answers?: Record<string, string> // gapId to answer mapping
}

export interface StartPodcastResponse {
  statusCode: number
  message: string
  data: PodcastAttempt
}

export interface SubmitAnswerRequest {
  attemptId: string
  gapId: string
  answer: string
}

export interface SubmitAnswerResponse {
  statusCode: number
  message: string
  data: {
    isCorrect: boolean
    correctAnswer: string
    score: number
  }
}
