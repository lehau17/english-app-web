// Vocabulary Types - Frontend

export interface VocabularyList {
  id: string
  title: string
  description?: string
  difficulty: string
  category?: string
  level?: string
  thumbnailUrl?: string
  bannerUrl?: string
  isPublic: boolean
  isOfficial: boolean
  totalTerms: number
  totalUnits: number
  userCount: number
  language: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  userProgress?: {
    completedTerms: number
    totalTerms: number
    lastStudiedAt?: string
    addedAt: string
  }
}

export interface VocabularyUnit {
  id: string
  listId: string
  title: string
  description?: string
  orderIndex: number
  termCount: number
  createdAt: string
  updatedAt: string
  terms?: VocabularyTerm[]
  userProgress?: {
    completedTerms: number
    totalTerms: number
  }
}

export interface VocabularyTerm {
  id: string
  unitId: string
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech?: string
  audioUrl?: string
  imageUrl?: string
  examples?: Array<{ sentence: string; translation?: string }>
  synonyms?: string[]
  antonyms?: string[]
  ipaUs?: string
  ipaUk?: string
  translationVi?: string
  orderIndex: number
  difficulty: string
  createdAt: string
  updatedAt: string
  userProgress?: UserProgress
}

export interface UserProgress {
  status: 'new' | 'learning' | 'review' | 'mastered'
  nextReviewAt: string
  correctCount: number
  wrongCount: number
  repetitions: number
  lastReviewAt?: string
}

export enum ReviewMode {
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  TYPING = 'typing',
}

export interface ReviewSession {
  terms: VocabularyTerm[]
  totalDue: number
  newCount: number
  reviewCount: number
  mode: ReviewMode
}

export interface ReviewStats {
  totalTerms: number
  newCount: number
  learningCount: number
  reviewCount: number
  masteredCount: number
  dueToday: number
  currentStreak: number
  longestStreak: number
  totalReviews: number
  lastStudiedAt?: string
}

export interface ReviewSubmission {
  termId: string
  quality: number // 0-5
}

export interface ReviewResult {
  correct: number
  wrong: number
  nextReviewDate: string
  needPractice: string[]
  mastered: string[]
}

// Create DTOs
export interface CreateVocabularyListData {
  title: string
  description?: string
  difficulty: string
  category?: string
  level?: string
  thumbnailUrl?: string
  bannerUrl?: string
  isPublic?: boolean
  language?: string
}

export interface CreateVocabularyUnitData {
  title: string
  description?: string
  orderIndex?: number
}

export interface CreateVocabularyTermData {
  word: string
  definition: string
  pronunciation?: string
  partOfSpeech?: string
  audioUrl?: string
  imageUrl?: string
  examples?: Array<{ sentence: string; translation?: string }>
  synonyms?: string[]
  antonyms?: string[]
  ipaUs?: string
  ipaUk?: string
  translationVi?: string
  orderIndex?: number
  difficulty?: string
}

// Filters
export interface VocabularyListFilters {
  category?: string
  difficulty?: string
  search?: string
  officialOnly?: boolean
  page?: number
  limit?: number
}

export interface PaginatedVocabularyLists {
  data: VocabularyList[]
  total: number
  page: number
  limit: number
  totalPages: number
}
