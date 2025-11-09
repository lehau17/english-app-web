// AI Agent Panel - Tích hợp vào ConversationWidget
import {
  Bot,
  Loader2,
  Maximize2,
  MessageCircle,
  Minimize2,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { AgentConversation, AgentMessage } from '../../services/agent.api'
import {
  deleteConversation,
  getConversation,
  getConversations,
  streamAgentChatFetch,
} from '../../services/agent.api'

interface AiAgentPanelProps {
  onClose: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  userRole: string
  onSwitchToClassroom?: () => void
}

// Date grouping helper
const groupConversationsByDate = (conversations: AgentConversation[]) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const last7Days = new Date(today)
  last7Days.setDate(last7Days.getDate() - 7)
  const last30Days = new Date(today)
  last30Days.setDate(last30Days.getDate() - 30)

  const groups: Record<string, AgentConversation[]> = {
    'Hôm nay': [],
    'Hôm qua': [],
    '7 ngày qua': [],
    '30 ngày qua': [],
    'Cũ hơn': [],
  }

  conversations.forEach((conv) => {
    const convDate = new Date(conv.createdAt)
    if (convDate >= today) {
      groups['Hôm nay'].push(conv)
    } else if (convDate >= yesterday) {
      groups['Hôm qua'].push(conv)
    } else if (convDate >= last7Days) {
      groups['7 ngày qua'].push(conv)
    } else if (convDate >= last30Days) {
      groups['30 ngày qua'].push(conv)
    } else {
      groups['Cũ hơn'].push(conv)
    }
  })

  return Object.entries(groups).filter(([_, convs]) => convs.length > 0)
}

export const AiAgentPanel: React.FC<AiAgentPanelProps> = ({
  onClose,
  isFullscreen,
  onToggleFullscreen,
  userRole,
  onSwitchToClassroom,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<AgentConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')

  // Buffering refs for smooth streaming (same as CMS)
  const streamingBufferRef = useRef<string>('')
  const streamingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accumulatedResponseRef = useRef<string>('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const data = await getConversations(50, 0)
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId)
      setMessages(conversation.messages || [])
    } catch (error: any) {
      console.error('Failed to load conversation:', error)
      // If conversation not found or access denied, reset to new chat
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        handleNewChat()
      }
    }
  }, [])

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId)
    } else {
      setMessages([])
    }
  }, [activeConversationId, loadConversation])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleNewChat = () => {
    setActiveConversationId(null)
    setMessages([])
    setStreamingContent('')
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      if (activeConversationId === conversationId) {
        handleNewChat()
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsStreaming(true)
    setStreamingContent('')

    // Add user message to UI
    const tempUserMsg: AgentMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    // Reset refs
    accumulatedResponseRef.current = ''
    streamingBufferRef.current = ''

    // Batch update streaming response every 50ms for smooth rendering (same as CMS)
    streamingTimerRef.current = setInterval(() => {
      if (streamingBufferRef.current) {
        setStreamingContent((prev) => prev + streamingBufferRef.current)
        streamingBufferRef.current = ''
      }
    }, 50) // Update UI every 50ms

    try {
      const stream = streamAgentChatFetch(
        userMessage,
        activeConversationId || undefined
      )
      let newConversationId: string | null = null

      for await (const chunk of stream) {
        console.log('📦 Received chunk:', chunk)

        // Handle metadata (conversationId)
        if (chunk.type === 'metadata' && chunk.data?.conversationId) {
          newConversationId = chunk.data.conversationId
          console.log('📊 Setting conversation ID:', newConversationId)
        }
        // Handle streaming tokens (real-time)
        else if (chunk.type === 'token' && chunk.content) {
          console.log('💬 Token content:', chunk.content)
          accumulatedResponseRef.current += chunk.content
          // Buffer tokens for batched rendering (avoid direct setState in loop)
          streamingBufferRef.current += chunk.content
        }
        // Handle complete response
        else if (chunk.type === 'complete' && chunk.data?.answer) {
          console.log('✅ Complete response:', chunk.data.answer)
          // Use the complete answer if no tokens streamed yet
          if (!accumulatedResponseRef.current) {
            accumulatedResponseRef.current = chunk.data.answer
            streamingBufferRef.current = chunk.data.answer
          }
        }
      }

      // Clear streaming timer and flush any remaining buffer
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current)
        streamingTimerRef.current = null
      }
      if (streamingBufferRef.current) {
        accumulatedResponseRef.current += streamingBufferRef.current
        streamingBufferRef.current = ''
      }

      // Clear streaming state
      setStreamingContent('')
      setIsStreaming(false)

      // Finalize assistant message with accumulated content
      const assistantMsg: AgentMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: accumulatedResponseRef.current,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      // Update conversation list
      if (newConversationId && !activeConversationId) {
        setActiveConversationId(newConversationId)
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)

      // Clear streaming timer on error
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current)
        streamingTimerRef.current = null
      }

      setStreamingContent('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const groupedConversations = groupConversationsByDate(conversations)

  const panelClasses = isFullscreen
    ? 'fixed inset-4 z-[70]'
    : 'fixed bottom-20 left-6 w-[900px] h-[600px]'

  return (
    <div
      className={`${panelClasses} bg-white rounded-lg shadow-2xl flex overflow-hidden border border-gray-200`}
    >
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 space-y-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Trò chuyện mới</span>
            </button>
            {onSwitchToClassroom && (
              <button
                onClick={onSwitchToClassroom}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <MessageCircle size={16} />
                <span>Chat lớp học</span>
              </button>
            )}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : groupedConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Chưa có cuộc trò chuyện
              </div>
            ) : (
              groupedConversations.map(([group, convs]) => (
                <div key={group} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {group}
                  </div>
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors flex items-start justify-between ${
                        activeConversationId === conv.id
                          ? 'bg-purple-50 border-l-4 border-purple-600'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {conv.title || 'Trò chuyện mới'}
                        </div>
                        {conv.messages?.[0] && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {conv.messages[0].content.substring(0, 40)}...
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteConversation(conv.id)
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Trợ lý AI</h3>
              <p className="text-xs text-purple-100">Vai trò: {userRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={isSidebarOpen ? 'Ẩn sidebar' : 'Hiện sidebar'}
            >
              <MessageCircle size={20} />
            </button>
            <button
              onClick={onToggleFullscreen}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center text-gray-500 mt-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white mx-auto mb-4">
                <Bot size={40} />
              </div>
              <p className="text-lg font-medium mb-2">
                Xin chào! Tôi là trợ lý AI
              </p>
              <p className="text-sm">
                Hãy hỏi tôi bất cứ điều gì bạn cần hỗ trợ
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-lg shadow-sm bg-white border border-gray-200 text-gray-900">
                <div className="whitespace-pre-wrap break-words">
                  {streamingContent}
                </div>
                <span className="inline-block w-2 h-4 bg-purple-600 animate-pulse ml-1">
                  |
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !inputMessage.trim()}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-lg transition-all shadow-sm disabled:shadow-none"
              aria-label="Send message"
            >
              {isStreaming ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
