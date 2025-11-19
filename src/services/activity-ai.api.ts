import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'

export enum ActivityType {
  VOCAB = 'vocab',
  PRONUNCIATION = 'pronunciation',
  LISTENING = 'listening',
  SPEAKING = 'speaking',
  MINI_GAME = 'mini_game',
  FILL_BLANK = 'fill_blank',
  DICTATION = 'dictation',
  MATCHING = 'matching',
  READING = 'reading',
  WRITING = 'writing',
  GRAMMAR = 'grammar',
  QUIZ = 'quiz',
  FLASHCARD = 'flashcard',
  CONVERSATION = 'conversation',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  UPPER_INTERMEDIATE = 'upper_intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface GenerateActivitiesRequest {
  courseTitle: string
  courseDescription?: string
  lessonTitle: string
  lessonDescription?: string
  userPrompt?: string
  count: number
  activityTypes?: ActivityType[]
  difficulty?: DifficultyLevel
}

export interface GeneratedActivity {
  type: ActivityType
  title: string
  content: any
  difficulty?: DifficultyLevel
  points?: number
  orderNo: number
  instructions?: string
  passingScore?: number
}

export interface GenerateActivitiesResponse {
  activities: GeneratedActivity[]
}

export async function generateActivitiesWithAI(
  payload: GenerateActivitiesRequest
): Promise<GenerateActivitiesResponse> {
  const res = await api.post<BaseResponse<GenerateActivitiesResponse>>(
    '/private/v1/admin/activities/ai-generate',
    payload
  )
  return res.data.data
}
