import { Calendar, Clock, MessageCircle, User } from 'lucide-react'
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
                  Lịch sử hội thoại
                </h4>
                <div className="max-h-96 overflow-y-auto space-y-3 rounded-lg bg-gray-50 p-4">
                  {session.turns.map((turn) => (
                    <React.Fragment key={turn.id}>
                      {/* AI Message - Left side */}
                      {turn.aiPrompt && (
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm max-w-[85%]">
                              <p className="text-sm text-gray-800">
                                {turn.aiPrompt}
                              </p>
                            </div>
                            {turn.aiAudioUrl && (
                              <div className="flex items-center gap-2 pl-2">
                                <audio
                                  controls
                                  className="h-8 max-w-xs"
                                  src={turn.aiAudioUrl}
                                  style={{ maxHeight: '32px' }}
                                >
                                  <track kind="captions" />
                                </audio>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Message - Right side */}
                      {(turn.userTranscript || turn.userAudioUrl) && (
                        <div className="flex items-start justify-end gap-2">
                          <div className="flex-1 flex flex-col items-end space-y-1">
                            {turn.userTranscript && (
                              <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 shadow-sm max-w-[85%]">
                                <p className="text-sm text-white">
                                  {turn.userTranscript}
                                </p>
                              </div>
                            )}
                            {turn.userAudioUrl && (
                              <div className="flex items-center gap-2 pr-2">
                                <audio
                                  controls
                                  className="h-8 max-w-xs"
                                  src={turn.userAudioUrl}
                                  style={{ maxHeight: '32px' }}
                                >
                                  <track kind="captions" />
                                </audio>
                              </div>
                            )}
                            {turn.score !== null &&
                              turn.score !== undefined && (
                                <div className="pr-2">
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                                    Điểm: {turn.score}/100
                                  </span>
                                </div>
                              )}
                          </div>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
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
