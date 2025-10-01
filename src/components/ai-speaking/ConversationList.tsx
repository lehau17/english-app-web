import { ChevronRight, Clock, MessageCircle, Plus, Users } from 'lucide-react'
import React from 'react'
import { useAiSpeakingConversations } from '../../hooks/useAiSpeakingConversations'

interface ConversationListProps {
  onSelectConversation?: (conversationId: string) => void
  onStartNewConversation?: () => void
  selectedConversationId?: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onStartNewConversation,
  selectedConversationId,
}) => {
  const { data: conversations = [], isLoading } = useAiSpeakingConversations(20)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'finished':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-blue-600 bg-blue-100'
      case 'ai_speaking':
        return 'text-orange-600 bg-orange-100'
      case 'user_speaking':
        return 'text-purple-600 bg-purple-100'
      case 'aborted':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStateName = (state: string) => {
    switch (state) {
      case 'finished':
        return 'Hoàn thành'
      case 'pending':
        return 'Đang chờ'
      case 'ai_speaking':
        return 'AI đang nói'
      case 'user_speaking':
        return 'Người dùng nói'
      case 'aborted':
        return 'Đã hủy'
      default:
        return 'Không rõ'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header với nút tạo conversation mới */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Cuộc hội thoại ({conversations.length})
        </h3>
        <button
          onClick={onStartNewConversation}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Hội thoại mới
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Chưa có cuộc hội thoại nào</p>
          <button
            onClick={onStartNewConversation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bắt đầu luyện nói với AI
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const isSelected =
              selectedConversationId === conversation.conversationId
            const latestSession = conversation.latestSession

            return (
              <div
                key={conversation.conversationId}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    onSelectConversation?.(conversation.conversationId)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Topic và goal */}
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {latestSession.topic || 'Chủ đề không xác định'}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStateColor(latestSession.state)}`}
                        >
                          {getStateName(latestSession.state)}
                        </span>
                      </div>

                      {latestSession.goal && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {latestSession.goal}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(latestSession.lastActivityAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {conversation.sessionCount} phiên
                        </span>
                        <span>
                          {latestSession.turnCount}/{latestSession.maxTurns}{' '}
                          lượt
                        </span>
                        <span className="capitalize">
                          {latestSession.targetDifficulty.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </div>

                {/* Expanded details */}
                {isSelected && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ID Conversation:</span>
                        <span className="font-mono text-xs text-gray-800">
                          {conversation.conversationId.split('_').pop()}
                        </span>
                      </div>

                      {latestSession.summary && (
                        <div>
                          <span className="text-gray-600 text-sm">
                            Tóm tắt:
                          </span>
                          <p className="text-sm text-gray-800 mt-1">
                            {latestSession.summary}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartNewConversation?.()
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Tiếp tục
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectConversation?.(conversation.conversationId)
                          }}
                          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
