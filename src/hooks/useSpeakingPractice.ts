import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentProgress,
  getNextItem,
  submitAttempt,
  getPersonalizedDrills,
  getDueWords,
} from '../services/speakingPractice.api'
import type {
  SpeakingPracticeProgress,
  NextPracticeItem,
  SubmitAttemptRequest,
  SubmitResult,
  PersonalizedDrill,
  DueWordsResponse,
} from '../types/speaking-practice.types'

// Query keys
export const speakingPracticeKeys = {
  all: ['speaking-practice'] as const,
  progress: () => [...speakingPracticeKeys.all, 'progress'] as const,
  nextItem: (params?: { level?: number; lessonId?: string }) =>
    [...speakingPracticeKeys.all, 'next-item', params] as const,
  drills: (params?: { status?: string; limit?: number }) =>
    [...speakingPracticeKeys.all, 'drills', params] as const,
  dueWords: (params?: { limit?: number; offset?: number }) =>
    [...speakingPracticeKeys.all, 'due-words', params] as const,
}

/**
 * Hook to get user's current speaking practice progress
 */
export const useSpeakingPracticeProgress = () => {
  return useQuery<SpeakingPracticeProgress, Error>({
    queryKey: speakingPracticeKeys.progress(),
    queryFn: getCurrentProgress,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to get next practice item
 */
export const useNextPracticeItem = (
  params?: { level?: number; lessonId?: string; includeRemedial?: boolean },
  options?: { enabled?: boolean }
) => {
  return useQuery<NextPracticeItem, Error>({
    queryKey: speakingPracticeKeys.nextItem(params),
    queryFn: () => getNextItem(params),
    enabled: options?.enabled ?? true,
    staleTime: 0, // Always fetch fresh
  })
}

/**
 * Hook to submit practice attempt
 */
export const useSubmitAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation<
    SubmitResult,
    Error,
    { data: SubmitAttemptRequest; audioFile?: File }
  >({
    mutationFn: ({ data, audioFile }) => submitAttempt(data, audioFile),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: speakingPracticeKeys.progress(),
      })
      queryClient.invalidateQueries({
        queryKey: speakingPracticeKeys.all,
      })
    },
  })
}

/**
 * Hook to get personalized drills
 */
export const usePersonalizedDrills = (params?: {
  status?: string
  limit?: number
}) => {
  return useQuery<PersonalizedDrill[], Error>({
    queryKey: speakingPracticeKeys.drills(params),
    queryFn: () => getPersonalizedDrills(params),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook to get due words for SM-2 review
 */
export const useDueWords = (params?: { limit?: number; offset?: number }) => {
  return useQuery<DueWordsResponse, Error>({
    queryKey: speakingPracticeKeys.dueWords(params),
    queryFn: () => getDueWords(params),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Hook for audio recording management
 */
// Aliases for convenience
export const useCurrentProgress = useSpeakingPracticeProgress
export const useNextItem = useNextPracticeItem

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setAudioBlob(null)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        })
        setAudioBlob(blob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError('Khong the truy cap microphone')
      console.error('Recording error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [])

  const clearRecording = useCallback(() => {
    setAudioBlob(null)
    setError(null)

    // Cleanup any active stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  return {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearRecording,
  }
}
