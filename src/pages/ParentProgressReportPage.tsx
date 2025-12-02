import { Activity, BookOpen, CalendarDays, Clock, Target } from 'lucide-react'
import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Select } from '../components/ui/select'
import {
  useParentChildProgressQuery,
  useParentChildrenQuery,
} from '../hooks/parent.queries'

// Mock data for common mistakes (no API available)
const mockCommonMistakes = [
  {
    type: 'Phát âm',
    mistake:
      "Phát âm sai âm /θ/, thường đọc thành /t/ (ví dụ: 'think' -> 'tink')",
    suggestion: 'Luyện tập đặt lưỡi giữa hai hàm răng khi phát âm.',
  },
  {
    type: 'Ngữ pháp',
    mistake: 'Sử dụng sai thì hiện tại đơn cho hành động trong quá khứ.',
    suggestion: 'Ôn lại cách dùng thì quá khứ đơn (Past Simple).',
  },
  {
    type: 'Từ vựng',
    mistake: "Nhầm lẫn giữa 'affect' và 'effect'.",
    suggestion:
      "Ghi nhớ: 'affect' là động từ (ảnh hưởng), 'effect' là danh từ (kết quả).",
  },
]

// Map activity types to skills
const activityTypeToSkill: Record<string, string> = {
  LISTENING: 'Nghe',
  SPEAKING: 'Nói',
  READING: 'Đọc',
  WRITING: 'Viết',
  VOCABULARY: 'Từ vựng',
  GRAMMAR: 'Ngữ pháp',
}

export default function ParentProgressReportPage() {
  const { childId } = useParams<{ childId: string }>()
  const [timeRange, setTimeRange] = React.useState<
    '7days' | '30days' | 'allTime'
  >('7days')

  // Fetch children list to get child info
  const { data: childrenData } = useParentChildrenQuery(!!childId)

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const to = now.toISOString().split('T')[0]
    let from: string

    switch (timeRange) {
      case '7days':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
      case '30days':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
      case 'allTime':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        break
    }

    return { from, to }
  }, [timeRange])

  // Fetch progress data
  const { data: progressData, isLoading: isLoadingProgress } =
    useParentChildProgressQuery(
      childId || null,
      { from: dateRange.from, to: dateRange.to, limit: 1000 },
      !!childId
    )

  // Get child info
  const childInfo = useMemo(() => {
    if (!childrenData || !childId) return null
    return childrenData.find(
      (child: any) => child.id === childId || child.childId === childId
    )
  }, [childrenData, childId])

  // Process progress data for charts
  const chartData = useMemo(() => {
    if (!progressData?.data) return []

    const progressItems = progressData.data

    // Group by date and sum time spent
    const groupedByDate: Record<string, number> = {}

    progressItems.forEach((item) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0]
      const minutes = Math.round((item.timeSpent || 0) / 60)
      groupedByDate[date] = (groupedByDate[date] || 0) + minutes
    })

    // Convert to array and sort by date
    return Object.entries(groupedByDate)
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [progressData])

  // Calculate skills breakdown
  const skillData = useMemo(() => {
    if (!progressData?.data) return []

    const progressItems = progressData.data
    const skillScores: Record<string, { total: number; count: number }> = {}

    progressItems.forEach((item) => {
      const skill = activityTypeToSkill[item.activityType] || item.activityType
      const score = item.score || 0

      if (!skillScores[skill]) {
        skillScores[skill] = { total: 0, count: 0 }
      }

      skillScores[skill].total += score
      skillScores[skill].count += 1
    })

    // Calculate average scores
    return Object.entries(skillScores)
      .map(([skill, { total, count }]) => ({
        skill,
        score: count > 0 ? Math.round(total / count) : 0,
        fullMark: 100,
      }))
      .filter((item) => item.score > 0)
  }, [progressData])

  // Get recent activities (last 5 completed)
  const recentActivities = useMemo(() => {
    if (!progressData?.data) return []

    return progressData.data
      .filter((item) => item.state === 'done')
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        name: item.activityTitle,
        date: new Date(item.createdAt).toLocaleDateString('vi-VN'),
        score: item.score || 0,
      }))
  }, [progressData])

  const isLoading = isLoadingProgress || !childInfo
  const childName =
    childInfo?.name ||
    childInfo?.child?.displayName ||
    childInfo?.child?.firstName ||
    'Học sinh'
  const childAvatar = childInfo?.avatar || childInfo?.child?.avatarUrl

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!childId || !childInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Không tìm thấy thông tin học sinh.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {childAvatar &&
            (childAvatar.startsWith('http') || childAvatar.startsWith('/')) ? (
              <img
                src={childAvatar}
                alt={childName}
                className="h-16 w-16 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className={`h-16 w-16 rounded-full bg-primary/20 items-center justify-center text-primary font-bold text-xl ${
                childAvatar &&
                (childAvatar.startsWith('http') || childAvatar.startsWith('/'))
                  ? 'hidden'
                  : 'flex'
              }`}
            >
              {childName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Báo cáo tiến độ học tập
            </h1>
            <p className="text-lg text-muted-foreground">
              Học sinh: {childName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <Select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as '7days' | '30days' | 'allTime')
            }
            className="w-[180px]"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="allTime">Toàn thời gian</option>
          </Select>
        </div>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Study Time Chart */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Thời gian học mỗi ngày
            </CardTitle>
            <CardDescription>
              Tổng số phút học mỗi ngày trong khoảng thời gian đã chọn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có dữ liệu thời gian học trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis unit=" phút" />
                  <Tooltip
                    formatter={(value) => [`${value} phút`, 'Thời gian học']}
                  />
                  <Legend />
                  <Bar
                    dataKey="minutes"
                    name="Số phút học"
                    fill="var(--color-primary, #1E88E5)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Skills Breakdown */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Phân tích Kỹ năng
            </CardTitle>
            <CardDescription>
              Điểm số trung bình cho các kỹ năng cốt lõi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skillData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Chưa có dữ liệu kỹ năng
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={skillData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name={childName}
                    dataKey="score"
                    stroke="var(--color-primary, #1E88E5)"
                    fill="var(--color-primary, #1E88E5)"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Common Mistakes */}
        <Card className="col-span-1 lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Những lỗi cần cải thiện
            </CardTitle>
            <CardDescription>
              Các lỗi sai phổ biến và gợi ý để cải thiện.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCommonMistakes.map((item, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <p className="font-semibold text-primary">{item.type}</p>
                  <p className="text-sm">{item.mistake}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold">Gợi ý:</span>{' '}
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-1 lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Hoạt động gần đây
            </CardTitle>
            <CardDescription>
              5 hoạt động gần nhất đã hoàn thành.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                Chưa có hoạt động nào
              </div>
            ) : (
              <ul className="space-y-4">
                {recentActivities.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.date}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="font-semibold text-primary">
                        {activity.score}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
