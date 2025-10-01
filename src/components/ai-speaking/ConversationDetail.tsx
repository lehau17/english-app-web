import { Calendar, Clock, MessageCircle, User, Volume2 } from 'lucide-react'
import React from 'react'
import { useAiSpeakingConversation } from '../../hooks/useAiSpeakingConversations'
import { formatDate } from '../../utils/dateUtils'

interface ConversationDetailProps {
  conversationId: string
  onStartNewSession?: (conversationId: string) => void
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
  conversationId,
  onStartNewSession,
}) => {
  const { data: conversation, isLoading } =
    useAiSpeakingConversation(conversationId)

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        <p className="mt-2 text-sm text-gray-600">Đang tải hội thoại...</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Không tìm thấy hội thoại</p>
      </div>
    )
  }

  const { sessions } = conversation
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )
  const latestSession = sortedSessions[0]

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              {latestSession.topic || 'Hội thoại không đề'}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{formatDate(latestSession.startedAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-gray-400" />
                <span>{sessions.length} phiên</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>
                  Gần nhất: {formatDate(latestSession.lastActivityAt)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartNewSession?.(conversationId)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <MessageCircle className="h-4 w-4" />
            Tiếp tục hội thoại
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Lịch sử phiên ({sortedSessions.length})
        </h3>

        {sortedSessions.map((session) => (
          <div
            key={session.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      session.state === 'completed'
                        ? 'bg-green-500'
                        : session.state === 'in_progress'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                    }`}
                  ></span>
                  <span className="font-medium text-gray-900">
                    {session.state === 'completed'
                      ? 'Đã hoàn thành'
                      : session.state === 'in_progress'
                        ? 'Đang tiến hành'
                        : 'Chưa hoàn thành'}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <strong>Chủ đề:</strong> {session.topic || 'Không đề'}
                  </p>
                  {session.goal && (
                    <p>
                      <strong>Mục tiêu:</strong> {session.goal}
                    </p>
                  )}
                  <p>
                    <strong>Độ khó:</strong> {session.targetDifficulty}
                  </p>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span>
                    Thời gian: {formatDate(session.startedAt)} -{' '}
                    {session.endedAt
                      ? formatDate(session.endedAt)
                      : 'Chưa kết thúc'}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                  {session.turnCount}/{session.maxTurns} lượt
                </div>
              </div>
            </div>

            {session.turns && session.turns.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Các lượt hội thoại
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {session.turns.slice(0, 3).map((turn) => (
                    <div key={turn.id} className="rounded-lg bg-gray-50 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <Volume2 className="h-3 w-3" />
                            AI Prompt
                          </div>
                          <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                            {turn.aiPrompt || 'Không có nội dung'}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                            <User className="h-3 w-3" />
                            User Response
                          </div>
                          <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                            {turn.userTranscript || 'Không có phản hồi'}
                          </p>

                          {turn.score !== null && turn.score !== undefined && (
                            <div className="mt-1 text-xs">
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                                Điểm: {turn.score}/100
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {session.turns.length > 3 && (
                    <div className="text-center">
                      <span className="text-xs text-gray-500">
                        + {session.turns.length - 3} lượt khác
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {session.summary && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <h4 className="text-sm font-medium text-gray-700">
                  Tóm tắt phiên
                </h4>
                <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                  {session.summary}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
