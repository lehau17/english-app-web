import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import toast from 'react-hot-toast'

interface LearningAnalyticsData {
  success: boolean
  summary: {
    totalStudyTime: number
    lessonsCompleted: number
    assignmentsSubmitted: number
    avgScore: string
    studyStreak: number
    certificatesEarned: number
  }
  skillBreakdown: {
    vocabulary: {
      wordsLearned: number
      masteryRate: number
      weakTopics: string[]
      strongTopics: string[]
    }
    grammar: {
      topicsCompleted: number
      masteryRate: number
      weakTopics: string[]
      strongTopics: string[]
    }
    listening: {
      minutesPracticed: number
      masteryRate: number
      avgAccuracy: number
    }
    speaking: {
      minutesPracticed: number
      masteryRate: number
      avgPronunciationScore: number
    }
    reading: {
      articlesRead: number
      masteryRate: number
      readingSpeed: number
    }
    writing: {
      essaysWritten: number
      avgScore: number
      wordCount: number
    }
  }
  activityTrend?: {
    type: string
    title: string
    data: Array<{ date: string; count: number }>
  }
  scoreProgression?: {
    type: string
    title: string
    data: Array<{
      assignment: string
      score: number
      maxScore: number
      percentage: number
    }>
    trend: 'improving' | 'declining' | 'stable'
  }
  prediction?: {
    projectedLevelIn30Days: string
    currentLevel: string
    confidence: number
    basedOn: string
  }
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low'
    action: string
    reason: string
    suggestedLessons: any[]
  }>
  timeRange: string
  period: {
    start: string
    end: string
  }
}

interface LearningAnalyticsDashboardProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all-time'
}

export default function LearningAnalyticsDashboard({
  timeRange = 'month',
}: LearningAnalyticsDashboardProps) {
  const { user } = useAuth()
  const [selectedRange, setSelectedRange] = useState(timeRange)
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] =
    useState<LearningAnalyticsData | null>(null)

  const fetchAnalytics = async () => {
    if (!user?.id) return null

    setIsLoading(true)
    try {
      // Call API endpoint directly
      const response = await api.get('/private/v1/agent/learning-analytics', {
        params: {
          timeRange: selectedRange,
          includeCharts: true,
          includePrediction: true,
        },
      })

      if (response.data && response.data.success) {
        setAnalyticsData(response.data as LearningAnalyticsData)
        return response.data as LearningAnalyticsData
      } else {
        throw new Error('Không thể lấy dữ liệu thống kê')
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error)
      toast.error(
        error.response?.data?.message ||
          'Không thể tải thống kê học tập. Vui lòng thử lại!'
      )
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const { data, refetch } = useQuery({
    queryKey: ['learning-analytics', user?.id, selectedRange],
    queryFn: fetchAnalytics,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const displayData = analyticsData || data

  if (isLoading && !displayData) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!displayData || !displayData.success) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Chưa có dữ liệu học tập để hiển thị
          </p>
          <button
            onClick={() => refetch()}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Tải lại
          </button>
        </div>
      </div>
    )
  }

  const {
    summary,
    skillBreakdown,
    activityTrend,
    scoreProgression,
    prediction,
    recommendations,
  } = displayData

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Thống kê học tập</h3>
        <select
          value={selectedRange}
          onChange={(e) => {
            setSelectedRange(e.target.value as any)
            refetch()
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="quarter">3 tháng qua</option>
          <option value="year">Năm nay</option>
          <option value="all-time">Tất cả</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">
              Thời gian học
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {Math.round(summary.totalStudyTime / 60)}h
          </p>
          <p className="text-xs text-blue-600">{summary.totalStudyTime} phút</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            <span className="text-xs text-green-700 font-medium">
              Bài học hoàn thành
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {summary.lessonsCompleted}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-700 font-medium">
              Điểm trung bình
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {summary.avgScore}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-xs text-orange-700 font-medium">
              Chuỗi học tập
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-900">
            {summary.studyStreak}
          </p>
          <p className="text-xs text-orange-600">ngày</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-pink-700 font-medium">
              Bài tập nộp
            </span>
          </div>
          <p className="text-2xl font-bold text-pink-900">
            {summary.assignmentsSubmitted}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span className="text-xs text-yellow-700 font-medium">
              Chứng chỉ
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {summary.certificatesEarned}
          </p>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h4 className="text-base font-semibold mb-4">Phân tích kỹ năng</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(skillBreakdown).map(
            ([skill, data]: [string, any]) => (
              <div
                key={skill}
                className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {skill === 'vocabulary'
                      ? 'Từ vựng'
                      : skill === 'grammar'
                        ? 'Ngữ pháp'
                        : skill === 'listening'
                          ? 'Nghe'
                          : skill === 'speaking'
                            ? 'Nói'
                            : skill === 'reading'
                              ? 'Đọc'
                              : 'Viết'}
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {data.masteryRate || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data.masteryRate || 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {skill === 'vocabulary' && (
                    <span>{data.wordsLearned || 0} từ đã học</span>
                  )}
                  {skill === 'grammar' && (
                    <span>{data.topicsCompleted || 0} chủ đề</span>
                  )}
                  {skill === 'listening' && (
                    <span>{data.minutesPracticed || 0} phút luyện tập</span>
                  )}
                  {skill === 'speaking' && (
                    <span>{data.minutesPracticed || 0} phút luyện tập</span>
                  )}
                  {skill === 'reading' && (
                    <span>{data.articlesRead || 0} bài đọc</span>
                  )}
                  {skill === 'writing' && (
                    <span>{data.essaysWritten || 0} bài viết</span>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        {activityTrend && activityTrend.data.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h4 className="text-base font-semibold mb-4">
              {activityTrend.title}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityTrend.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Hoạt động"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Score Progression */}
        {scoreProgression && scoreProgression.data.length > 0 && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold">
                {scoreProgression.title}
              </h4>
              {scoreProgression.trend === 'improving' && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">Đang cải thiện</span>
                </div>
              )}
              {scoreProgression.trend === 'declining' && (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-medium">Cần cải thiện</span>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={scoreProgression.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="assignment" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Điểm (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Prediction */}
      {prediction && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border border-indigo-100">
          <h4 className="text-base font-semibold mb-4">Dự đoán trình độ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trình độ hiện tại</p>
              <p className="text-2xl font-bold text-indigo-900">
                {prediction.currentLevel}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Trình độ sau 30 ngày</p>
              <p className="text-2xl font-bold text-purple-900">
                {prediction.projectedLevelIn30Days}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Độ tin cậy</p>
              <p className="text-2xl font-bold text-indigo-900">
                {prediction.confidence}%
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Dựa trên: {prediction.basedOn}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h4 className="text-base font-semibold mb-4">Gợi ý cải thiện</h4>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-lg ${
                      rec.priority === 'high'
                        ? 'text-red-600'
                        : rec.priority === 'medium'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {rec.priority === 'high'
                      ? '🔴'
                      : rec.priority === 'medium'
                        ? '🟡'
                        : '🔵'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {rec.action}
                    </p>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
