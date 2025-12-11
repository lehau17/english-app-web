import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, FileEdit, Image as ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
import { getMyMakeupRequests } from '../../services/makeup-request.api'
import {
  MAKEUP_STATUS_COLORS,
  MAKEUP_STATUS_LABELS,
  type MakeupAttendanceRequest,
} from '../../types/makeup-request.type'

interface MakeupRequestHistorySectionProps {
  classroomId: string
}

export const MakeupRequestHistorySection = ({
  classroomId,
}: MakeupRequestHistorySectionProps) => {
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(
    null
  )
  const [showEvidenceModal, setShowEvidenceModal] = useState<string[] | null>(
    null
  )

  const { data, isLoading } = useQuery({
    queryKey: ['makeup-requests', classroomId],
    queryFn: () => getMyMakeupRequests({ classroomId }),
  })

  const requests = data?.data || []

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
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

  const toggleExpand = (requestId: string) => {
    setExpandedRequestId(expandedRequestId === requestId ? null : requestId)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
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

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <FileEdit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Chưa có yêu cầu điểm danh bù nào</p>
        <p className="text-sm text-gray-500 mt-1">
          Các yêu cầu của bạn sẽ hiển thị ở đây
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {requests.map((request: MakeupAttendanceRequest) => {
          const statusColors = MAKEUP_STATUS_COLORS[request.status]
          const isExpanded = expandedRequestId === request.id

          return (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text} ${statusColors.border} border`}
                    >
                      {MAKEUP_STATUS_LABELS[request.status]}
                    </span>
                    {request.session && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                        {request.session.title}
                      </span>
                    )}
                  </div>

                  {request.session && (
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(request.session.startTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(request.session.startTime)} -{' '}
                        {formatTime(request.session.endTime)}
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Lý do:</span> {request.reason}
                  </p>

                  {request.status === 'rejected' && request.reviewNote && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <span className="font-medium">Lý do từ chối:</span>{' '}
                      {request.reviewNote}
                    </div>
                  )}

                  {request.reviewedBy && (
                    <p className="text-xs text-gray-500 mt-2">
                      Được duyệt bởi:{' '}
                      {request.reviewedBy.displayName ||
                        `${request.reviewedBy.firstName || ''} ${request.reviewedBy.lastName || ''}`.trim() ||
                        'N/A'}
                      {request.reviewedAt && (
                        <span>
                          {' '}
                          vào{' '}
                          {new Date(request.reviewedAt).toLocaleDateString(
                            'vi-VN'
                          )}
                        </span>
                      )}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Tạo lúc:{' '}
                    {new Date(request.createdAt).toLocaleString('vi-VN')}
                  </p>

                  {request.evidenceUrls && request.evidenceUrls.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          setShowEvidenceModal(request.evidenceUrls || [])
                        }
                        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>
                          Xem {request.evidenceUrls.length} minh chứng
                        </span>
                      </button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        <span className="font-medium">ID yêu cầu:</span>{' '}
                        {request.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">ID buổi học:</span>{' '}
                        {request.sessionId}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleExpand(request.id)}
                  className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
                >
                  {isExpanded ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <FileEdit className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex-shrink-0 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Minh chứng</h2>
              <button
                onClick={() => setShowEvidenceModal(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {showEvidenceModal.map((url, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
