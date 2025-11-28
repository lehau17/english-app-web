// AI Assistant Chatbox Component for englishWeb
import { MessageCircle, Plus, Send, Trash2, X } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  deleteConversation,
  getConversation,
  getConversations,
  streamAgentChatFetch,
  type AgentConversation,
  type AgentMessage,
} from '../../services/agent.api'

interface AiChatboxProps {
  userRole?: string
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

export const AiChatbox: React.FC<AiChatboxProps> = ({
  userRole = 'student',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [conversations, setConversations] = useState<AgentConversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const skipNextLoadRef = useRef<boolean>(false) // Flag to skip loading after creating new conversation

  // Load conversations on open
  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      // Skip loading if we just created a new conversation (messages already in state)
      if (skipNextLoadRef.current) {
        skipNextLoadRef.current = false
        return
      }
      loadConversation(activeConversationId)
    } else {
      setMessages([])
    }
  }, [activeConversationId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const loadConversations = async () => {
    try {
      const data = await getConversations(50, 0)
      setConversations(data)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const loadConversation = async (conversationId: string) => {
    try {
      const conversation = await getConversation(conversationId)
      setMessages(conversation.messages || [])
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

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

    try {
      const stream = streamAgentChatFetch(
        userMessage,
        activeConversationId || undefined,
        userRole
      )
      let fullResponse = ''
      let newConversationId: string | null = null

      for await (const chunk of stream) {
        if (chunk.type === 'content') {
          fullResponse += chunk.content
          setStreamingContent(fullResponse)
        } else if (chunk.type === 'metadata' && chunk.conversationId) {
          newConversationId = chunk.conversationId
        }
      }

      // Finalize assistant message
      const assistantMsg: AgentMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setStreamingContent('')

      // Update conversation list
      if (newConversationId && !activeConversationId) {
        // Set flag to skip loading - we already have messages in state
        skipNextLoadRef.current = true
        setActiveConversationId(newConversationId)
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 transition-all"
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={28} />
      </button>
    )
  }

  const groupedConversations = groupConversationsByDate(conversations)

  return (
    <div className="fixed bottom-6 right-6 w-[900px] h-[600px] bg-white rounded-lg shadow-2xl z-50 flex overflow-hidden">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span>Trò chuyện mới</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {groupedConversations.length === 0 ? (
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
                          ? 'bg-blue-50 border-l-4 border-blue-600'
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div>
            <h3 className="font-semibold text-gray-900">Trợ lý AI</h3>
            <p className="text-xs text-gray-500">Vai trò: {userRole}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <MessageCircle size={20} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Bắt đầu trò chuyện với trợ lý AI</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator - show when streaming starts but no content yet */}
          {isStreaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">Đang suy nghĩ</span>
                  <div className="flex gap-1 ml-1">
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[75%] px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
                <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1">
                  |
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={isStreaming || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-3 rounded-lg transition-colors"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
