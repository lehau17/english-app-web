import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { useMyAttendanceHistory } from '../../hooks/useAttendance'
import type { AttendanceStatus } from '../../types/attendance.type'
import { AttendanceFilter } from './AttendanceFilter'
import { AttendanceHistoryList } from './AttendanceHistoryList'
import { AttendanceSummaryCard } from './AttendanceSummaryCard'

interface MyAttendanceSectionProps {
  classroomId: string
}

/**
 * Section displaying student's own attendance history for a classroom
 */
export const MyAttendanceSection = ({
  classroomId,
}: MyAttendanceSectionProps) => {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<AttendanceStatus | undefined>()
  const [fromDate, setFromDate] = useState<string | undefined>()
  const [toDate, setToDate] = useState<string | undefined>()

  const { data, isLoading, error } = useMyAttendanceHistory(classroomId, {
    page,
    limit: 10,
    status,
    fromDate,
    toDate,
  })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleStatusChange = (newStatus?: AttendanceStatus) => {
    setStatus(newStatus)
    setPage(1) // Reset to first page
  }

  const handleDateRangeChange = (from?: string, to?: string) => {
    setFromDate(from)
    setToDate(to)
    setPage(1) // Reset to first page
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Khong the tai du lieu diem danh</p>
        <p className="text-sm text-red-500 mt-1">Vui long thu lai sau</p>
      </div>
    )
  }

  const history = data?.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lich su diem danh</h2>
          <p className="text-sm text-gray-600">
            Theo doi tinh trang diem danh cua ban trong lop hoc
          </p>
        </div>
      </div>

      {/* Summary Card */}
      {history?.summary && (
        <AttendanceSummaryCard
          totalSessions={history.summary.totalSessions}
          present={history.summary.present}
          absent={history.summary.absent}
          late={history.summary.late}
          excused={history.summary.excused}
          attendanceRate={history.summary.attendanceRate}
        />
      )}

      {/* Filter and Pagination */}
      <AttendanceFilter
        currentPage={page}
        totalPages={history?.meta?.totalPages || 1}
        status={status}
        fromDate={fromDate}
        toDate={toDate}
        onPageChange={handlePageChange}
        onStatusChange={handleStatusChange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* History List */}
      <AttendanceHistoryList
        items={history?.data || []}
        isLoading={isLoading}
      />
    </div>
  )
}
