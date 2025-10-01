import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { resolveSocketUrl } from '../lib/socket'
import {
  createClassroomConversation,
  fetchClassroomConversations,
  fetchConversationMessages,
  markConversationRead,
  sendConversationMessage,
} from '../services/conversation.api'
import type {
  ConversationMessage,
  ConversationSummary,
  CreateConversationPayload,
  PaginatedResult,
  SendConversationMessagePayload,
  SendMessageResponse,
} from '../types/conversation.type'

const conversationKeys = {
  all: ['conversations'] as const,
  list: (classroomId?: string) => ['conversations', classroomId] as const,
  messages: (classroomId?: string, conversationId?: string) =>
    ['conversation-messages', classroomId, conversationId] as const,
}

const MESSAGE_PAGE_SIZE = 20

export const useConversationList = (
  classroomId?: string,
  enabled = true,
  params?: { type?: string; limit?: number; page?: number }
) => {
  return useQuery({
    queryKey: conversationKeys.list(classroomId),
    enabled: enabled && !!classroomId,
    queryFn: () =>
      fetchClassroomConversations(classroomId!, {
        limit: params?.limit ?? 20,
        page: params?.page ?? 1,
        type: params?.type,
      }),
    staleTime: 10_000,
  })
}

export const useConversationMessages = (
  classroomId?: string,
  conversationId?: string,
  enabled = true
) => {
  const query = useInfiniteQuery({
    queryKey: conversationKeys.messages(classroomId, conversationId),
    enabled: enabled && !!classroomId && !!conversationId,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchConversationMessages(classroomId!, conversationId!, {
        page: pageParam,
        limit: MESSAGE_PAGE_SIZE,
        sortOrder: 'asc',
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    refetchOnWindowFocus: false,
  })

  const messages = useMemo(() => {
    if (!query.data?.pages) return []
    const orderedPages = [...query.data.pages].sort((a, b) => b.page - a.page)
    return orderedPages.flatMap((page) => page.data)
  }, [query.data?.pages])

  return {
    ...query,
    messages,
  }
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classroomId,
      payload,
    }: {
      classroomId: string
      payload: CreateConversationPayload
    }) => createClassroomConversation(classroomId, payload),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({
        queryKey: conversationKeys.list(conversation.classroomId),
      })
    },
  })
}

export const useSendConversationMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classroomId,
      conversationId,
      payload,
    }: {
      classroomId: string
      conversationId: string
      payload: SendConversationMessagePayload
    }) => sendConversationMessage(classroomId, conversationId, payload),
    onSuccess: (response, variables) => {
      updateConversationCachesAfterMessage(
        queryClient,
        response,
        variables.classroomId,
        variables.conversationId
      )
    },
  })
}

export const useMarkConversationReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      classroomId,
      conversationId,
    }: {
      classroomId: string
      conversationId: string
    }) => markConversationRead(classroomId, conversationId),
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        conversationKeys.list(conversation.classroomId),
        (prev: PaginatedResult<ConversationSummary> | undefined) => {
          if (!prev) return prev
          const items = prev.data.slice()
          const index = items.findIndex((c) => c.id === conversation.id)
          if (index === -1) return prev
          items[index] = { ...items[index], ...conversation, unreadCount: 0 }
          return { ...prev, data: normalizeConversationOrder(items) }
        }
      )
    },
  })
}

export const useConversationRealtime = (enabled: boolean) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !user?.id) return

    const socketUrl = resolveSocketUrl()
    const socket: Socket = io(socketUrl, {
      transports: ['websocket'],
      query: { userId: user.id },
    })

    const handleMessage = (
      payload: SendMessageResponse & { classroomId?: string }
    ) => {
      const conversation = payload.conversation
      const classroomId = conversation.classroomId
      updateConversationCachesAfterMessage(
        queryClient,
        payload,
        classroomId,
        conversation.id
      )
    }

    const handleConversationUpdated = (conversation: ConversationSummary) => {
      queryClient.setQueryData(
        conversationKeys.list(conversation.classroomId),
        (prev: PaginatedResult<ConversationSummary> | undefined) => {
          if (!prev) return prev
          const items = prev.data.slice()
          const index = items.findIndex((c) => c.id === conversation.id)
          if (index === -1) {
            items.unshift(conversation)
          } else {
            items.splice(index, 1)
            items.unshift({ ...items[index], ...conversation })
          }
          return { ...prev, data: normalizeConversationOrder(items) }
        }
      )
    }

    socket.on('conversation.message', handleMessage)
    socket.on('conversation.updated', handleConversationUpdated)

    return () => {
      socket.off('conversation.message', handleMessage)
      socket.off('conversation.updated', handleConversationUpdated)
      socket.disconnect()
    }
  }, [enabled, queryClient, user?.id])
}

function updateConversationCachesAfterMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  response: SendMessageResponse,
  classroomId: string,
  conversationId: string
) {
  const conversation = response.conversation
  const message = response.message

  queryClient.setQueryData(
    conversationKeys.list(classroomId),
    (prev: PaginatedResult<ConversationSummary> | undefined) => {
      if (!prev) return prev
      const items = prev.data.slice()
      const existingIndex = items.findIndex((c) => c.id === conversation.id)
      if (existingIndex !== -1) {
        items.splice(existingIndex, 1)
      }
      items.unshift({ ...conversation, unreadCount: 0 })
      return { ...prev, data: normalizeConversationOrder(items) }
    }
  )

  queryClient.setQueryData(
    conversationKeys.messages(classroomId, conversationId),
    (
      prev:
        | {
            pageParams: number[]
            pages: PaginatedResult<ConversationMessage>[]
          }
        | undefined
    ) => {
      if (!prev) return prev
      const pages = prev.pages.slice()
      if (pages.length === 0) {
        pages.push({
          data: [message],
          page: 1,
          limit: MESSAGE_PAGE_SIZE,
          totalItems: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        })
      } else {
        const latest = { ...pages[0] }
        // Check if message already exists to prevent duplicates
        const messageExists = latest.data.some(
          (existingMessage) => existingMessage.id === message.id
        )
        if (!messageExists) {
          latest.data = [...latest.data, message]
          latest.totalItems += 1
        }
        pages[0] = latest
      }
      return { ...prev, pages }
    }
  )
}

function normalizeConversationOrder(
  conversations: ConversationSummary[]
): ConversationSummary[] {
  return conversations.slice().sort((a, b) => {
    const aTime = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0
    const bTime = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0
    return bTime - aTime
  })
}
