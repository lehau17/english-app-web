import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { BlockingStatus } from '../../types/attendance.type'

interface AttendanceStatusWidgetProps {
  attendanceRate?: number
  blockingStatus?: BlockingStatus
  className?: string
}

/**
 * Widget to display attendance status and blocking information
 */
export const AttendanceStatusWidget = ({
  attendanceRate,
  blockingStatus,
  className = '',
}: AttendanceStatusWidgetProps) => {
  const isBlocked = blockingStatus?.isBlocked || false
  const consecutiveAbsences = blockingStatus?.consecutiveAbsences || 0
  const threshold = blockingStatus?.threshold || 3

  return (
    <div className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Trạng thái điểm danh
      </h3>

      {attendanceRate !== undefined && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-gray-600">Tỷ lệ điểm danh</span>
            <span className="text-sm font-medium text-gray-900">
              {attendanceRate}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                attendanceRate >= 80
                  ? 'bg-green-500'
                  : attendanceRate >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(attendanceRate, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-md bg-gray-50 p-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Buổi vắng liên tiếp</span>
          </div>
          <span
            className={`text-sm font-medium ${
              consecutiveAbsences >= threshold - 1
                ? 'text-red-600'
                : consecutiveAbsences >= threshold - 2
                  ? 'text-yellow-600'
                  : 'text-gray-700'
            }`}
          >
            {consecutiveAbsences} / {threshold}
          </span>
        </div>

        {isBlocked && (
          <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-900">Đã bị chặn</p>
              {blockingStatus?.blockedReason && (
                <p className="mt-1 text-xs text-red-700">
                  {blockingStatus.blockedReason}
                </p>
              )}
            </div>
          </div>
        )}

        {!isBlocked && consecutiveAbsences >= threshold - 1 && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-600" />
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-900">Cảnh báo</p>
              <p className="mt-1 text-xs text-yellow-700">
                Bạn sắp đạt ngưỡng chặn ({consecutiveAbsences}/{threshold} buổi)
              </p>
            </div>
          </div>
        )}

        {!isBlocked && consecutiveAbsences < threshold - 1 && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-xs font-medium text-green-900">
              Trạng thái bình thường
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
