import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Clock,
  Download,
  Loader2,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import {
  useParentChildProgressQuery,
  useParentDashboardQuery,
} from '../hooks/parent.queries'
import type {
  ChildProgress,
  ParentChildProgressItem,
} from '../types/parent.type'

const ACTIVITY_LABELS: Record<string, string> = {
  vocabulary: 'Từ vựng',
  grammar: 'Ngữ pháp',
  listening: 'Nghe',
  speaking: 'Nói',
  reading: 'Đọc',
  writing: 'Viết',
  podcast: 'Podcast',
  game: 'Trò chơi',
}

const COMPLETED_STATES = new Set(['done', 'completed', 'mastered'])

const isCompletedState = (state?: string) =>
  state ? COMPLETED_STATES.has(state) : false

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  done: { label: 'Hoàn thành', color: 'text-green-600' },
  completed: { label: 'Hoàn thành', color: 'text-green-600' },
  mastered: { label: 'Hoàn thành', color: 'text-green-600' },
  in_progress: { label: 'Đang học', color: 'text-blue-600' },
  inprogress: { label: 'Đang học', color: 'text-blue-600' },
  failed: { label: 'Chưa đạt', color: 'text-red-600' },
  not_started: { label: 'Chưa bắt đầu', color: 'text-gray-500' },
  review_needed: { label: 'Cần ôn luyện', color: 'text-orange-600' },
}

function getStatusInfo(state?: string) {
  if (!state) return { label: 'Không rõ', color: 'text-gray-500' }
  const normalized = state.toLowerCase()
  return (
    STATUS_LABELS[normalized] ?? { label: normalized, color: 'text-gray-500' }
  )
}

const PERIOD_DAY_MAP = {
  week: 7,
  month: 30,
  quarter: 90,
} as const

type PeriodKey = keyof typeof PERIOD_DAY_MAP

