import {
  ChevronDown,
  Loader2,
  Save,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  useBulkMarkAttendance,
  useMarkAllAbsent,
  useMarkAttendance,
  useSessionAttendances,
  useSessionAttendanceSummary,
  useUnmarkedStudents,
} from '../../hooks/useTeacherAttendance'
import type { AttendanceStatus } from '../../types/attendance.type'
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
} from '../../types/attendance.type'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'

interface TeacherAttendanceSectionProps {
  classroomId: string
  sessions: Array<{
    id: string
    title: string
    startTime: string
    endTime: string
    status: string
  }>
}

/**
 * Section for teacher to mark attendance for students
 */
export const TeacherAttendanceSection = ({
  sessions,
}: TeacherAttendanceSectionProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions.length > 0 ? sessions[0].id : null
  )
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, AttendanceStatus | null>
  >({})
  const [bulkMode, setBulkMode] = useState(false)

  const { data: attendancesData, isLoading: isLoadingAttendances } =
    useSessionAttendances(selectedSessionId, !!selectedSessionId)
  const { data: summaryData, isLoading: isLoadingSummary } =
    useSessionAttendanceSummary(selectedSessionId, !!selectedSessionId)
  const { data: unmarkedData } = useUnmarkedStudents(
    selectedSessionId,
    !!selectedSessionId
  )

  const markAttendanceMutation = useMarkAttendance()
  const bulkMarkMutation = useBulkMarkAttendance()
  const markAllAbsentMutation = useMarkAllAbsent()

  const attendances = attendancesData?.data || []
  const summary = summaryData?.data
  const unmarkedStudents = unmarkedData?.data || []

  // Combine marked and unmarked students
  const allStudents = [
    ...attendances.map((a) => ({
      id: a.studentId,
      name:
        a.student.displayName || `${a.student.firstName} ${a.student.lastName}`,
      avatarUrl: a.student.avatarUrl,
      status: a.status as AttendanceStatus,
      attendanceId: a.id,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      notes: a.notes,
    })),
    ...unmarkedStudents.map((s) => ({
      id: s.id,
      name: s.displayName || `${s.firstName} ${s.lastName}`,
      avatarUrl: s.avatarUrl,
      status: null as AttendanceStatus | null,
      attendanceId: null,
      checkInTime: null,
      checkOutTime: null,
      notes: null,
    })),
  ]

  const handleStatusChange = (
    studentId: string,
    status: AttendanceStatus | null
  ) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const checkSessionTiming = (session: {
    startTime: string
    endTime: string
  }): string | null => {
    const now = new Date()
    const startTime = new Date(session.startTime)
    const endTime = new Date(session.endTime)

    // Allow 30 minutes before start
    const earliestTime = new Date(startTime.getTime() - 30 * 60 * 1000)
    // Allow 2 hours after end
    const latestTime = new Date(endTime.getTime() + 2 * 60 * 60 * 1000)

    if (now < earliestTime) {
      const minutesUntil = Math.round(
        (startTime.getTime() - now.getTime()) / 60000
      )
      return `Buổi học chưa bắt đầu (còn ${minutesUntil} phút). Bạn có chắc muốn điểm danh trước?`
    }

    if (now > latestTime) {
      const hoursAfter = Math.round(
        (now.getTime() - endTime.getTime()) / 3600000
      )
      return `Buổi học đã kết thúc hơn ${hoursAfter} giờ. Bạn có chắc muốn điểm danh bây giờ?`
    }

    return null
  }

  const handleMarkSingle = async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    if (!selectedSessionId) return

    // Check timing warning
    const selectedSession = sessions.find((s) => s.id === selectedSessionId)
    if (selectedSession) {
      const timingWarning = checkSessionTiming(selectedSession)
      if (timingWarning) {
        if (!confirm(timingWarning)) {
          return // User cancelled
        }
      }
    }

    try {
      await markAttendanceMutation.mutateAsync({
        sessionId: selectedSessionId,
        studentId,
        dto: { status },
      })
      toast.success('Điểm danh thành công')
      setSelectedStatuses((prev) => {
        const newStatuses = { ...prev }
        delete newStatuses[studentId]
        return newStatuses
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Điểm danh thất bại')
    }
  }

  const handleBulkMark = async () => {
    if (!selectedSessionId) return

    const items = Object.entries(selectedStatuses)
      .filter(([_, status]) => status !== null)
      .map(([studentId, status]) => ({
        studentId,
        status: status!,
      }))

    if (items.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học sinh để điểm danh')
      return
    }

    // Check timing warning
    const selectedSession = sessions.find((s) => s.id === selectedSessionId)
    if (selectedSession) {
      const timingWarning = checkSessionTiming(selectedSession)
      if (timingWarning) {
        if (!confirm(timingWarning)) {
          return // User cancelled
        }
      }
    }

    try {
      await bulkMarkMutation.mutateAsync({
        sessionId: selectedSessionId,
        dto: { attendances: items },
      })
      toast.success(`Đã điểm danh ${items.length} học sinh`)
      setSelectedStatuses({})
      setBulkMode(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Điểm danh thất bại')
    }
  }

  const handleMarkAllAbsent = async () => {
    if (!selectedSessionId) return

    // Check timing warning first
    const selectedSession = sessions.find((s) => s.id === selectedSessionId)
    if (selectedSession) {
      const timingWarning = checkSessionTiming(selectedSession)
      if (timingWarning) {
        if (
          !confirm(`${timingWarning}\n\nVẫn tiếp tục đánh dấu tất cả vắng mặt?`)
        ) {
          return
        }
      }
    }

    if (
      !confirm(
        'Bạn có chắc muốn đánh dấu tất cả học sinh chưa điểm danh là vắng mặt?'
      )
    ) {
      return
    }

    try {
      const result = await markAllAbsentMutation.mutateAsync(selectedSessionId)
      toast.success(
        `Đã đánh dấu ${result.data?.markedCount || 0} học sinh vắng mặt`
      )
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Điểm danh học sinh
            </h2>
            <p className="text-sm text-gray-600">
              Chọn buổi học và điểm danh cho học sinh
            </p>
          </div>
        </div>
      </div>

      {/* Session Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn buổi học
        </label>
        <div className="relative">
          <select
            value={selectedSessionId || ''}
            onChange={(e) => {
              setSelectedSessionId(e.target.value || null)
              setSelectedStatuses({})
              setBulkMode(false)
            }}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">-- Chọn buổi học --</option>
            {sessions.map((session) => {
              const now = new Date()
              const startTime = new Date(session.startTime)
              const endTime = new Date(session.endTime)
              let statusBadge = ''

              if (now < startTime) {
                statusBadge = '🔵 Sắp diễn ra'
              } else if (now >= startTime && now <= endTime) {
                statusBadge = '🟢 Đang diễn ra'
              } else {
                statusBadge = '⚫ Đã kết thúc'
              }

              return (
                <option key={session.id} value={session.id}>
                  {statusBadge} | {session.title} -{' '}
                  {new Date(session.startTime).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </option>
              )
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {selectedSessionId &&
          (() => {
            const selectedSession = sessions.find(
              (s) => s.id === selectedSessionId
            )
            if (selectedSession) {
              const timingWarning = checkSessionTiming(selectedSession)
              if (timingWarning) {
                return (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                    <p className="text-sm text-yellow-800 flex-1">
                      {timingWarning}
                    </p>
                  </div>
                )
              }
            }
            return null
          })()}
      </div>

      {selectedSessionId && (
        <>
          {/* Summary Card */}
          {summary && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tổng hợp điểm danh
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {summary.totalStudents}
                  </div>
                  <div className="text-sm text-gray-600">Tổng số</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.present}
                  </div>
                  <div className="text-sm text-gray-600">Có mặt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.absent}
                  </div>
                  <div className="text-sm text-gray-600">Vắng mặt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {summary.late}
                  </div>
                  <div className="text-sm text-gray-600">Đi muộn</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.excused}
                  </div>
                  <div className="text-sm text-gray-600">Có phép</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ đi học</span>
                  <span className="text-lg font-bold text-blue-600">
                    {summary.attendanceRate}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setBulkMode(!bulkMode)
                if (bulkMode) {
                  setSelectedStatuses({})
                }
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                bulkMode
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {bulkMode ? 'Thoát chế độ hàng loạt' : 'Điểm danh hàng loạt'}
            </button>
            {unmarkedStudents.length > 0 && (
              <button
                onClick={handleMarkAllAbsent}
                disabled={markAllAbsentMutation.isPending}
                className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {markAllAbsentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4" />
                )}
                Đánh dấu tất cả vắng ({unmarkedStudents.length})
              </button>
            )}
            {bulkMode && Object.keys(selectedStatuses).length > 0 && (
              <button
                onClick={handleBulkMark}
                disabled={bulkMarkMutation.isPending}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {bulkMarkMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu điểm danh ({Object.keys(selectedStatuses).length})
              </button>
            )}
          </div>

          {/* Students List */}
          {(isLoadingAttendances || isLoadingSummary) && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
            </div>
          )}

          {!isLoadingAttendances && !isLoadingSummary && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Học sinh
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      {bulkMode && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chọn trạng thái
                        </th>
                      )}
                      {!bulkMode && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStudents.map((student) => {
                      const currentStatus =
                        selectedStatuses[student.id] ?? student.status
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                {student.avatarUrl ? (
                                  <img
                                    src={student.avatarUrl}
                                    alt={student.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm font-medium">
                                    {student.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {student.name}
                                </div>
                                {student.checkInTime && (
                                  <div className="text-xs text-gray-500">
                                    Check-in:{' '}
                                    {new Date(
                                      student.checkInTime
                                    ).toLocaleTimeString('vi-VN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {currentStatus ? (
                              <AttendanceStatusBadge
                                status={currentStatus}
                                size="sm"
                              />
                            ) : (
                              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                                Chưa điểm danh
                              </span>
                            )}
                          </td>
                          {bulkMode ? (
                            <td className="px-4 py-3">
                              <select
                                value={selectedStatuses[student.id] || ''}
                                onChange={(e) =>
                                  handleStatusChange(
                                    student.id,
                                    e.target.value
                                      ? (e.target.value as AttendanceStatus)
                                      : null
                                  )
                                }
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">-- Chọn --</option>
                                {Object.entries(ATTENDANCE_STATUS_LABELS).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>
                          ) : (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {(
                                  [
                                    'present',
                                    'absent',
                                    'late',
                                    'excused',
                                  ] as AttendanceStatus[]
                                ).map((status) => (
                                  <button
                                    key={status}
                                    onClick={() =>
                                      handleMarkSingle(student.id, status)
                                    }
                                    disabled={markAttendanceMutation.isPending}
                                    className={`px-2 py-1 text-xs rounded transition-colors ${
                                      currentStatus === status
                                        ? ATTENDANCE_STATUS_COLORS[status].bg +
                                          ' ' +
                                          ATTENDANCE_STATUS_COLORS[status]
                                            .text +
                                          ' font-medium'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    {ATTENDANCE_STATUS_LABELS[status]}
                                  </button>
                                ))}
                              </div>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {allStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Không có học sinh trong lớp</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!selectedSessionId && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vui lòng chọn buổi học để điểm danh</p>
        </div>
      )}
    </div>
  )
}
