import { Calendar, Clock } from 'lucide-react'
import type {
  AttendanceHistoryItem,
  AttendanceStatus,
} from '../../types/attendance.type'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

interface AttendanceHistoryListProps {
  items: AttendanceHistoryItem[]
  isLoading?: boolean
}

/**
 * List of attendance history items
 */
export const AttendanceHistoryList = ({
  items,
  isLoading,
}: AttendanceHistoryListProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Chua co du lieu diem danh</p>
        <p className="text-sm text-gray-500 mt-1">
          Du lieu se hien thi khi ban tham gia cac buoi hoc
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {item.session.sessionNumber
                    ? `Buoi ${item.session.sessionNumber}`
                    : 'Buoi hoc'}
                </span>
                {item.status !== 'not_marked' ? (
                  <AttendanceStatusBadge
                    status={item.status as AttendanceStatus}
                    size="sm"
                  />
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    Chua diem danh
                  </span>
                )}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                {item.session.sessionTitle}
              </h4>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(item.session.startTime)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(item.session.startTime)} -{' '}
                  {formatTime(item.session.endTime)}
                </span>
              </div>
              {item.checkInTime && (
                <div className="mt-2 text-sm text-gray-500">
                  Check-in: {formatTime(item.checkInTime)}
                  {item.checkOutTime && (
                    <span> | Check-out: {formatTime(item.checkOutTime)}</span>
                  )}
                </div>
              )}
              {item.notes && (
                <div className="mt-2 text-sm text-gray-600 italic">
                  Ghi chu: {item.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
