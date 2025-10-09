import {
  ArrowRight,
  Bell,
  Calendar,
  FileText,
  MoreVertical,
  Users,
} from 'lucide-react'
import type { JSX } from 'react'
import type { MyClassroomResponse } from '../../types/home.type'

type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

interface Schedule {
  days: Weekday[]
  time: string // HH:mm
  duration?: number // minutes
}

interface ClassroomCardProps {
  data: MyClassroomResponse & {
    isActive?: boolean
    schedule?: Schedule
    description?: string
    _count: {
      students: number
      assignments: number
      announcements?: number
    }
  }
  onOpen?: (id: string) => void
}

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

export default function ClassroomCard({
  data,
  onOpen,
}: ClassroomCardProps): JSX.Element {
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
                (data.isActive ?? true)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {(data.isActive ?? true) ? 'Đang hoạt động' : 'Đã kết thúc'}
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
            {data._count.announcements !== undefined && (
              <div className="flex items-center gap-1">
                <Bell className="h-4 w-4" />
                {data._count.announcements} thông báo
              </div>
            )}
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
