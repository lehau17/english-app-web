import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  History,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getMySubmissionHistory,
  getMySubmissionResult,
} from '../services/assignment.api'

// API interfaces based on backend models
interface AssignmentResult {
  id: string
  assignmentId: string
  studentId: string
  answers: Record<string, any>
  score?: number
  submittedAt: string
  gradedAt?: string
  timeSpent?: number
  attemptCount: number
  feedback?: string
  assignment: {
    id: string
    title: string
    totalPoints: number
    maxAttempts: number
    assignmentActivities: ActivityForResult[]
  }
}

interface ActivityForResult {
  id: string
  title: string
  type: string
  points: number
  content: any
}

export default function AssignmentResultPage(): JSX.Element {
  const navigate = useNavigate()
  const { classroomId, assignmentId } = useParams<{
    classroomId: string
    assignmentId: string
  }>()

  const [result, setResult] = useState<AssignmentResult | null>(null)
  const [history, setHistory] = useState<AssignmentResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  // Helper function to calculate percentage
  const getPercentage = (result: AssignmentResult): number => {
    if (!result.score || !result.assignment.totalPoints) return 0
    return Math.round((result.score / result.assignment.totalPoints) * 100)
  }

  // Helper function to calculate activity results from submission data
  const getActivityResults = (result: AssignmentResult) => {
    return result.assignment.assignmentActivities.map(
      (activity, activityIndex) => {
        const userAnswer =
          result.answers[`activity${activityIndex}`] ||
          result.answers[activity.id]

        // Initialize variables
        let isCorrect = false
        let correctAnswer = undefined
        const detailedResults: any[] = []
        let totalCorrect = 0
        let totalQuestions = 0

        if (activity.type === 'listening' && activity.content?.questions) {
          // Handle listening with multiple questions (new format)
          const questions = activity.content.questions
          totalQuestions = questions.length

          questions.forEach((q: any, qIndex: number) => {
            const userAnswerForQ = userAnswer?.[qIndex]
            const isQuestionCorrect = userAnswerForQ === q.correctIndex
            if (isQuestionCorrect) totalCorrect++

            detailedResults.push({
              question: q.question,
              userAnswer:
                userAnswerForQ !== undefined
                  ? `Đáp án ${userAnswerForQ + 1}`
                  : 'Chưa trả lời',
              correctAnswer: `Đáp án ${q.correctIndex + 1}`,
              isCorrect: isQuestionCorrect,
            })
          })

          isCorrect = totalCorrect === totalQuestions
        } else if (
          (activity.type === 'quiz' || activity.type === 'grammar') &&
          activity.content?.questions &&
          Array.isArray(activity.content.questions)
        ) {
          // Handle quiz/grammar with multiple questions (new format)
          const questions = activity.content.questions
          totalQuestions = questions.length

          questions.forEach((q: any, qIndex: number) => {
            // User answer is stored as { 0: selectedIndex, 1: selectedIndex, ... }
            const userAnswerForQ = userAnswer?.[qIndex]
            const isQuestionCorrect = userAnswerForQ === q.correctIndex
            if (isQuestionCorrect) totalCorrect++

            detailedResults.push({
              question: q.question,
              userAnswer:
                userAnswerForQ !== undefined
                  ? q.options?.[userAnswerForQ] ||
                    `Đáp án ${userAnswerForQ + 1}`
                  : 'Chưa trả lời',
              correctAnswer:
                q.options?.[q.correctIndex] || `Đáp án ${q.correctIndex + 1}`,
              isCorrect: isQuestionCorrect,
            })
          })

          isCorrect = totalCorrect === totalQuestions
        } else if (
          (activity.type === 'quiz' || activity.type === 'grammar') &&
          activity.content?.question
        ) {
          // Handle quiz/grammar with single question (legacy format)
          totalQuestions = 1
          const isQuestionCorrect = userAnswer === activity.content.correctIndex
          if (isQuestionCorrect) totalCorrect = 1

          detailedResults.push({
            question: activity.content.question,
            userAnswer:
              userAnswer !== undefined
                ? activity.content.options?.[userAnswer] ||
                  `Đáp án ${userAnswer + 1}`
                : 'Chưa trả lời',
            correctAnswer:
              activity.content.options?.[activity.content.correctIndex] ||
              `Đáp án ${activity.content.correctIndex + 1}`,
            isCorrect: isQuestionCorrect,
          })

          isCorrect = isQuestionCorrect
        } else if (
          activity.type === 'reading' &&
          activity.content?.questions &&
          Array.isArray(activity.content.questions)
        ) {
          // Handle reading with multiple questions
          const questions = activity.content.questions
          totalQuestions = questions.length

          questions.forEach((q: any, qIndex: number) => {
            const userAnswerForQ = userAnswer?.[qIndex]
            const isQuestionCorrect = userAnswerForQ === q.correctIndex
            if (isQuestionCorrect) totalCorrect++

            detailedResults.push({
              question: q.question,
              userAnswer:
                userAnswerForQ !== undefined
                  ? q.options?.[userAnswerForQ] ||
                    `Đáp án ${userAnswerForQ + 1}`
                  : 'Chưa trả lời',
              correctAnswer:
                q.options?.[q.correctIndex] || `Đáp án ${q.correctIndex + 1}`,
              isCorrect: isQuestionCorrect,
            })
          })

          isCorrect = totalCorrect === totalQuestions
        } else if (
          activity.type === 'fill_blank' &&
          activity.content?.questions
        ) {
          // Handle fill blank
          const question = activity.content.questions[0]
          if (question && question.correctAnswer) {
            isCorrect =
              userAnswer?.toString().toLowerCase().trim() ===
              question.correctAnswer.toLowerCase().trim()
            correctAnswer = question.correctAnswer
            totalQuestions = 1
            if (isCorrect) totalCorrect = 1
          }
        }

        // Calculate earned points based on correct ratio
        const earnedPoints =
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * activity.points)
            : isCorrect
              ? activity.points
              : 0

        return {
          id: activity.id,
          title: activity.title,
          type: activity.type,
          points: activity.points,
          earnedPoints,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          feedback: isCorrect ? 'Chính xác!' : 'Cần cải thiện',
          detailedResults,
          totalCorrect,
          totalQuestions,
        }
      }
    )
  }

  useEffect(() => {
    const loadResult = async () => {
      if (!assignmentId) {
        navigate(`/classroom/${classroomId}`)
        return
      }

      try {
        setIsLoading(true)

        // Load both current submission and history
        const [currentResponse, historyResponse] = await Promise.all([
          getMySubmissionResult(assignmentId),
          getMySubmissionHistory(assignmentId),
        ])

        const submissionData = currentResponse.data
        const historyData = historyResponse.data || []

        if (!submissionData) {
          // No submission found, redirect back
          navigate(`/classroom/${classroomId}/assignment/${assignmentId}`)
          return
        }

        setResult(submissionData)
        setHistory(historyData)
      } catch (error) {
        console.error('Error loading result:', error)
        navigate(`/classroom/${classroomId}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadResult()
  }, [assignmentId, classroomId, navigate])

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'border-green-200 bg-green-50'
    if (percentage >= 60) return 'border-yellow-200 bg-yellow-50'
    return 'border-red-200 bg-red-50'
  }

  const getGradeText = (percentage: number): string => {
    if (percentage >= 90) return 'Xuất sắc'
    if (percentage >= 80) return 'Giỏi'
    if (percentage >= 70) return 'Khá'
    if (percentage >= 60) return 'Trung bình'
    return 'Yếu'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Không tìm thấy kết quả bài tập</p>
          <button
            onClick={() => navigate(`/classroom/${classroomId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Quay về lớp học
          </button>
        </div>
      </div>
    )
  }

  const activityResults = getActivityResults(result)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/classroom/${classroomId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kết quả bài tập
              </h1>
              <p className="text-gray-600">{result.assignment.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Score Summary */}
        <div
          className={`rounded-xl border-2 p-6 mb-8 ${getScoreBgColor(getPercentage(result))}`}
        >
          <div className="text-center">
            <div
              className={`text-4xl font-bold mb-2 ${getScoreColor(getPercentage(result))}`}
            >
              {result.score || 0}/{result.assignment.totalPoints}
            </div>
            <div
              className={`text-2xl font-semibold mb-4 ${getScoreColor(getPercentage(result))}`}
            >
              {getPercentage(result)}% - {getGradeText(getPercentage(result))}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Thời gian: {formatTime(result.timeSpent || 0)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span>
                  Lần làm:{' '}
                  {history.length > 0 ? history.length : result.attemptCount}/
                  {result.assignment.maxAttempts}
                </span>
              </div>
            </div>
          </div>

          {result.feedback && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                {result.feedback.includes('Xuất sắc') ||
                result.feedback.includes('AI')
                  ? 'Phản hồi tự động:'
                  : 'Nhận xét từ giáo viên:'}
              </h4>
              <div className="text-blue-800 whitespace-pre-line">
                {result.feedback}
              </div>
            </div>
          )}

          {/* Submission History */}
          {history.length > 1 && (
            <div className="mt-4">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <History className="h-4 w-4" />
                {showHistory
                  ? 'Ẩn lịch sử'
                  : `Xem lịch sử (${history.length} lần làm)`}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2">
                  {history.map((submission) => (
                    <div
                      key={submission.id}
                      className={`p-3 rounded-lg border ${
                        submission.id === result.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            Lần {submission.attemptCount}
                            {submission.id === result.id && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Hiện tại
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-semibold ${getScoreColor(
                              Math.round(
                                ((submission.score || 0) /
                                  result.assignment.totalPoints) *
                                  100
                              )
                            )}`}
                          >
                            {submission.score || 0}/
                            {result.assignment.totalPoints}(
                            {Math.round(
                              ((submission.score || 0) /
                                result.assignment.totalPoints) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(submission.submittedAt).toLocaleString(
                            'vi-VN'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Activity Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Chi tiết bài làm
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {activityResults.map((activity, index: number) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          Hoạt động {index + 1}: {activity.title}
                        </span>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${
                            activity.isCorrect
                              ? 'bg-green-100 text-green-700'
                              : activity.totalCorrect > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {activity.isCorrect ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Hoàn hảo
                            </>
                          ) : activity.totalCorrect > 0 ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Một phần
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Chưa đúng
                            </>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Điểm: {activity.earnedPoints}/{activity.points}
                        {activity.totalQuestions > 1 && (
                          <span className="ml-2">
                            ({activity.totalCorrect}/{activity.totalQuestions}{' '}
                            câu đúng)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed results for multiple questions */}
                  {activity.detailedResults &&
                  activity.detailedResults.length > 0 ? (
                    <div className="space-y-3">
                      {activity.detailedResults.map(
                        (detail: any, qIndex: number) => (
                          <div
                            key={qIndex}
                            className="pl-4 border-l-2 border-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Câu {qIndex + 1}: {detail.question}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">
                                  Bạn trả lời:{' '}
                                </span>
                                <span
                                  className={
                                    detail.isCorrect
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }
                                >
                                  {detail.userAnswer}
                                </span>
                              </div>
                              {!detail.isCorrect && (
                                <div>
                                  <span className="font-medium text-gray-600">
                                    Đáp án đúng:{' '}
                                  </span>
                                  <span className="text-green-600">
                                    {detail.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    /* Single question format */
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Câu trả lời của bạn:{' '}
                        </span>
                        <span
                          className={
                            activity.isCorrect
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {typeof activity.userAnswer === 'number'
                            ? `Đáp án ${activity.userAnswer + 1}`
                            : activity.userAnswer || 'Chưa trả lời'}
                        </span>
                      </div>

                      {!activity.isCorrect &&
                        activity.correctAnswer !== undefined && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Đáp án đúng:{' '}
                            </span>
                            <span className="text-green-600">
                              {typeof activity.correctAnswer === 'number'
                                ? `Đáp án ${activity.correctAnswer + 1}`
                                : activity.correctAnswer}
                            </span>
                          </div>
                        )}

                      {activity.feedback && (
                        <div className="text-sm text-gray-600 italic">
                          <span className="font-medium">Nhận xét: </span>
                          {activity.feedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Thống kê</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {activityResults.filter((a: any) => a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {activityResults.filter((a: any) => !a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Câu sai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(
                    (activityResults.filter((a: any) => a.isCorrect).length /
                      activityResults.length) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(`/classroom/${classroomId}`)}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Quay về lớp học
          </button>

          {history.length < result.assignment.maxAttempts && (
            <button
              onClick={() =>
                navigate(`/classroom/${classroomId}/assignment/${assignmentId}`)
              }
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Làm lại ({history.length}/{result.assignment.maxAttempts})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
