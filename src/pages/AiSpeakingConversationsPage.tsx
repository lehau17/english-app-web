import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConversationList } from '../components/ai-speaking/ConversationList'
import { NewConversationModal } from '../components/ai-speaking/NewConversationModal'

const AiSpeakingConversationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false)

  const handleSelectConversation = (conversationId: string) => {
    navigate(`/ai-speaking/conversations/${conversationId}`)
  }

  const handleStartNewConversation = () => {
    setIsNewConversationModalOpen(true)
  }

  const handleCreateSession = (params: {
    conversationId?: string
    topic: string
    goal?: string
    targetDifficulty: string
    maxTurns: number
  }) => {
    // Navigate to session page with params
    const searchParams = new URLSearchParams({
      topic: params.topic,
      targetDifficulty: params.targetDifficulty,
      maxTurns: params.maxTurns.toString(),
    })

    // Chỉ truyền conversationId nếu đang tiếp tục conversation cũ
    if (params.conversationId) {
      searchParams.set('conversationId', params.conversationId)
    }
    if (params.goal) {
      searchParams.set('goal', params.goal)
    }

    navigate(`/ai-speaking/session?${searchParams.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Luyện nói cùng AI
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Chọn cuộc hội thoại hiện có hoặc tạo mới để tiếp tục luyện nói với
              trợ giảng AI.
            </p>
          </div>

          <button
            onClick={handleStartNewConversation}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <MessageCircle className="h-4 w-4" /> Tạo hội thoại mới
          </button>
        </div>
      </div>

      <ConversationList
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
      />

      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onStartConversation={handleCreateSession}
      />
    </div>
  )
}

export default AiSpeakingConversationsPage
