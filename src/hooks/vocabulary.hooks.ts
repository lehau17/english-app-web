import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addListToMyCollection,
  createVocabularyList,
  createVocabularyTerm,
  createVocabularyUnit,
  getDueCards,
  getMyVocabularyLists,
  getReviewStats,
  getVocabularyList,
  getVocabularyLists,
  getVocabularyUnit,
  getVocabularyUnits,
  removeListFromMyCollection,
  resetUnitProgress,
  startReviewSession,
  submitReview,
} from '../services/vocabulary.api'
import type {
  CreateVocabularyListData,
  CreateVocabularyTermData,
  CreateVocabularyUnitData,
  ReviewMode,
  ReviewSubmission,
  VocabularyListFilters,
} from '../types/vocabulary.type'

// ==================== LISTS ====================

export const useVocabularyLists = (filters?: VocabularyListFilters) => {
  return useQuery({
    queryKey: ['vocabulary', 'lists', filters],
    queryFn: () => getVocabularyLists(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useMyVocabularyLists = () => {
  return useQuery({
    queryKey: ['vocabulary', 'my-lists'],
    queryFn: getMyVocabularyLists,
    staleTime: 2 * 60 * 1000,
  })
}

export const useVocabularyList = (id: string) => {
  return useQuery({
    queryKey: ['vocabulary', 'list', id],
    queryFn: () => getVocabularyList(id),
    enabled: !!id,
  })
}

export const useAddListToCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addListToMyCollection,
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'my-lists'] })
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'lists'] })
      // Invalidate the specific list detail
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list', listId],
      })
      // Invalidate units to update userProgress
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list', listId, 'units'],
      })
    },
  })
}

export const useRemoveListFromCollection = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeListFromMyCollection,
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'my-lists'] })
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'lists'] })
      // Invalidate the specific list detail
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list', listId],
      })
      // Invalidate units to update userProgress
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list', listId, 'units'],
      })
    },
  })
}

// ==================== UNITS ====================

export const useVocabularyUnits = (listId: string) => {
  return useQuery({
    queryKey: ['vocabulary', 'list', listId, 'units'],
    queryFn: () => getVocabularyUnits(listId),
    enabled: !!listId,
  })
}

export const useVocabularyUnit = (listId: string, unitId: string) => {
  return useQuery({
    queryKey: ['vocabulary', 'unit', unitId],
    queryFn: () => getVocabularyUnit(listId, unitId),
    enabled: !!listId && !!unitId,
  })
}

// ==================== REVIEW ====================

export const useStartReviewSession = () => {
  return useMutation({
    mutationFn: (params: {
      listId?: string
      unitId?: string
      mode: ReviewMode
      limit?: number
      includeNew?: boolean
      includeReview?: boolean
    }) => startReviewSession(params),
  })
}

export const useSubmitReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      reviews: ReviewSubmission[]
      listId?: string
      mode?: ReviewMode
      duration?: number
    }) => submitReview(data),
    onSuccess: (_, variables) => {
      // Invalidate stats and due cards
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'review', 'stats'],
      })
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'review', 'due'],
      })
      if (variables.listId) {
        queryClient.invalidateQueries({
          queryKey: ['vocabulary', 'list', variables.listId],
        })
        queryClient.invalidateQueries({ queryKey: ['vocabulary', 'my-lists'] })
      }
    },
  })
}

export const useResetUnitProgress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (unitId: string) => resetUnitProgress(unitId),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'review', 'stats'],
      })
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'review', 'due'],
      })
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list'],
      })
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'unit'],
      })
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'my-lists'] })
    },
  })
}

export const useReviewStats = (listId?: string) => {
  return useQuery({
    queryKey: ['vocabulary', 'review', 'stats', listId],
    queryFn: () => getReviewStats(listId),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useDueCards = (listId?: string, limit?: number) => {
  return useQuery({
    queryKey: ['vocabulary', 'review', 'due', listId, limit],
    queryFn: () => getDueCards({ listId, limit }),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// ==================== ADMIN ====================

export const useCreateVocabularyList = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVocabularyListData) => createVocabularyList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vocabulary', 'lists'] })
    },
  })
}

export const useCreateVocabularyUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      listId,
      data,
    }: {
      listId: string
      data: CreateVocabularyUnitData
    }) => createVocabularyUnit(listId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'list', variables.listId],
      })
    },
  })
}

export const useCreateVocabularyTerm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string
      data: CreateVocabularyTermData
    }) => createVocabularyTerm(unitId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['vocabulary', 'unit', variables.unitId],
      })
    },
  })
}
