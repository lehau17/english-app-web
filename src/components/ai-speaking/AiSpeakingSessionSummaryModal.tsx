import { X, MessageCircle, TrendingUp, AlertCircle, Target } from 'lucide-react'
import React from 'react'
import type { AiSpeakingSessionDto } from '../../services/aiSpeaking.api'

interface AiSpeakingSessionSummaryModalProps {
  session: AiSpeakingSessionDto | null
  summary: string | null
  analytics: Record<string, unknown> | null
  isOpen: boolean
  onClose: () => void
  onViewConversation: (conversationId: string) => void
}

export const AiSpeakingSessionSummaryModal: React.FC<
  AiSpeakingSessionSummaryModalProps
> = ({ session, summary, analytics, isOpen, onClose, onViewConversation }) => {
  if (!isOpen || !session) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-50'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50'
      case 'advanced':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'Cơ bản'
      case 'intermediate':
        return 'Trung bình'
      case 'advanced':
        return 'Nâng cao'
      default:
        return difficulty || 'N/A'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Tổng kết phiên luyện nói
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(session.endedAt || session.createdAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Tổng lượt</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {session.turnCount || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Cảnh báo im lặng
                  </div>
                  <div className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-1">
                    <AlertCircle size={20} className="text-yellow-500" />
                    {session.silenceWarnings || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Độ khó</div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-medium ${getDifficultyColor(
                        session.currentDifficulty ?? undefined
                      )}`}
                    >
                      <Target size={14} />
                      {getDifficultyLabel(
                        session.currentDifficulty ?? undefined
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Chủ đề</div>
                  <div className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {session.topic || 'Tự do'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Text */}
            {summary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" />
                  Tóm tắt phiên học
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>
            )}

            {/* Analytics */}
            {analytics && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Thống kê chi tiết
                </h3>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="space-y-3">
                    {analytics.totalTurns !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Tổng số lượt tương tác:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {String(analytics.totalTurns)}
                        </span>
                      </div>
                    )}
                    {analytics.silenceWarnings !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Cảnh báo im lặng:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {String(analytics.silenceWarnings)}
                        </span>
                      </div>
                    )}
                    {analytics.offTopicWarnings !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Cảnh báo lệch chủ đề:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {String(analytics.offTopicWarnings)}
                        </span>
                      </div>
                    )}
                    {analytics.difficultyProgression !== undefined && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Độ khó cuối cùng:
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {getDifficultyLabel(
                            String(analytics.difficultyProgression)
                          )}
                        </span>
                      </div>
                    )}
                    {analytics.finishedAt !== undefined &&
                      analytics.finishedAt !== null && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">
                            Hoàn thành lúc:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(
                              typeof analytics.finishedAt === 'string'
                                ? analytics.finishedAt
                                : String(analytics.finishedAt)
                            )}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Goal (if exists) */}
            {session.goal && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Mục tiêu phiên học
                </h3>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-gray-700">{session.goal}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Đóng
            </button>
            {session.conversationId && (
              <button
                onClick={() => {
                  onViewConversation(session.conversationId!)
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Xem chi tiết conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