type ProgressData = {
  date: string
  studyMinutes: number
  activitiesCompleted: number
  accuracy?: number
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 phút'
  const rounded = Math.round(minutes)
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60
  if (hours > 0) {
    return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`
  }
  return `${mins} phút`
}

function getActivityLabel(type: string): string {
  const normalized = type?.toLowerCase?.() ?? ''
  if (normalized in ACTIVITY_LABELS) {
    return ACTIVITY_LABELS[normalized as keyof typeof ACTIVITY_LABELS]
  }
  return normalized
    ? normalized
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Khác'
}

function toDateKey(date: Date): string {
  return startOfDay(date).toISOString().split('T')[0]
}

function buildDailySummary(
  records: ParentChildProgressItem[],
  days: number,
  endDate: Date
): ProgressData[] {
  const buckets = new Map<
    string,
    {
      studySeconds: number
      completed: number
      accuracySum: number
      accuracyCount: number
    }
  >()

  records.forEach((record) => {
    const key = toDateKey(new Date(record.createdAt))
    const bucket = buckets.get(key) ?? {
      studySeconds: 0,
      completed: 0,
      accuracySum: 0,
      accuracyCount: 0,
    }

    bucket.studySeconds += record.timeSpent ?? 0
    if (isCompletedState(record.state)) {
      bucket.completed += 1
    }
    if (typeof record.score === 'number') {
      bucket.accuracySum += record.score
      bucket.accuracyCount += 1
    }

    buckets.set(key, bucket)
  })

  const series: ProgressData[] = []
  const normalizedEnd = startOfDay(endDate)

  for (let offset = days - 1; offset >= 0; offset--) {
    const current = new Date(normalizedEnd)
    current.setDate(normalizedEnd.getDate() - offset)
    const key = toDateKey(current)
    const bucket = buckets.get(key) ?? {
      studySeconds: 0,
      completed: 0,
      accuracySum: 0,
      accuracyCount: 0,
    }

    series.push({
      date: key,
      studyMinutes: Math.round(bucket.studySeconds / 60),
      activitiesCompleted: bucket.completed,
      accuracy:
        bucket.accuracyCount > 0
          ? Math.round(bucket.accuracySum / bucket.accuracyCount)
          : undefined,
    })
  }

  return series
}

function deriveTopLabels(
  records: ParentChildProgressItem[],
  predicate: (record: ParentChildProgressItem) => boolean
): string[] {
  const counts = new Map<string, number>()

  records.filter(predicate).forEach((record) => {
    const label = getActivityLabel(record.activityType)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label)

  return top.length > 0 ? top : ['Chưa có dữ liệu']
}

function getProgressTrend(child: ChildProgress): 'up' | 'down' | 'stable' {
  const completionRate =
    child.totalActivities > 0
      ? (child.completedActivities / child.totalActivities) * 100
      : 0

  if (completionRate >= 70) return 'up'
  if (completionRate <= 30) return 'down'
  return 'stable'
}

function ChildAvatar({ child }: { child: ChildProgress }) {
  if (child.avatar && child.avatar.startsWith('http')) {
    return (
      <img
        src={child.avatar}
        alt={child.name}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  const fallback = child.avatar?.trim() || child.name.charAt(0) || '👦'

  return (
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
      {fallback.slice(0, 2)}
    </div>
  )
}

function ChildReportCard({
  child,
  period,
}: {
  child: ChildProgress
  period: PeriodKey
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const periodDays = PERIOD_DAY_MAP[period]

  const queryWindow = useMemo(() => {
    const end = startOfDay(new Date())
    const start = new Date(end)
    start.setDate(end.getDate() - (periodDays - 1))

    return {
      params: {
        from: start.toISOString(),
        to: end.toISOString(),
        limit: periodDays * 10,
        page: 1,
      },
      end,
    }
  }, [periodDays])

  const {
    data: progressPage,
    isLoading,
    isError,
  } = useParentChildProgressQuery(
    isExpanded ? child.id : null,
    queryWindow.params,
    isExpanded
  )

  const progressItems = useMemo(() => progressPage?.data ?? [], [progressPage])

  const weeklyData = useMemo(
    () => buildDailySummary(progressItems, periodDays, queryWindow.end),
    [progressItems, periodDays, queryWindow.end]
  )

  const daysWithData = useMemo(
    () =>
      weeklyData.filter(
        (day) =>
          day.studyMinutes > 0 ||
          day.activitiesCompleted > 0 ||
          (day.accuracy ?? 0) > 0
      ),
    [weeklyData]
  )

  const completionRate =
    child.totalActivities > 0
      ? Math.round((child.completedActivities / child.totalActivities) * 100)
      : 0

  const strengths = useMemo(
    () =>
      deriveTopLabels(
        progressItems,
        (item) => isCompletedState(item.state) && (item.score ?? 0) >= 75
      ),
    [progressItems]
  )

  const improvements = useMemo(
    () =>
      deriveTopLabels(
        progressItems,
        (item) => (item.score ?? 0) > 0 && (item.score ?? 0) < 60
      ),
    [progressItems]
  )

  const trend = getProgressTrend(child)

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <ChildAvatar child={child} />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900">
                  {child.name}
                </h3>
                <Badge variant={trend === 'up' ? 'default' : 'secondary'}>
                  {trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : trend === 'down' ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : null}
                  {trend === 'up'
                    ? 'Tiến bộ'
                    : trend === 'down'
                      ? 'Cần cải thiện'
                      : 'Ổn định'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Hoạt động gần nhất: {child.recentActivity}
              </p>
              <p className="text-xs text-gray-400">
                Lần cuối hoạt động: {child.lastActive}
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? 'Thu gọn' : 'Chi tiết'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-900">
            {formatMinutes(child.todayStudyTime)}
          </p>
          <p className="text-xs text-gray-600">Thời gian học hôm nay</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <BookOpen className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-900">
            {child.completedActivities}
          </p>
          <p className="text-xs text-gray-600">Bài hoàn thành hôm nay</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Target className="h-5 w-5 text-purple-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-900">{completionRate}%</p>
          <p className="text-xs text-gray-600">Tỷ lệ hoàn thành</p>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu tiến trình...
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              Không thể tải dữ liệu tiến trình. Vui lòng thử lại sau.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Điểm mạnh
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((label) => (
                      <Badge
                        key={`strength-${label}`}
                        variant="outline"
                        className="text-green-700 border-green-100"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Cần cải thiện
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {improvements.map((label) => (
                      <Badge
                        key={`improvement-${label}`}
                        variant="outline"
                        className="text-orange-700 border-orange-100"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Chi tiết theo ngày
                </h5>
                {daysWithData.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Chưa có dữ liệu cho giai đoạn đã chọn
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daysWithData.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">
                          {new Date(day.date).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{formatMinutes(day.studyMinutes)}</span>
                          <span>{day.activitiesCompleted} bài</span>
                          <span>
                            {day.accuracy !== undefined
                              ? `${day.accuracy}% điểm`
                              : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Hoạt động ghi nhận
                </h5>
                {progressItems.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    Chưa có dữ liệu từ API trong giai đoạn này
                  </div>
                ) : (
                  <div className="space-y-2">
                    {progressItems.slice(0, 12).map((item) => {
                      const statusInfo = getStatusInfo(item.state)
                      return (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.activityTitle}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline">
                                {getActivityLabel(item.activityType)}
                              </Badge>
                              <span className={statusInfo.color}>
                                {statusInfo.label}
                              </span>
                              <span>
                                {new Date(item.createdAt).toLocaleDateString(
                                  'vi-VN',
                                  {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-600">
                            <p>
                              Điểm:{' '}
                              {item.score !== null && item.score !== undefined
                                ? `${item.score}%`
                                : '—'}
                            </p>
                            <p>
                              Thời gian:{' '}
                              {item.timeSpent
                                ? formatMinutes(Math.round(item.timeSpent / 60))
                                : '—'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}

export default function ParentReportsPage() {
  const { data: dashboardData, isLoading } = useParentDashboardQuery()
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('week')
  const [selectedChild, setSelectedChild] = useState<'all' | string>('all')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const children = dashboardData?.children ?? []
  const filteredChildren =
    selectedChild === 'all'
      ? children
      : children.filter((child) => child.id === selectedChild)

  const handleExportReport = () => {
    const target = filteredChildren.length > 0 ? filteredChildren : children

    if (target.length === 0) {
      toast.error('Không có dữ liệu để xuất báo cáo')
      return
    }

    const rows = [
      [
        'Tên',
        'Thời gian học (phút)',
        'Bài đã hoàn thành',
        'Tổng bài',
        'Tỷ lệ hoàn thành (%)',
        'Hoạt động gần nhất',
        'Lần cuối hoạt động',
      ],
      ...target.map((child) => {
        const completionRate =
          child.totalActivities > 0
            ? Math.round(
                (child.completedActivities / child.totalActivities) * 100
              )
            : 0

        return [
          child.name,
          String(child.todayStudyTime ?? 0),
          String(child.completedActivities ?? 0),
          String(child.totalActivities ?? 0),
          String(completionRate),
          child.recentActivity,
          child.lastActive,
        ]
      }),
    ]

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'parent-progress-report.csv'
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Xuất báo cáo thành công')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Báo cáo tiến độ
            </h1>
            <p className="text-gray-600">
              Theo dõi chi tiết tiến độ học tập của các con
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian
            </label>
            <select
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(event.target.value as PeriodKey)
              }
              className="px-4 py-2.5 bg-white border border-gray-200/60 rounded-lg text-sm font-medium text-gray-900 shadow-sm hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">90 ngày qua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Con
            </label>
            <select
              value={selectedChild}
              onChange={(event) =>
                setSelectedChild(event.target.value as 'all' | string)
              }
              className="px-4 py-2.5 bg-white border border-gray-200/60 rounded-lg text-sm font-medium text-gray-900 shadow-sm hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">Tất cả</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredChildren.length === 0 ? (
            <Card className="p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có báo cáo
              </h3>
              <p className="text-gray-600">
                Dữ liệu báo cáo sẽ xuất hiện khi con bắt đầu học tập
              </p>
            </Card>
          ) : (
            filteredChildren.map((child) => (
              <ChildReportCard
                key={child.id}
                child={child}
                period={selectedPeriod}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
