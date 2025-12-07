import { useState } from 'react'
import { Calendar, Clock, FileEdit } from 'lucide-react'
import type {
  AttendanceHistoryItem,
  AttendanceStatus,
} from '../../types/attendance.type'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { MakeupRequestModal } from './MakeupRequestModal'

interface AttendanceHistoryListProps {
  items: AttendanceHistoryItem[]
  isLoading?: boolean
  onRefresh?: () => void
}

/**
 * List of attendance history items
 */
export const AttendanceHistoryList = ({
  items,
  isLoading,
  onRefresh,
}: AttendanceHistoryListProps) => {
  const [selectedItem, setSelectedItem] =
    useState<AttendanceHistoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const isPastSession = (endTime: string) => {
    return new Date(endTime) < new Date()
  }

  const canRequestMakeup = (item: AttendanceHistoryItem) => {
    // Can request if: session is past AND (status is absent or not_marked)
    return (
      isPastSession(item.session.endTime) &&
      (item.status === 'absent' || item.status === 'not_marked')
    )
  }

  const handleOpenModal = (item: AttendanceHistoryItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handleSuccess = () => {
    onRefresh?.()
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
        <p className="text-gray-600">Chưa có dữ liệu điểm danh</p>
        <p className="text-sm text-gray-500 mt-1">
          Dữ liệu sẽ hiển thị khi bạn tham gia các buổi học
        </p>
      </div>
    )
  }

  return (
    <>
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
                      ? `Buổi ${item.session.sessionNumber}`
                      : 'Buổi học'}
                  </span>
                  {item.status !== 'not_marked' ? (
                    <AttendanceStatusBadge
                      status={item.status as AttendanceStatus}
                      size="sm"
                    />
                  ) : (
                    <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                      Chưa điểm danh
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
                    Ghi chú: {item.notes}
                  </div>
                )}
              </div>

              {/* Makeup Request Button */}
              {canRequestMakeup(item) && (
                <button
                  onClick={() => handleOpenModal(item)}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <FileEdit className="w-4 h-4" />
                  <span className="hidden sm:inline">Yêu cầu điểm danh bù</span>
                  <span className="sm:hidden">Điểm danh bù</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Makeup Request Modal */}
      <MakeupRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        attendanceItem={selectedItem}
        onSuccess={handleSuccess}
      />
    </>
  )
}
