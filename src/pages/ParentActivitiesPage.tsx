import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Gamepad2,
  Headphones,
  PlayCircle,
  Search,
  Users,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  useParentActivitiesQuery,
  useParentChildrenQuery,
} from '../hooks/parent.queries'
import type { ParentActivitiesQuery } from '../services/parent.api'

interface Activity {
  id: string
  childId: string
  childName: string
  childAvatar?: string
  type:
    | 'vocabulary'
    | 'grammar'
    | 'listening'
    | 'speaking'
    | 'reading'
    | 'writing'
    | 'podcast'
    | 'game'
  title: string
  description?: string
  status: 'completed' | 'in_progress' | 'failed' | 'skipped'
  score?: number
  timeSpent: number
  startedAt: Date
  completedAt?: Date
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

const ACTIVITY_TYPES = {
  vocabulary: { label: 'Từ vựng', icon: BookOpen, colorClass: 'blue' },
  grammar: { label: 'Ngữ pháp', icon: BookOpen, colorClass: 'green' },
  listening: { label: 'Nghe', icon: Headphones, colorClass: 'purple' },
  speaking: { label: 'Nói', icon: PlayCircle, colorClass: 'orange' },
  reading: { label: 'Đọc', icon: BookOpen, colorClass: 'indigo' },
  writing: { label: 'Viết', icon: BookOpen, colorClass: 'pink' },
  podcast: { label: 'Podcast', icon: Headphones, colorClass: 'cyan' },
  game: { label: 'Trò chơi', icon: Gamepad2, colorClass: 'yellow' },
}

const STATUS_CONFIG = {
  completed: { label: 'Hoàn thành', icon: CheckCircle, colorClass: 'green' },
  in_progress: { label: 'Đang làm', icon: PlayCircle, colorClass: 'blue' },
  failed: { label: 'Thất bại', icon: XCircle, colorClass: 'red' },
  skipped: { label: 'Bỏ qua', icon: XCircle, colorClass: 'gray' },
}

// Helper function to get color classes
const getActivityColorClasses = (colorClass: string) => {
  const colorMap: Record<string, { bg: string; text: string; badge: string }> =
    {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        badge: 'bg-blue-50 text-blue-700',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        badge: 'bg-green-50 text-green-700',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        badge: 'bg-purple-50 text-purple-700',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        badge: 'bg-orange-50 text-orange-700',
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        badge: 'bg-indigo-50 text-indigo-700',
      },
      pink: {
        bg: 'bg-pink-100',
        text: 'text-pink-600',
        badge: 'bg-pink-50 text-pink-700',
      },
      cyan: {
        bg: 'bg-cyan-100',
        text: 'text-cyan-600',
        badge: 'bg-cyan-50 text-cyan-700',
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        badge: 'bg-yellow-50 text-yellow-700',
      },
    }
  return colorMap[colorClass] || colorMap.blue
}

const getStatusColorClasses = (colorClass: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
      },
    }
  return colorMap[colorClass] || colorMap.gray
}

