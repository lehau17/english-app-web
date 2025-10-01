import { Bell, FileText, Search, Users } from 'lucide-react'
import { useMemo, useState, type JSX } from 'react'
import ClassroomCard from '../components/classroom/ClassroomCard'
import ClassroomHeader from '../components/classroom/ClassroomHeader'
import ClassroomToolbar from '../components/classroom/ClassroomToolbar'
import StatPill from '../components/classroom/StatPill'
import { useMyClassrooms } from '../hooks/useMyClassrooms'
import { useUserInfo } from '../hooks/useUserInfo'
import type { MyClassroomResponse } from '../types/home.type'

/**
 * =========================
 * Props
 * =========================
 */

interface ClassroomsPageProps {
  onOpenClassroom?: (id: string) => void // điều hướng tới ClassroomDetail
  onCreateClassroom?: () => void // mở modal tạo lớp (role=teacher)
  onJoinByCode?: (code: string) => void // tham gia bằng mã (role=student)
}

/**
 * =========================
 * Main Page Component
 * =========================
 */

export default function ClassroomsPage({
  onOpenClassroom,
  onCreateClassroom,
  onJoinByCode,
}: ClassroomsPageProps): JSX.Element {
  // API hooks
  const { data: currentUser, isLoading: userLoading } = useUserInfo()
  const {
    data: classrooms = [],
    isLoading: classroomsLoading,
    error,
  } = useMyClassrooms()

  // Local state
  const [query, setQuery] = useState<string>('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<'recent' | 'students' | 'assignments'>(
    'recent'
  )
  const [asc, setAsc] = useState<boolean>(false)
  const [joinCode, setJoinCode] = useState<string>('')

  // Transform API data to match component interface
  const transformedClassrooms = useMemo(() => {
    return classrooms.map((classroom: MyClassroomResponse) => ({
      ...classroom,
      isActive: true, // API doesn't return this field, default to true
      description: '', // API doesn't return this field
      teacher: {
        id: classroom.teacherName || 'unknown',
        displayName: classroom.teacher?.displayName || classroom.teacherName,
      },
      _count: {
        students: classroom._count?.students || classroom.students,
        assignments: classroom._count?.assignments || classroom.assignments,
        announcements: 0, // API doesn't return this field
      },
    }))
  }, [classrooms])

  const filtered = useMemo(() => {
    let list = transformedClassrooms
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
          (c.classCode && c.classCode.toLowerCase().includes(q))
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
          // Since API doesn't return updatedAt, sort by name as fallback
          return a.name.localeCompare(b.name)
      }
    })
    if (!asc) list.reverse()
    return list
  }, [transformedClassrooms, query, status, sortKey, asc])

  // Loading state
  if (userLoading || classroomsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải danh sách lớp học
          </h3>
          <p className="text-gray-600">Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }

  // No user data
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không thể tải thông tin người dùng
          </h3>
          <p className="text-gray-600">Vui lòng đăng nhập lại.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <ClassroomHeader
        currentUser={{
          id: currentUser.id,
          role: (currentUser.role as any) || 'student',
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          displayName:
            currentUser.displayName ||
            `${currentUser.firstName} ${currentUser.lastName}`,
        }}
        onCreateClassroom={onCreateClassroom}
        onJoinByCode={onJoinByCode}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ClassroomToolbar
          query={query}
          setQuery={setQuery}
          status={status}
          setStatus={setStatus}
          sortKey={sortKey}
          setSortKey={setSortKey}
          asc={asc}
          setAsc={setAsc}
        />

        {/* Summary pills */}
        <div className="flex items-center gap-2">
          <StatPill
            icon={Users}
            value={transformedClassrooms.reduce(
              (s, c) => s + c._count.students,
              0
            )}
            label="Tổng học sinh"
            colorClass="text-blue-600"
          />
          <StatPill
            icon={FileText}
            value={transformedClassrooms.reduce(
              (s, c) => s + c._count.assignments,
              0
            )}
            label="Tổng bài tập"
            colorClass="text-green-600"
          />
          <StatPill
            icon={Bell}
            value={transformedClassrooms.reduce(
              (s, c) => s + c._count.announcements,
              0
            )}
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
