import {
  CheckCircle,
  Loader2,
  XCircle,
  BookOpen,
  Mic,
  PenTool,
  FileText,
  Headphones,
  Gamepad2,
  MessageSquare,
} from 'lucide-react'
import type { GradingProgress } from '../hooks/useGradingSocket'

const activityIcons: Record<string, React.ComponentType<any>> = {
  quiz: FileText,
  grammar: FileText,
  listening: Headphones,
  reading: BookOpen,
  speaking: Mic,
  pronunciation: Mic,
  writing: PenTool,
  dictation: Headphones,
  vocab: BookOpen,
  flashcard: BookOpen,
  conversation: MessageSquare,
  mini_game: Gamepad2,
  default: FileText,
}

interface Props {
  progress: GradingProgress
  activities?: Array<{ id: string; type: string; title: string }>
  onBackToClassroom?: () => void
}

export function GradingProgressPanel({
  progress,
  activities = [],
  onBackToClassroom,
}: Props) {
  const percentage =
    progress.totalActivities > 0
      ? Math.round((progress.gradedActivities / progress.totalActivities) * 100)
      : 0

  if (progress.status === 'idle') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Đang kết nối...
        </h3>
        <p className="text-gray-500 text-sm">
          Vui lòng chờ trong giây lát để nhận kết quả chấm điểm.
        </p>
      </div>
    )
  }

  if (progress.status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Có lỗi xảy ra
        </h3>
        <p className="text-red-600">{progress.error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </button>
      </div>
    )
  }

  if (progress.status === 'complete') {
    const scoreColor =
      (progress.totalScore || 0) >= 80
        ? 'text-green-600'
        : (progress.totalScore || 0) >= 50
          ? 'text-yellow-600'
          : 'text-red-600'

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Hoàn thành chấm bài!
          </h3>
          <div className={`text-5xl font-bold ${scoreColor} mb-2`}>
            {progress.totalScore}%
          </div>
          <p className="text-green-700 max-w-md mx-auto">{progress.feedback}</p>
        </div>

        {/* Activity breakdown */}
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-gray-700 mb-3">
            Chi tiết điểm từng hoạt động:
          </h4>
          {activities.map((activity) => {
            const result = progress.activityResults[activity.id]
            const Icon = activityIcons[activity.type] || activityIcons.default
            const isFullScore = result?.score === result?.maxScore

            return (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">{activity.title}</span>
                </div>
                <div className="text-sm font-semibold">
                  {result ? (
                    <span
                      className={
                        isFullScore ? 'text-green-600' : 'text-orange-600'
                      }
                    >
                      {result.score}/{result.maxScore}
                    </span>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Back button */}
        {onBackToClassroom && (
          <div className="mt-6 text-center">
            <button
              onClick={onBackToClassroom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Quay lại lớp học
            </button>
          </div>
        )}
      </div>
    )
  }

  // Grading in progress
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Đang chấm bài...
        </h3>
        <p className="text-blue-600 text-sm">
          {progress.gradedActivities}/{progress.totalActivities} hoạt động đã
          chấm
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Activity list with grading status */}
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const result = progress.activityResults[activity.id]
          const isGrading = progress.gradedActivities === index
          const Icon = activityIcons[activity.type] || activityIcons.default

          return (
            <div
              key={activity.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                result
                  ? 'bg-green-50 border-green-200'
                  : isGrading
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${result ? 'text-green-500' : isGrading ? 'text-blue-500' : 'text-gray-400'}`}
                />
                <span
                  className={`text-sm font-medium ${result ? 'text-green-700' : 'text-gray-700'}`}
                >
                  {activity.title}
                </span>
              </div>
              <div className="text-sm">
                {result ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {result.score}/{result.maxScore}
                  </span>
                ) : isGrading ? (
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                ) : (
                  <span className="text-gray-400">Chờ chấm...</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
