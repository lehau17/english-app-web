import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react'
import type { AttendanceStatus } from '../../types/attendance.type'
import { ATTENDANCE_STATUS_LABELS } from '../../types/attendance.type'

interface AttendanceFilterProps {
  currentPage: number
  totalPages: number
  status?: AttendanceStatus
  fromDate?: string
  toDate?: string
  onPageChange: (page: number) => void
  onStatusChange: (status?: AttendanceStatus) => void
  onDateRangeChange: (from?: string, to?: string) => void
}

/**
 * Filter and pagination controls for attendance history
 */
export const AttendanceFilter = ({
  currentPage,
  totalPages,
  status,
  fromDate,
  toDate,
  onPageChange,
  onStatusChange,
  onDateRangeChange,
}: AttendanceFilterProps) => {
  const [showFilters, setShowFilters] = useState(false)

  const statusOptions: Array<{ value: AttendanceStatus | ''; label: string }> =
    [
      { value: '', label: 'Tat ca' },
      { value: 'present', label: ATTENDANCE_STATUS_LABELS.present },
      { value: 'absent', label: ATTENDANCE_STATUS_LABELS.absent },
      { value: 'late', label: ATTENDANCE_STATUS_LABELS.late },
      { value: 'excused', label: ATTENDANCE_STATUS_LABELS.excused },
    ]

  return (
    <div className="space-y-4">
      {/* Filter toggle and pagination */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters || status || fromDate || toDate
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Bo loc</span>
          {(status || fromDate || toDate) && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {[status, fromDate, toDate].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trang thai
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value || 'all'}
                  onClick={() =>
                    onStatusChange(option.value as AttendanceStatus | undefined)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    status === option.value || (!status && option.value === '')
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tu ngay
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={fromDate || ''}
                  onChange={(e) =>
                    onDateRangeChange(e.target.value || undefined, toDate)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Den ngay
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={toDate || ''}
                  onChange={(e) =>
                    onDateRangeChange(fromDate, e.target.value || undefined)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Clear filters */}
          {(status || fromDate || toDate) && (
            <button
              onClick={() => {
                onStatusChange(undefined)
                onDateRangeChange(undefined, undefined)
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Xoa bo loc
            </button>
          )}
        </div>
      )}
    </div>
  )
}
