import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConversationDetail } from '../components/ai-speaking/ConversationDetail'

const AiSpeakingConversationDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId: string }>()

  const handleStartNewSession = (conversationId: string) => {
    // Navigate to session page with conversation ID
    navigate(`/ai-speaking/session?conversationId=${conversationId}`)
  }

  const handleBackToList = () => {
    navigate('/ai-speaking')
  }

  if (!conversationId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">
          Không tìm thấy ID cuộc hội thoại. Vui lòng quay lại danh sách.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Chi tiết cuộc hội thoại
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Xem lịch sử các phiên luyện nói và tiếp tục cuộc hội thoại.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleStartNewSession(conversationId)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <MessageCircle className="h-4 w-4" /> Tiếp tục cuộc hội thoại
          </button>
        </div>
      </div>

      <ConversationDetail
        conversationId={conversationId}
        onStartNewSession={handleStartNewSession}
      />
    </div>
  )
}

export default AiSpeakingConversationDetailPage
