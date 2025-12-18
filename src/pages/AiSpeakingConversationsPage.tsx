import { MessageCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConversationList } from '../components/ai-speaking/ConversationList'
import { NewConversationModal } from '../components/ai-speaking/NewConversationModal'
import {
  getRemedialExercises,
  type RemedialExerciseDto,
} from '../services/aiSpeaking.api'

const AiSpeakingConversationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false)
  const [remedialExercise, setRemedialExercise] =
    useState<RemedialExerciseDto | null>(null)

  useEffect(() => {
    fetchRemedial()
  }, [])

  const fetchRemedial = async () => {
    try {
      const list = await getRemedialExercises()
      // Show the first pending one
      const pending = list.find((e) => e.status === 'pending')
      if (pending) {
        setRemedialExercise(pending)
      }
    } catch (e) {
      console.error('Failed to fetch remedial exercises:', e)
    }
  }

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
      {/* Remedial Banner */}
      {remedialExercise && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm flex items-start gap-4 animate-in slide-in-from-top-2">
          <div className="rounded-full bg-orange-100 p-2 text-orange-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-900">
              Cải thiện phát âm
            </h3>
            <p className="text-orange-800 text-sm mt-1">
              Chúng tôi phát hiện một số lỗi phát âm thường gặp. Hãy luyện tập
              ngay bài tập ngắn 2 phút này để cải thiện.
            </p>
            <button
              onClick={() =>
                navigate(`/ai-speaking/remedial/${remedialExercise.id}`)
              }
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-900 hover:underline"
            >
              Bắt đầu luyện tập <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
