import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { StartAiSpeakingSessionRequest } from '../services/aiSpeaking.api'
import {
  finalizeAiSpeakingSession,
  getAiSpeakingConversation,
  getAiSpeakingConversations,
  listAiSpeakingSessions,
  startAiSpeakingSession,
} from '../services/aiSpeaking.api'

// Hook để list conversations
export const useAiSpeakingConversations = (limit?: number, cursor?: string) => {
  return useQuery({
    queryKey: ['ai-speaking', 'conversations', limit, cursor],
    queryFn: () => getAiSpeakingConversations(limit, cursor),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook để lấy chi tiết conversation
export const useAiSpeakingConversation = (conversationId?: string) => {
  return useQuery({
    queryKey: ['ai-speaking', 'conversations', conversationId],
    queryFn: () => getAiSpeakingConversation(conversationId!),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Hook để list tất cả sessions (legacy support)
export const useAiSpeakingSessions = (limit?: number, cursor?: string) => {
  return useQuery({
    queryKey: ['ai-speaking', 'sessions', limit, cursor],
    queryFn: () => listAiSpeakingSessions(limit, cursor),
    staleTime: 5 * 60 * 1000,
  })
}

// Hook để start session mới
export const useStartAiSpeakingSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: StartAiSpeakingSessionRequest) =>
      startAiSpeakingSession(data),
    onSuccess: (newSession) => {
      // Invalidate conversations list để refresh
      queryClient.invalidateQueries({
        queryKey: ['ai-speaking', 'conversations'],
      })

      // Invalidate specific conversation nếu session thuộc conversation cũ
      if (newSession.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['ai-speaking', 'conversations', newSession.conversationId],
        })
      }

      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: ['ai-speaking', 'sessions'] })
    },
  })
}

// Hook để finalize session
export const useFinalizeAiSpeakingSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string
      payload: { reason?: string; learnerReflection?: string }
    }) => finalizeAiSpeakingSession(sessionId, payload),
    onSuccess: (finalizedSession) => {
      // Refresh conversations
      queryClient.invalidateQueries({
        queryKey: ['ai-speaking', 'conversations'],
      })

      if (finalizedSession.conversationId) {
        queryClient.invalidateQueries({
          queryKey: [
            'ai-speaking',
            'conversations',
            finalizedSession.conversationId,
          ],
        })
      }
    },
  })
}

// Hook để tạo conversation ID mới
export const useGenerateConversationId = () => {
  return () => {
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 8)
    return `conv_${timestamp}_${random}`
  }
}
