import { Plus, Settings } from 'lucide-react'
import type { JSX } from 'react'

type Role = 'student' | 'teacher' | 'parent' | 'admin'

interface CurrentUser {
  id: string
  role: Role
  firstName: string
  lastName: string
  displayName: string
}

interface ClassroomHeaderProps {
  currentUser: CurrentUser
  onCreateClassroom?: () => void
  onJoinByCode?: (code: string) => void
  joinCode: string
  setJoinCode: (code: string) => void
}

export default function ClassroomHeader({
  currentUser,
  onCreateClassroom,
  onJoinByCode,
  joinCode,
  setJoinCode,
}: ClassroomHeaderProps): JSX.Element {
  const handleJoin = (): void => {
    if (!joinCode.trim()) return
    onJoinByCode?.(joinCode.trim())
    setJoinCode('')
  }

  return (
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
  )
}
