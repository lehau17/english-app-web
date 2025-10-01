import { useMutation, useQuery } from '@tanstack/react-query'
import {
  canStartActivity,
  completeActivity,
  fetchLessonAndActivities,
  getNextLesson,
  startActivity,
  unlockNextLesson,
} from '../services/learn.api'

// Query keys
export const learnQueryKeys = {
  nextLesson: ['nextLesson'] as const,
  lessonAndActivities: (
    classroomId: string,
    lessonId: string,
    userId: string
  ) => ['lessonAndActivities', classroomId, lessonId, userId] as const,
}

// Hook để lấy next lesson
export const useNextLesson = () => {
  return useQuery({
    queryKey: learnQueryKeys.nextLesson,
    queryFn: async () => {
      const response = await getNextLesson()
      return response.data
    },
    enabled: false, // Chỉ fetch khi gọi refetch manually
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook để lấy lesson và activities
export const useLessonAndActivities = (
  classroomId: string,
  lessonId: string,
  userId: string
) => {
  return useQuery({
    queryKey: learnQueryKeys.lessonAndActivities(classroomId, lessonId, userId),
    queryFn: async () => {
      const result = await fetchLessonAndActivities(
        classroomId,
        lessonId,
        userId
      )
      return result
    },
    enabled: !!(classroomId?.trim() && lessonId?.trim() && userId?.trim()), // Chỉ fetch khi có đủ params và không empty
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook để start activity
export const useStartActivity = () => {
  return useMutation({
    mutationFn: startActivity,
    onSuccess: (data) => {
      console.log('Activity started successfully:', data)
    },
    onError: (error) => {
      console.error('Failed to start activity:', error)
    },
  })
}

// Hook để complete activity
export const useCompleteActivity = () => {
  return useMutation({
    mutationFn: completeActivity,
    onSuccess: (data) => {
      console.log('Activity completed successfully:', data)
    },
    onError: (error) => {
      console.error('Failed to complete activity:', error)
    },
  })
}

// Hook để check can start activity
export const useCanStartActivity = () => {
  return useMutation({
    mutationFn: canStartActivity,
    onSuccess: (data) => {
      console.log('Can start activity check:', data)
    },
    onError: (error) => {
      console.error('Failed to check can start activity:', error)
    },
  })
}

// Hook để unlock next lesson
export const useUnlockNextLesson = () => {
  return useMutation({
    mutationFn: unlockNextLesson,
    onSuccess: (data) => {
      console.log('Next lesson unlocked:', data.data.message)
      // Show success notification if needed
    },
    onError: (error) => {
      console.error('Failed to unlock next lesson:', error)
    },
  })
}
