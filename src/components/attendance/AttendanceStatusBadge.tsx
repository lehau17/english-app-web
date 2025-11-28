import type { AttendanceStatus } from '../../types/attendance.type'
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from '../../types/attendance.type'

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus
  size?: 'sm' | 'md'
}

/**
 * Badge component to display attendance status with appropriate colors
 */
export const AttendanceStatusBadge = ({
  status,
  size = 'md',
}: AttendanceStatusBadgeProps) => {
  const colors = ATTENDANCE_STATUS_COLORS[status]
  const label = ATTENDANCE_STATUS_LABELS[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'present'
            ? 'bg-green-600'
            : status === 'absent'
              ? 'bg-red-600'
              : status === 'late'
                ? 'bg-yellow-600'
                : 'bg-blue-600'
        }`}
      />
      {label}
    </span>
  )
}
