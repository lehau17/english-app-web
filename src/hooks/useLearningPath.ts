import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  advanceLearningPathStep,
  createLearningPath,
  deleteLearningPath,
  fetchActiveLearningPath,
  fetchLearningPathById,
  fetchLearningPathProgress,
  fetchLearningPaths,
  generateLearningPathForExistingStudent,
  generateLearningPathForNewStudent,
  updateLearningPath,
  type CreateLearningPathRequest,
  type GenerateLearningPathForExistingStudentRequest,
  type GenerateLearningPathForNewStudentRequest,
  type UpdateLearningPathRequest,
} from '../services/learning-path.api'

// Get all learning paths
export const useLearningPaths = (params?: { isCompleted?: boolean }) => {
  return useQuery({
    queryKey: ['learning-paths', params],
    queryFn: () => fetchLearningPaths(params),
    select: (res) => res?.data ?? [],
  })
}

// Get active learning path
export const useActiveLearningPath = () => {
  return useQuery({
    queryKey: ['learning-path', 'active'],
    queryFn: () => fetchActiveLearningPath(),
    select: (res) => res?.data ?? null,
  })
}

// Get learning path by ID
export const useLearningPath = (id: string | null) => {
  return useQuery({
    queryKey: ['learning-path', id],
    queryFn: () => fetchLearningPathById(id!),
    enabled: !!id,
    select: (res) => res?.data ?? null,
  })
}

// Get learning path progress
export const useLearningPathProgress = (id: string | null) => {
  return useQuery({
    queryKey: ['learning-path', id, 'progress'],
    queryFn: () => fetchLearningPathProgress(id!),
    enabled: !!id,
    select: (res) => res?.data ?? null,
  })
}

// Create learning path mutation
export const useCreateLearningPath = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateLearningPathRequest) =>
      createLearningPath(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
    },
  })
}

// Update learning path mutation
export const useUpdateLearningPath = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string
      request: UpdateLearningPathRequest
    }) => updateLearningPath(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({
        queryKey: ['learning-path', variables.id],
      })
    },
  })
}

// Delete learning path mutation
export const useDeleteLearningPath = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLearningPath(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
    },
  })
}

// Advance step mutation
export const useAdvanceLearningPathStep = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => advanceLearningPathStep(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', id] })
      queryClient.invalidateQueries({
        queryKey: ['learning-path', id, 'progress'],
      })
    },
  })
}

// Generate for new student mutation
export const useGenerateLearningPathForNewStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request?: GenerateLearningPathForNewStudentRequest) =>
      generateLearningPathForNewStudent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', 'active'] })
    },
  })
}

// Generate for existing student mutation
export const useGenerateLearningPathForExistingStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: GenerateLearningPathForExistingStudentRequest) =>
      generateLearningPathForExistingStudent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] })
      queryClient.invalidateQueries({ queryKey: ['learning-path', 'active'] })
    },
  })
}