function ActivityCard({ activity }: { activity: Activity }) {
  const activityType =
    ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.vocabulary
  const statusConfig =
    STATUS_CONFIG[activity.status] || STATUS_CONFIG.in_progress
  const IconComponent = activityType.icon
  const StatusIcon = statusConfig.icon

  const activityColors = getActivityColorClasses(activityType.colorClass)
  const statusColors = getStatusColorClasses(statusConfig.colorClass)

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 ${activityColors.bg} rounded-lg`}>
            <IconComponent className={`h-5 w-5 ${activityColors.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-md border ${activityColors.badge} border-transparent`}
              >
                {activityType.label}
              </span>
            </div>
            {activity.description && (
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {activity.childAvatar && (
                  <img
                    src={activity.childAvatar}
                    alt={activity.childName}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                {activity.childName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(activity.timeSpent)}
              </span>
              <span>•</span>
              <span className="capitalize">
                {activity.difficulty === 'easy'
                  ? 'Dễ'
                  : activity.difficulty === 'medium'
                    ? 'Trung bình'
                    : 'Khó'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activity.score !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-md ${
                activity.score >= 80
                  ? 'bg-green-100 text-green-800'
                  : activity.score >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {activity.score}%
            </span>
          )}
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-md border flex items-center gap-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span>{activity.category}</span>
        <div className="flex items-center gap-4">
          <span>
            Bắt đầu:{' '}
            {activity.startedAt.toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {activity.completedAt && (
            <span>
              Hoàn thành:{' '}
              {activity.completedAt.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ParentActivitiesPage() {
  const { data: childrenResp, isLoading: childrenLoading } =
    useParentChildrenQuery()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChild, setSelectedChild] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const periodRange = useMemo(() => {
    const now = new Date()
    if (selectedPeriod === 'all') {
      return { from: undefined, to: undefined }
    }

    const to = now.toISOString()
    let fromDate = new Date(now)

    if (selectedPeriod === 'today') {
      fromDate = new Date(now)
      fromDate.setHours(0, 0, 0, 0)
    } else if (selectedPeriod === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (selectedPeriod === 'month') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return { from: fromDate.toISOString(), to }
  }, [selectedPeriod])

  const backendTypeFilter = useMemo(() => {
    if (selectedType === 'all') return undefined
    if (selectedType === 'game') return undefined // aggregated locally
    return selectedType
  }, [selectedType])

  const serverFilters: ParentActivitiesQuery = useMemo(
    () => ({
      page: currentPage,
      limit: pageSize,
      childId: selectedChild !== 'all' ? selectedChild : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      type: backendTypeFilter,
      from: periodRange.from,
      to: periodRange.to,
    }),
    [
      backendTypeFilter,
      currentPage,
      pageSize,
      selectedChild,
      selectedStatus,
      periodRange.from,
      periodRange.to,
    ]
  )

  const { data: activitiesResponse, isLoading: activitiesLoading } =
    useParentActivitiesQuery(serverFilters)

  const isLoading = childrenLoading || activitiesLoading

  // Normalize activities from API to match Activity interface
  const normalizedActivities = useMemo<Activity[]>(() => {
    const rawActivities = (activitiesResponse as any)?.data || []

    // Map backend types to UI types
    const typeMap: Record<string, Activity['type']> = {
      vocabulary: 'vocabulary',
      vocab: 'vocabulary',
      grammar: 'grammar',
      listening: 'listening',
      reading: 'reading',
      writing: 'writing',
      speaking: 'speaking',
      pronunciation: 'speaking',
      podcast: 'podcast',
      quiz: 'game',
      matching: 'game',
      fill_blank: 'game',
      game: 'game',
    }

    // Map backend difficulty to UI difficulty
    const difficultyMap: Record<string, Activity['difficulty']> = {
      beginner: 'easy',
      easy: 'easy',
      intermediate: 'medium',
      medium: 'medium',
      advanced: 'hard',
      hard: 'hard',
    }

    const normalized = rawActivities.map((item: any) => {
      const normalizedType = typeMap[item.type] || 'game'
      const normalizedDifficulty =
        difficultyMap[item.difficulty?.toLowerCase()] || 'medium'

      return {
        id: item.id,
        childId: item.childId,
        childName: item.childName || '',
        childAvatar: item.childAvatar,
        type: normalizedType,
        title: item.title || 'Hoạt động',
        description: item.description,
        status: item.status || 'in_progress',
        score: item.score,
        timeSpent: item.timeSpent || 0,
        startedAt: item.startedAt ? new Date(item.startedAt) : new Date(),
        completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
        difficulty: normalizedDifficulty,
        category: item.category || 'Khác',
      }
    })

    return normalized
  }, [activitiesResponse])

  const children = useMemo(
    () => (childrenResp as any)?.data || childrenResp || [],
    [childrenResp]
  )

  // Apply client-side filters (search + period + aggregated type)
  const filteredActivities = normalizedActivities.filter(
    (activity: Activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        activity.childName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesChild =
        selectedChild === 'all' || activity.childId === selectedChild
      const matchesType =
        selectedType === 'all' || activity.type === selectedType
      const matchesStatus =
        selectedStatus === 'all' || activity.status === selectedStatus

      // Period filter
      let matchesPeriod = true
      if (selectedPeriod === 'today') {
        matchesPeriod =
          new Date(activity.startedAt).toDateString() ===
          new Date().toDateString()
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        matchesPeriod = activity.startedAt >= weekAgo
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        matchesPeriod = activity.startedAt >= monthAgo
      }

      return (
        matchesSearch &&
        matchesChild &&
        matchesType &&
        matchesStatus &&
        matchesPeriod
      )
    }
  )

  const paginatedActivities = filteredActivities

  const totalItems =
    (activitiesResponse as any)?.totalItems ?? filteredActivities.length
  const totalPages = (activitiesResponse as any)?.totalPages ?? 1
  const currentServerPage = (activitiesResponse as any)?.page ?? currentPage

  // Calculate stats
  const stats = {
    total: totalItems,
    completed: filteredActivities.filter((a) => a.status === 'completed')
      .length,
    inProgress: filteredActivities.filter((a) => a.status === 'in_progress')
      .length,
    averageScore: Math.round(
      filteredActivities
        .filter((a) => a.score !== undefined)
        .reduce((sum: number, a) => sum + (a.score || 0), 0) /
        (filteredActivities.filter((a) => a.score !== undefined).length || 1)
    ),
    totalTime: filteredActivities.reduce(
      (sum: number, a) => sum + a.timeSpent,
      0
    ),
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Hoạt động học tập
          </h1>
          <p className="text-gray-600">
            Theo dõi chi tiết các hoạt động học tập của con
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng hoạt động</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlayCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang làm</p>
                <p className="text-xl font-semibold">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Điểm TB</p>
                <p className="text-xl font-semibold">
                  {stats.averageScore || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Clock className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="text-xl font-semibold">{stats.totalTime} phút</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động, con..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handleFilterChange()
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="h-4 w-4 inline mr-1" />
                Con
              </label>
              <select
                value={selectedChild}
                onChange={(e) => {
                  setSelectedChild(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                {children?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Filter className="h-4 w-4 inline mr-1" />
                Loại hoạt động
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Thời gian
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value)
                  handleFilterChange()
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Hôm nay</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy hoạt động nào
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị {paginatedActivities.length} / {totalItems} hoạt động
                  {totalPages > 1 &&
                    ` (Trang ${currentServerPage}/${totalPages})`}
                </p>
              </div>

              {paginatedActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentServerPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentServerPage <= 3) {
                        pageNum = i + 1
                      } else if (currentServerPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentServerPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            currentServerPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentServerPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
