export type ActivityType =
  | 'vocab'
  | 'pronunciation'
  | 'listening'
  | 'speaking'
  | 'mini_game'
  | 'reading'
  | 'writing'
  | 'grammar'
  | 'quiz'
  | 'flashcard'
  | 'conversation'
  | 'fill_blank'
  | 'dictation'
  | 'matching'

export type ProgressState =
  | 'not_started'
  | 'in_progress'
  | 'done'
  | 'review_needed'
  | 'mastered'

export interface ActivityBase {
  id: string
  lessonId: string
  orderNo: number
  type: ActivityType
  title: string
  passingScore?: number
  state?: ProgressState
  materials?: Array<{ label: string; url: string }>
  hints?: string[]
}

export interface VocabItem {
  word: string
  definition: string
  examples?: string[]
  imageUrl?: string
  audioUrl?: string
}

export interface VocabContent {
  items: VocabItem[]
}

// Quiz question item (used in multiple format)
export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

// Quiz content: supports both single question and multiple questions
export interface QuizContent {
  // Single format
  question?: string
  options?: string[]
  correctIndex?: number
  explanation?: string
  // Multiple format
  questions?: QuizQuestion[]
}
export interface ListeningQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export interface ListeningContent {
  audioUrl: string
  instructions: string
  questions: ListeningQuestion[]
}
export interface PronunciationContent {
  phrase: string
  tips?: string[]
  sampleUrl?: string
}
export interface SpeakingContent {
  prompt: string
  minSeconds?: number
  tips?: string[]
}
export interface MiniGameContent {
  target: string
  pool: string[]
  rounds: number
}
// Reading question item (used in multiple format)
export interface ReadingQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

// Reading content: supports both single question and multiple questions
export interface ReadingContent {
  passage: string
  // Single format
  question?: string
  options?: string[]
  correctIndex?: number
  // Multiple format
  questions?: ReadingQuestion[]
}
export interface WritingContent {
  prompt: string
  minWords: number
  rubric?: string[]
}
// Grammar exercise item (used in multiple format)
export interface GrammarExercise {
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

// Grammar content: supports both single exercise and multiple exercises
export interface GrammarContent {
  rule: string
  // Single format
  question?: string
  options?: string[]
  correctIndex?: number
  // Multiple format
  exercises?: GrammarExercise[]
}
export interface FlashcardItem {
  front: string
  back: string
  imageUrl?: string
  audioUrl?: string
}
export interface FlashcardContent {
  cards: FlashcardItem[]
}
export interface FillBlankContent {
  passage: string
  blanks: string[]
}
export interface DictationContent {
  audioUrl: string
  transcript: string
  minWords: number
}
export interface MatchingPair {
  left: string
  right: string
}
export interface MatchingContent {
  pairs: MatchingPair[]
}
export interface ConversationMessage {
  role: 'assistant' | 'user'
  text: string
}
export interface ConversationContent {
  scenario: string
  initialDialog: ConversationMessage[]
  suggestions?: string[]
}

export type ActivityContent =
  | { kind: 'quiz'; data: QuizContent }
  | { kind: 'vocab'; data: VocabContent }
  | { kind: 'listening'; data: ListeningContent }
  | { kind: 'pronunciation'; data: PronunciationContent }
  | { kind: 'speaking'; data: SpeakingContent }
  | { kind: 'mini_game'; data: MiniGameContent }
  | { kind: 'reading'; data: ReadingContent }
  | { kind: 'writing'; data: WritingContent }
  | { kind: 'grammar'; data: GrammarContent }
  | { kind: 'flashcard'; data: FlashcardContent }
  | { kind: 'conversation'; data: ConversationContent }
  | { kind: 'fill_blank'; data: FillBlankContent }
  | { kind: 'dictation'; data: DictationContent }
  | { kind: 'matching'; data: MatchingContent }

export interface Activity extends ActivityBase {
  content: ActivityContent
}
export interface LessonMeta {
  id: string
  title: string
  orderNo: number
  description?: string
  estimatedTime?: number
  objectives?: string[]
}

export interface LessonFullResponse {
  id: string
  courseId: string
  title: string
  description?: string
  orderNo: number
  difficulty: string
  estimatedTime?: number
  isLocked: boolean
  objectives: string[]
  createdAt: string
  updatedAt: string
  activities: Activity[]
}

export interface NextActivityResponse {
  nextActivity: Activity | null
}

export interface ProgressSummaryResponse {
  lessonId: string
  userId: string
  totalActivities: number
  completedActivities: number
  completion: number // 0-100
  averageScore: number
  timeSpent: number
  lastActivityAt?: string
}

export interface StartActivityRequest {
  userId: string
  activityId: string
}

export interface StartActivityResponse {
  userId: string
  activityId: string
  state: ProgressState
}

export interface CanStartActivityRequest {
  userId: string
  activityId: string
}

export interface CanStartActivityResponse {
  allowed: boolean
  reason?: string
  unmet?: any[]
}

export interface CompleteActivityRequest {
  userId: string
  activityId: string
  score: number
}

export interface CompleteActivityResponse {
  state: ProgressState
  score: number | null
  bestScore: number | null
  attemptsCount: number
}
