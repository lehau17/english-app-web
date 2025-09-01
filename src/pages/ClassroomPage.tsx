import {
  ArrowRight,
  Bell,
  Calendar,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Settings,
  SortAsc,
  SortDesc,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'

/**
 * =========================
 * Domain types
 * =========================
 */

type Role = 'student' | 'teacher' | 'parent' | 'admin'

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

interface CurrentUser {
  id: string
  role: Role
  firstName: string
  lastName: string
  displayName: string
}

interface TeacherRef {
  id: string
  displayName: string
  email?: string
  avatarUrl?: string
}

interface Schedule {
  days: Weekday[]
  time: string // HH:mm
  duration?: number // minutes
}

interface ClassroomListItem {
  id: string
  name: string
  description?: string
  classCode: string
  teacher: TeacherRef
  isActive: boolean
  maxStudents: number
  createdAt: string // ISO
  updatedAt: string // ISO
  expiresAt?: string // ISO
  schedule?: Schedule
  settings?: {
    allowDiscussion?: boolean
    autoGrade?: boolean
  }
  _count: {
    students: number
    assignments: number
    announcements: number
  }
}

/**
 * =========================
 * Props
 * =========================
 */

interface ClassroomsPageProps {
  currentUser?: CurrentUser // nếu không truyền sẽ dùng mock
  classrooms?: ClassroomListItem[] // nếu không truyền sẽ dùng mock
  onOpenClassroom?: (id: string) => void // điều hướng tới ClassroomDetail
  onCreateClassroom?: () => void // mở modal tạo lớp (role=teacher)
  onJoinByCode?: (code: string) => void // tham gia bằng mã (role=student)
}

/**
 * =========================
 * Mock data
 * =========================
 */

const mockCurrentUser: CurrentUser = {
  id: 'user123',
  role: 'student',
  firstName: 'Bé',
  lastName: 'Ong',
  displayName: 'Bé Ong',
}

const mockClassrooms: ClassroomListItem[] = [
  {
    id: 'class1',
    name: 'Tiếng Anh Lớp 5A',
    description:
      'Tập trung từ vựng và ngữ pháp cơ bản. Luyện nghe nói mỗi tuần 3 buổi.',
    classCode: 'ABC123XY',
    teacher: { id: 't1', displayName: 'Cô Lan', email: 'co.lan@school.edu.vn' },
    isActive: true,
    maxStudents: 30,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-08-29T10:00:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    schedule: {
      days: ['monday', 'wednesday', 'friday'],
      time: '14:00',
      duration: 90,
    },
    _count: { students: 24, assignments: 2, announcements: 2 },
  },
  {
    id: 'class2',
    name: 'Tiếng Anh Lớp 4B',
    description: 'Từ vựng theo chủ đề + phát âm cơ bản.',
    classCode: 'ZXCV9QWE',
    teacher: { id: 't2', displayName: 'Thầy Minh' },
    isActive: true,
    maxStudents: 28,
    createdAt: '2024-03-02T08:00:00Z',
    updatedAt: '2024-08-27T10:00:00Z',
    schedule: { days: ['tuesday', 'thursday'], time: '15:30', duration: 75 },
    _count: { students: 22, assignments: 5, announcements: 1 },
  },
  {
    id: 'class3',
    name: 'Luyện Thi Movers',
    description: 'Ôn đề Cambridge Movers, nghe-đọc-nói-viết.',
    classCode: 'MOVERS7',
    teacher: { id: 't3', displayName: 'Cô Hương' },
    isActive: false,
    maxStudents: 25,
    createdAt: '2023-09-01T08:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
    _count: { students: 25, assignments: 12, announcements: 8 },
  },
]

/**
 * =========================
 * Helpers
 * =========================
 */

const WEEKDAY_LABEL: Record<Weekday, string> = {
  monday: 'Th 2',
  tuesday: 'Th 3',
  wednesday: 'Th 4',
  thursday: 'Th 5',
  friday: 'Th 6',
  saturday: 'Th 7',
  sunday: 'CN',
}

function formatSchedule(s?: Schedule): string {
  if (!s) return '—'
  const days = s.days.map((d) => WEEKDAY_LABEL[d]).join(', ')
  return `${days} • ${s.time}${s.duration ? ` (${s.duration} phút)` : ''}`
}

/**
 * =========================
 * UI Subcomponents
 * =========================
 */

type StatPillProps = {
  icon: LucideIcon
  value: number | string
  label: string
  colorClass: string // ví dụ: text-blue-600
}

function StatPill({
  icon: Icon,
  value,
  label,
  colorClass,
}: StatPillProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <div className="leading-tight">
        <div className={`text-sm font-semibold ${colorClass}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}

type ClassroomCardProps = {
  data: ClassroomListItem
  onOpen?: (id: string) => void
}

function ClassroomCard({ data, onOpen }: ClassroomCardProps): JSX.Element {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {data.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                data.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {data.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
            </span>
          </div>
          {data.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {data.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {data._count.students}/{data.maxStudents}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {data._count.assignments} bài tập
            </div>
            <div className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              {data._count.announcements} thông báo
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatSchedule(data.schedule)}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={() => onOpen?.(data.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
          >
            Vào lớp <ArrowRight className="h-4 w-4" />
          </button>
          <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-50">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * =========================
 * Main Page Component
 * =========================
 */

export default function ClassroomsPage({
  currentUser = mockCurrentUser,
  classrooms = mockClassrooms,
  onOpenClassroom,
  onCreateClassroom,
  onJoinByCode,
}: ClassroomsPageProps): JSX.Element {
  const [query, setQuery] = useState<string>('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<'recent' | 'students' | 'assignments'>(
    'recent'
  )
  const [asc, setAsc] = useState<boolean>(false)
  const [joinCode, setJoinCode] = useState<string>('')

  const filtered = useMemo(() => {
    let list = classrooms
    if (status !== 'all') {
      list = list.filter((c) =>
        status === 'active' ? c.isActive : !c.isActive
      )
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.teacher.displayName.toLowerCase().includes(q) ||
          c.classCode.toLowerCase().includes(q)
      )
    }
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case 'students':
          return a._count.students - b._count.students
        case 'assignments':
          return a._count.assignments - b._count.assignments
        case 'recent':
        default:
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          )
      }
    })
    if (!asc) list.reverse()
    return list
  }, [classrooms, query, status, sortKey, asc])

  const handleJoin = (): void => {
    if (!joinCode.trim()) return
    onJoinByCode?.(joinCode.trim())
    setJoinCode('')
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lớp học của tôi</h1>
          <p className="text-gray-600">
            Quản lý và truy cập các lớp bạn đang tham gia
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.role === 'teacher' ? (
            <button
              onClick={onCreateClassroom}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" /> Tạo lớp học
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã lớp (VD: ABC123XY)"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleJoin}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 transition"
              >
                Tham gia
              </button>
            </div>
          )}
          <button className="rounded-lg p-2 hover:bg-gray-100 transition">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên lớp, giáo viên, mã lớp…"
              className="rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="bg-transparent outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Đã kết thúc</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <span className="text-gray-600">Sắp xếp</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                className="bg-transparent outline-none"
              >
                <option value="recent">Mới cập nhật</option>
                <option value="students">Số học sinh</option>
                <option value="assignments">Số bài tập</option>
              </select>
              <button
                onClick={() => setAsc((v) => !v)}
                className="rounded p-1 hover:bg-gray-50"
                aria-label="Đảo chiều sắp xếp"
                title="Đảo chiều sắp xếp"
              >
                {asc ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2">
          <StatPill
            icon={Users}
            value={classrooms.reduce((s, c) => s + c._count.students, 0)}
            label="Tổng học sinh"
            colorClass="text-blue-600"
          />
          <StatPill
            icon={FileText}
            value={classrooms.reduce((s, c) => s + c._count.assignments, 0)}
            label="Tổng bài tập"
            colorClass="text-green-600"
          />
          <StatPill
            icon={Bell}
            value={classrooms.reduce((s, c) => s + c._count.announcements, 0)}
            label="Tổng thông báo"
            colorClass="text-orange-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <ClassroomCard key={c.id} data={c} onOpen={onOpenClassroom} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Search className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Không tìm thấy lớp phù hợp
          </h3>
          <p className="mt-1 text-gray-600">Thử đổi từ khóa hoặc bỏ bộ lọc.</p>
        </div>
      )}
    </div>
  )
}
