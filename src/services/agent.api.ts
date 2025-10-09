// Agent AI API Client for englishWeb
import api from '../lib/api'

export interface AgentConversation {
  id: string
  title: string | null
  role: string
  createdAt: string
  updatedAt: string
  messages: AgentMessage[]
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ConversationsResponse {
  conversations: AgentConversation[]
  total: number
}

/**
 * Get user's conversations with AI agent
 */
export const getConversations = async (
  limit: number = 50,
  offset: number = 0
): Promise<AgentConversation[]> => {
  const response = await api.get('/private/v1/agent/conversations', {
    params: { limit, offset },
  })
  // Backend returns array directly (not wrapped in data)
  return Array.isArray(response.data) ? response.data : []
}

/**
 * Get single conversation with all messages
 */
export const getConversation = async (
  conversationId: string
): Promise<AgentConversation> => {
  const response = await api.get(
    `/private/v1/agent/conversations/${conversationId}`,
    {
      params: { id: conversationId },
    }
  )
  return response.data
}

/**
 * Delete a conversation
 */
export const deleteConversation = async (
  conversationId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(
    `/private/v1/agent/conversations/${conversationId}/delete`,
    {},
    {
      params: { id: conversationId },
    }
  )
  return response.data
}

/**
 * Stream chat with AI agent using SSE
 * Returns an EventSource that emits chunks
 */
export const streamAgentChat = (
  message: string,
  conversationId?: string
): EventSource => {
  const token = localStorage.getItem('access_token')
  const params = new URLSearchParams({ message })
  if (conversationId) {
    params.append('conversationId', conversationId)
  }

  const url = `${api.defaults.baseURL}/private/v1/agent/chat/stream?${params.toString()}`
  const eventSource = new EventSource(url, {
    withCredentials: true,
  })

  // Add auth header via polyfill if needed
  if (token) {
    // Note: EventSource doesn't support custom headers natively
    // You may need to pass token via query param or use fetch with SSE polyfill
    console.warn('EventSource with custom headers may require polyfill')
  }

  return eventSource
}

/**
 * Alternative: Stream using fetch (better for auth headers)
 */
export async function* streamAgentChatFetch(
  message: string,
  conversationId?: string
): AsyncGenerator<any, void, unknown> {
  const params = new URLSearchParams({ message })
  if (conversationId) {
    params.append('conversationId', conversationId)
  }

  const url = `${api.defaults.baseURL}/private/v1/agent/chat/stream?${params.toString()}`
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('No access token found. Please login again.')
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/event-stream',
    },
  })

  // Check for auth errors
  if (response.status === 401) {
    throw new Error(
      'Unauthorized: Token expired or invalid. Please login again.'
    )
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') {
          console.log('✅ Stream ended')
          return
        }
        if (!data) continue // Skip empty data

        try {
          const parsed = JSON.parse(data)
          console.log('📨 Parsed SSE:', parsed)
          yield parsed
        } catch (e) {
          console.error('❌ Failed to parse SSE data:', data, e)
        }
      }
    }
  }
}
