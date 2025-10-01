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
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import {
  useParentActivitiesQuery,
  useParentChildrenQuery,
} from '../hooks/parent.queries'

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
  vocabulary: { label: 'Từ vựng', icon: BookOpen, color: 'blue' },
  grammar: { label: 'Ngữ pháp', icon: BookOpen, color: 'green' },
  listening: { label: 'Nghe', icon: Headphones, color: 'purple' },
  speaking: { label: 'Nói', icon: PlayCircle, color: 'orange' },
  reading: { label: 'Đọc', icon: BookOpen, color: 'indigo' },
  writing: { label: 'Viết', icon: BookOpen, color: 'pink' },
  podcast: { label: 'Podcast', icon: Headphones, color: 'cyan' },
  game: { label: 'Trò chơi', icon: Gamepad2, color: 'yellow' },
}

const STATUS_CONFIG = {
  completed: { label: 'Hoàn thành', icon: CheckCircle, color: 'green' },
  in_progress: { label: 'Đang làm', icon: PlayCircle, color: 'blue' },
  failed: { label: 'Thất bại', icon: XCircle, color: 'red' },
  skipped: { label: 'Bỏ qua', icon: XCircle, color: 'gray' },
}

function ActivityCard({ activity }: { activity: Activity }) {
  const activityType = ACTIVITY_TYPES[activity.type]
  const statusConfig = STATUS_CONFIG[activity.status]
  const IconComponent = activityType.icon
  const StatusIcon = statusConfig.icon

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-${activityType.color}-100 rounded-lg`}>
            <IconComponent
              className={`h-5 w-5 text-${activityType.color}-600`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
              <Badge
                variant="outline"
                className={`bg-${activityType.color}-50 text-${activityType.color}-700`}
              >
                {activityType.label}
              </Badge>
            </div>
            {activity.description && (
              <p className="text-sm text-gray-600 mb-2">
                {activity.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                {activity.childAvatar} {activity.childName}
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
            <Badge
              variant={
                activity.score >= 80
                  ? 'default'
                  : activity.score >= 60
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {activity.score}%
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`bg-${statusConfig.color}-50 text-${statusConfig.color}-700 border-${statusConfig.color}-200`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
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
    </Card>
  )
}

export default function ParentActivitiesPage() {
  const { data: childrenResp, isLoading: childrenLoading } =
    useParentChildrenQuery()
  const { data: activitiesData, isLoading: activitiesLoading } =
    useParentActivitiesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChild, setSelectedChild] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  const activities = activitiesData || []
  const children = useMemo(
    () => (childrenResp as any)?.data || childrenResp || [],
    [childrenResp]
  )
  const isLoading = childrenLoading || activitiesLoading

  // Filter activities based on current filters
  const filteredActivities = activities.filter((activity: Activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.childName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesChild =
      selectedChild === 'all' || activity.childId === selectedChild
    const matchesType = selectedType === 'all' || activity.type === selectedType
    const matchesStatus =
      selectedStatus === 'all' || activity.status === selectedStatus

    // Period filter (simplified for demo)
    let matchesPeriod = true
    if (selectedPeriod === 'today') {
      matchesPeriod =
        new Date(activity.startedAt).toDateString() ===
        new Date().toDateString()
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      matchesPeriod = new Date(activity.startedAt) >= weekAgo
    }

    return (
      matchesSearch &&
      matchesChild &&
      matchesType &&
      matchesStatus &&
      matchesPeriod
    )
  })

  // Calculate stats
  const stats = {
    total: filteredActivities.length,
    completed: filteredActivities.filter((a: any) => a.status === 'completed')
      .length,
    inProgress: filteredActivities.filter(
      (a: any) => a.status === 'in_progress'
    ).length,
    averageScore: Math.round(
      filteredActivities
        .filter((a: any) => a.score !== undefined)
        .reduce((sum: number, a: any) => sum + (a.score || 0), 0) /
        filteredActivities.filter((a: any) => a.score !== undefined).length || 0
    ),
    totalTime: filteredActivities.reduce(
      (sum: number, a: any) => sum + a.timeSpent,
      0
    ),
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
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng hoạt động</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-xl font-semibold">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlayCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang làm</p>
                <p className="text-xl font-semibold">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
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
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Clock className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="text-xl font-semibold">{stats.totalTime} phút</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động, con..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="h-4 w-4 inline mr-1" />
                Con
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy hoạt động nào
              </h3>
              <p className="text-gray-600">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Hiển thị {filteredActivities.length} hoạt động
                </p>
              </div>

              {filteredActivities.map((activity: any) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
