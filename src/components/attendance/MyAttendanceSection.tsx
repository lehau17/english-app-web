import { ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { useMyAttendanceHistory } from '../../hooks/useAttendance'
import type {
  AttendanceHistoryApiResponse,
  AttendanceStatus,
  PaginatedAttendanceHistory,
} from '../../types/attendance.type'
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

  // Map API response to frontend format
  const apiData = data?.data as AttendanceHistoryApiResponse | undefined
  const history: PaginatedAttendanceHistory | null = apiData
    ? {
        data: apiData.history.map(
          (
            item: {
              sessionId: string
              sessionTitle: string
              sessionDate: string
              status: string
            },
            index: number
          ) => ({
            id: item.sessionId, // Use sessionId as id
            status: (item.status === 'not_marked'
              ? 'not_marked'
              : item.status) as AttendanceStatus | 'not_marked',
            checkInTime: null,
            checkOutTime: null,
            notes: null,
            createdAt: item.sessionDate,
            session: {
              sessionId: item.sessionId,
              sessionTitle: item.sessionTitle,
              sessionNumber: apiData.totalSessions - index, // Approximate session number
              startTime: item.sessionDate,
              endTime: item.sessionDate, // API doesn't provide endTime
            },
          })
        ),
        meta: apiData.pagination,
        summary: {
          totalSessions: apiData.totalSessions,
          present: apiData.present,
          absent: apiData.absent,
          late: apiData.late,
          excused: apiData.excused,
          attendanceRate: apiData.attendanceRate,
        },
      }
    : null

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
