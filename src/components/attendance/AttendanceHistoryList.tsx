import { useMemo, useState } from 'react'
import { Calendar, Clock, FileEdit } from 'lucide-react'
import type {
  AttendanceHistoryItem,
  AttendanceStatus,
} from '../../types/attendance.type'
import type { MakeupAttendanceRequest } from '../../types/makeup-request.type'
import {
  MAKEUP_STATUS_COLORS,
  MAKEUP_STATUS_LABELS,
} from '../../types/makeup-request.type'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { MakeupRequestModal } from './MakeupRequestModal'

interface AttendanceHistoryListProps {
  items: AttendanceHistoryItem[]
  isLoading?: boolean
  onRefresh?: () => void
  makeupRequests?: MakeupAttendanceRequest[]
}

/**
 * List of attendance history items
 */
export const AttendanceHistoryList = ({
  items,
  isLoading,
  onRefresh,
  makeupRequests = [],
}: AttendanceHistoryListProps) => {
  const [selectedItem, setSelectedItem] =
    useState<AttendanceHistoryItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Create map: sessionId -> request for efficient lookup
  const requestsMap = useMemo(() => {
    const map = new Map<string, MakeupAttendanceRequest>()
    makeupRequests.forEach((req) => {
      map.set(req.sessionId, req)
    })
    return map
  }, [makeupRequests])

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
    // Can request if: session is past AND (status is absent or not_marked) AND no existing request
    const existingRequest = requestsMap.get(item.session.sessionId)
    if (
      existingRequest &&
      (existingRequest.status === 'pending' ||
        existingRequest.status === 'approved')
    ) {
      return false
    }
    return (
      isPastSession(item.session.endTime) &&
      (item.status === 'absent' || item.status === 'not_marked')
    )
  }

  const getRequestForSession = (
    sessionId: string
  ): MakeupAttendanceRequest | null => {
    return requestsMap.get(sessionId) || null
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
        {items.map((item) => {
          const makeupRequest = getRequestForSession(item.session.sessionId)
          const hasRequest = !!makeupRequest

          return (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                    {hasRequest && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          MAKEUP_STATUS_COLORS[makeupRequest.status].bg
                        } ${MAKEUP_STATUS_COLORS[makeupRequest.status].text} ${
                          MAKEUP_STATUS_COLORS[makeupRequest.status].border
                        }`}
                      >
                        {MAKEUP_STATUS_LABELS[makeupRequest.status]}
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
                        <span>
                          {' '}
                          | Check-out: {formatTime(item.checkOutTime)}
                        </span>
                      )}
                    </div>
                  )}
                  {item.notes && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      Ghi chú: {item.notes}
                    </div>
                  )}
                  {hasRequest &&
                    makeupRequest.status === 'rejected' &&
                    makeupRequest.reviewNote && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Lý do từ chối:</span>{' '}
                        {makeupRequest.reviewNote}
                      </div>
                    )}
                </div>

                {/* Makeup Request Button */}
                {canRequestMakeup(item) ? (
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="ml-3 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FileEdit className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Yêu cầu điểm danh bù
                    </span>
                    <span className="sm:hidden">Điểm danh bù</span>
                  </button>
                ) : hasRequest && makeupRequest.status === 'pending' ? (
                  <span className="ml-3 px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg">
                    Đang chờ duyệt
                  </span>
                ) : hasRequest && makeupRequest.status === 'approved' ? (
                  <span className="ml-3 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
                    Đã được duyệt
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
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
