export interface PodcastTestResponseDto {
  podcastId: string
  title: string
  audioUrl: string
  transcript?: string
  fillBlankContent?: {
    sentences: Array<{
      id: string
      sentence: string
      correctAnswers: string[]
    }>
    timeLimit?: number
    totalQuestions: number
  }
  bestScore?: number
  attemptCount?: number
}

export interface SubmitPodcastTestDto {
  answers: Record<string, string>
  timeSpent?: number
}

export interface TestResultDto {
  id: string
  scorePercent: number
  correctCount: number
  totalQuestions: number
  timeSpent?: number
  attemptNo: number
  createdAt: Date
}
