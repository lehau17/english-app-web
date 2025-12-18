// Speaking Practice Types - Progress-Based 5-Level System

export interface SpeakingPracticeProgress {
  id: string
  userId: string
  currentLevel: number
  currentLevelName: string
  currentLessonId: string | null
  completedLessons: string[]
  totalLessonsCompleted: number
  totalWordsLearned: number
  averageScore: number
  practiceMinutesToday: number
  weakPhonemes: string[]
  streakDays: number
  lastPracticedAt: string | null
  totalPracticeTimeMinutes: number
  successRate: number
  nextLevelUnlocked: boolean
  unlockedLevels: number[]
}

export interface NextPracticeItem {
  lessonId: string
  lessonTitle: string
  level: number
  levelName: string
  itemType: 'words' | 'phrases' | 'sentences' | 'dialogues' | 'free_talk'
  itemId: string
  itemIndex: number
  totalItems: number
  text: string
  translation?: string
  phonetic?: string
  phonemeFocus?: string
  referenceAudioUrl?: string
  tips?: string[]
  aiPrompt: string
  referenceText: string
  targetPhonemes: string[]
  passThreshold: number
  attemptNumber: number
  maxRetries: number
  difficultyReduced: boolean
}

export interface SubmitAttemptRequest {
  lessonId: string
  itemIndex: number
  referenceText: string
  attemptNumber?: number
  audioBase64?: string
}

export interface SubmitResult {
  decision: 'accept' | 'retry'
  score: number
  breakdown: {
    pronunciation: number
    accuracy: number
    fluency: number
    completeness: number
  }
  transcript: string
  feedback: {
    text: string
    band: 'celebrate' | 'acknowledge' | 'support'
  }
  failedPhonemes: string[]
  mispronounceWords: string[]
  nextAction: 'next_item' | 'retry' | 'next_lesson' | 'level_up'
  progressUpdate: {
    levelChanged: boolean
    newLevel?: number
    lessonCompleted: boolean
    streakMaintained: boolean
  }
}

export interface PersonalizedDrill {
  id: string
  generatedAt: string
  analysis: string
  targetWords: string[]
  targetSentences: string[]
  targetPhonemes: string[]
  priority: number
  status: 'pending' | 'in_progress' | 'completed'
}

export interface DueWord {
  id: string
  word: string
  phonetic?: string
  audioUrl?: string
  errorCount: number
  attemptCount: number
  contextSentence: string | null
  problematicPhoneme: string | null
  nextReviewDate: string
  interval: number
  easeFactor: number
  repetitions: number
}

export interface DueWordsResponse {
  words: DueWord[]
  total: number
  stats: {
    totalWords: number
    dueToday: number
    masteredCount: number
    learningCount: number
    averageEaseFactor: number
  }
}
