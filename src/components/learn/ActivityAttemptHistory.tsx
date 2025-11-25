import { CheckCircle2, Clock, History, Loader2, X, XCircle } from 'lucide-react'
import { useActivityAttemptHistory } from '../../hooks/learn.hooks'
import { useAuth } from '../../context/AuthContext'
import type { Attempt } from '../../types/learn.type'

interface ActivityAttemptHistoryProps {
  activityId: string
  isOpen: boolean
  onClose: () => void
}

export function ActivityAttemptHistory({
  activityId,
  isOpen,
  onClose,
}: ActivityAttemptHistoryProps) {
  const { user } = useAuth()
  const { data, isLoading } = useActivityAttemptHistory(
    activityId,
    user?.id || '',
    { enabled: isOpen && !!user?.id }
  )

  if (!isOpen) return null

  // PageResponse structure: data.data.data contains the array
  // data = BaseResponse<PageResponse<Attempt>>
  // data.data = PageResponse<Attempt> = { data: Attempt[], page, limit, ... }
  // data.data.data = Attempt[]
  const attempts: Attempt[] = Array.isArray(data?.data?.data)
    ? data.data.data
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Lịch sử học tập</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Đang tải lịch sử...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có lịch sử học tập
              </h3>
              <p className="text-gray-600">
                Bạn chưa hoàn thành activity này lần nào.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map((attempt: Attempt) => {
                const scorePercent =
                  attempt.maxScore && attempt.score !== null
                    ? Math.round((attempt.score / attempt.maxScore) * 100)
                    : null
                const isPassed = scorePercent !== null && scorePercent >= 70

                return (
                  <div
                    key={attempt.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm sm:text-base">
                          {new Date(attempt.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {scorePercent !== null && (
                        <span
                          className={`font-semibold text-lg ${
                            isPassed ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {scorePercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {attempt.score !== null && attempt.maxScore !== null && (
                        <span>
                          Điểm: <strong>{attempt.score}</strong>/
                          {attempt.maxScore}
                        </span>
                      )}
                      {attempt.timeSpent && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(attempt.timeSpent / 60)} phút{' '}
                          {attempt.timeSpent % 60} giây
                        </span>
                      )}
                      {attempt.correctAnswers !== null &&
                        attempt.totalQuestions !== null && (
                          <span>
                            Đúng: <strong>{attempt.correctAnswers}</strong>/
                            {attempt.totalQuestions} câu
                          </span>
                        )}
                    </div>

                    {attempt.feedback && (
                      <div className="mt-3 text-sm text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        <strong className="text-blue-900">Nhận xét:</strong>{' '}
                        <span className="text-blue-800">
                          {attempt.feedback}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {attempts.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Tổng cộng: <strong>{attempts.length}</strong> lần làm bài
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
