import api from '../lib/api'
import type {
  CreateVocabularyListData,
  CreateVocabularyTermData,
  CreateVocabularyUnitData,
  PaginatedVocabularyLists,
  ReviewMode,
  ReviewResult,
  ReviewSession,
  ReviewStats,
  ReviewSubmission,
  VocabularyList,
  VocabularyListFilters,
  VocabularyTerm,
  VocabularyUnit,
} from '../types/vocabulary.type'
// ==================== LISTS ====================
import type { BaseResponse } from '../types/base-response.type'

export const getVocabularyLists = async (
  filters?: VocabularyListFilters
): Promise<PaginatedVocabularyLists> => {
  const response = await api.get('/private/v1/vocabulary/lists', {
    params: filters,
  })
  return response.data.data
}

export const getMyVocabularyLists = async (): Promise<VocabularyList[]> => {
  const response = await api.get<BaseResponse<VocabularyList[]>>(
    '/private/v1/vocabulary/lists/my'
  )
  return response.data.data
}

export const getVocabularyList = async (
  id: string
): Promise<VocabularyList> => {
  const response = await api.get<BaseResponse<VocabularyList>>(
    `/private/v1/vocabulary/lists/${id}`
  )
  return response.data.data
}

export const addListToMyCollection = async (listId: string) => {
  const response = await api.post(`/private/v1/vocabulary/lists/${listId}/add`)
  return response.data
}

export const removeListFromMyCollection = async (listId: string) => {
  const response = await api.delete(
    `/private/v1/vocabulary/lists/${listId}/remove`
  )
  return response.data
}

// ==================== UNITS ====================

export const getVocabularyUnits = async (
  listId: string
): Promise<VocabularyUnit[]> => {
  const response = await api.get(`/private/v1/vocabulary/lists/${listId}/units`)
  return response.data.data
}

export const getVocabularyUnit = async (
  listId: string,
  unitId: string
): Promise<VocabularyUnit> => {
  const response = await api.get(
    `/private/v1/vocabulary/lists/${listId}/units/${unitId}`
  )
  return response.data.data
}

// ==================== REVIEW ====================

export const startReviewSession = async (params: {
  listId?: string
  unitId?: string
  mode: ReviewMode
  limit?: number
  includeNew?: boolean
  includeReview?: boolean
}): Promise<ReviewSession> => {
  const response = await api.get('/private/v1/vocabulary/review/session', {
    params,
  })
  return response.data.data
}

export const submitReview = async (data: {
  reviews: ReviewSubmission[]
  listId?: string
  mode?: ReviewMode
  duration?: number
}): Promise<ReviewResult> => {
  const response = await api.post('/private/v1/vocabulary/review/submit', data)
  return response.data.data
}

export const getReviewStats = async (listId?: string): Promise<ReviewStats> => {
  const response = await api.get('/private/v1/vocabulary/review/stats', {
    params: { listId },
  })
  return response.data.data
}

export const getDueCards = async (params: {
  listId?: string
  limit?: number
}): Promise<VocabularyTerm[]> => {
  const response = await api.get('/private/v1/vocabulary/review/due', {
    params,
  })
  return response.data.data
}

// ==================== ADMIN ====================

export const createVocabularyList = async (
  data: CreateVocabularyListData
): Promise<VocabularyList> => {
  const response = await api.post('/private/v1/admin/vocabulary/lists', data)
  return response.data.data
}

export const updateVocabularyList = async (
  id: string,
  data: Partial<CreateVocabularyListData>
): Promise<VocabularyList> => {
  const response = await api.put(
    `/private/v1/admin/vocabulary/lists/${id}`,
    data
  )
  return response.data.data
}

export const deleteVocabularyList = async (id: string) => {
  await api.delete(`/private/v1/admin/vocabulary/lists/${id}`)
}

export const createVocabularyUnit = async (
  listId: string,
  data: CreateVocabularyUnitData
): Promise<VocabularyUnit> => {
  const response = await api.post(
    `/private/v1/admin/vocabulary/lists/${listId}/units`,
    data
  )
  return response.data.data
}

export const createVocabularyTerm = async (
  unitId: string,
  data: CreateVocabularyTermData
): Promise<VocabularyTerm> => {
  const response = await api.post(
    `/private/v1/admin/vocabulary/units/${unitId}/terms`,
    data
  )
  return response.data.data
}

export const importVocabularyTerms = async (
  unitId: string,
  terms: CreateVocabularyTermData[]
) => {
  const response = await api.post(
    `/private/v1/admin/vocabulary/units/${unitId}/terms/import`,
    { terms }
  )
  return response.data
}

export const resetUnitProgress = async (
  unitId: string
): Promise<{ message: string; deletedCount: number }> => {
  const response = await api.post(
    '/private/v1/vocabulary/review/reset-progress',
    {
      unitId,
    }
  )
  return response.data.data
}
