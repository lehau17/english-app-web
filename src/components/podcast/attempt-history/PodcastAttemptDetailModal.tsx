import { X, CheckCircle2, XCircle, Clock } from 'lucide-react'
import React from 'react'
import type { PodcastAttemptItemData } from './PodcastAttemptItem'

interface PodcastAttemptDetailModalProps {
  attempt: PodcastAttemptItemData | null
  gaps: Array<{
    id: string
    orderNo: number
    answer: string
  }>
  isOpen: boolean
  onClose: () => void
}

export const PodcastAttemptDetailModal: React.FC<
  PodcastAttemptDetailModalProps
> = ({ attempt, gaps, isOpen, onClose }) => {
  if (!isOpen || !attempt) return null

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0 phút'
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return minutes > 0 ? `${minutes} phút ${secs} giây` : `${secs} giây`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = () => {
    if (attempt.scorePercent >= 80) return 'text-green-600'
    if (attempt.scorePercent >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
                Chi tiết lần làm {attempt.attemptNo}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(attempt.createdAt)}
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
            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Điểm số</div>
                  <div className={`text-3xl font-bold ${getScoreColor()}`}>
                    {attempt.scorePercent.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Đúng/Tổng</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {attempt.correctCount}/{attempt.totalQuestions}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Thời gian</div>
                  <div className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-1">
                    <Clock size={20} className="text-gray-400" />
                    {formatDuration(attempt.timeSpent)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                  <div className="mt-2">
                    {attempt.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        <CheckCircle2 size={14} />
                        Hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                        Đang làm
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Answers Detail */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Chi tiết câu trả lời
              </h3>
              <div className="space-y-3">
                {gaps.map((gap, index) => {
                  const userAnswer = attempt.answers[gap.id] || ''
                  const isCorrect =
                    userAnswer.trim().toLowerCase() ===
                    gap.answer.trim().toLowerCase()

                  return (
                    <div
                      key={gap.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <XCircle size={20} className="text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-2">
                            Câu {index + 1}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">
                                Câu trả lời của bạn:
                              </span>
                              <span
                                className={`font-medium ${
                                  isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {userAnswer || '(Không trả lời)'}
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  Đáp án đúng:
                                </span>
                                <span className="font-medium text-green-700">
                                  {gap.answer}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
