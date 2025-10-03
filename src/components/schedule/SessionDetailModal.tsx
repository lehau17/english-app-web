import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  X,
} from 'lucide-react'
import type { StudentScheduleSession } from '../../types/student-schedule.type'

interface SessionDetailModalProps {
  session: StudentScheduleSession | null
  isOpen: boolean
  onClose: () => void
}

const SessionDetailModal = ({
  session,
  isOpen,
  onClose,
}: SessionDetailModalProps) => {
  if (!isOpen || !session) return null

  const stateStyles: Record<
    StudentScheduleSession['state'],
    { label: string; text: string; bg: string; border: string }
  > = {
    upcoming: {
      label: 'Sắp diễn ra',
      text: 'text-blue-700',
      bg: 'bg-blue-100',
      border: 'border-blue-200',
    },
    ongoing: {
      label: 'Đang diễn ra',
      text: 'text-green-700',
      bg: 'bg-green-100',
      border: 'border-green-200',
    },
    completed: {
      label: 'Đã kết thúc',
      text: 'text-gray-600',
      bg: 'bg-gray-100',
      border: 'border-gray-200',
    },
    cancelled: {
      label: 'Đã hủy',
      text: 'text-red-700',
      bg: 'bg-red-100',
      border: 'border-red-200',
    },
    postponed: {
      label: 'Hoãn lại',
      text: 'text-amber-700',
      bg: 'bg-amber-100',
      border: 'border-amber-200',
    },
  }

  const style = stateStyles[session.state]

  const formatDateTime = (dateTime: string, timezone: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone.replace('_', '/'),
    }).format(new Date(dateTime))
  }

  const formatTimeRange = (start: string, end: string, timezone: string) => {
    const fmt = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone.replace('_', '/'),
    })
    return `${fmt.format(new Date(start))} - ${fmt.format(new Date(end))}`
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết buổi học
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title and Status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {session.title}
                </h3>
                {session.description && (
                  <p className="text-gray-600">{session.description}</p>
                )}
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${style.bg} ${style.text} ${style.border} border`}
              >
                {style.label}
              </span>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Thời gian</p>
                  <p className="text-sm text-gray-600">
                    {formatTimeRange(
                      session.startTime,
                      session.endTime,
                      session.timezone
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateTime(session.startTime, session.timezone)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Lớp học</p>
                  <p className="text-sm text-gray-600">
                    {session.classroomName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.type === 'online' ? 'Trực tuyến' : 'Tại trung tâm'}
                  </p>
                </div>
              </div>

              {session.instructor && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Giảng viên
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.instructor.displayName}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Thời lượng
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.durationHours} giờ
                  </p>
                </div>
              </div>
            </div>

            {/* Course Info */}
            {session.course && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Thông tin khóa học
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">
                    {session.course.title}
                  </h5>
                  {session.course.description && (
                    <p className="text-sm text-blue-700">
                      {session.course.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Session Schedule Info */}
            {session.sessionSchedule && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Tiến độ học tập
                </h4>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {session.sessionSchedule.sessionNumber}
                    </div>
                    <span className="font-medium text-purple-900">
                      Buổi học số {session.sessionSchedule.sessionNumber}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {session.activities && session.activities.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Hoạt động học tập
                </h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {session.activities.length} hoạt động học tập
                    </span>
                  </div>
                  <div className="space-y-2">
                    {session.activities.map((activity) => (
                      <div
                        key={activity.activityId}
                        className="flex items-center gap-3 bg-white rounded-md p-3"
                      >
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {activity.orderNo}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.activity.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {activity.activity.type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Meeting URL */}
            {session.meetingUrl && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Tham gia học
                </h4>
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Tham gia buổi học trực tuyến
                </a>
              </div>
            )}

            {/* Attendance Status */}
            {session.attendanceStatus && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Trạng thái điểm danh
                </h4>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                    session.attendanceStatus === 'present'
                      ? 'bg-green-100 text-green-800'
                      : session.attendanceStatus === 'absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      session.attendanceStatus === 'present'
                        ? 'bg-green-600'
                        : session.attendanceStatus === 'absent'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                    }`}
                  />
                  {session.attendanceStatus === 'present' && 'Có mặt'}
                  {session.attendanceStatus === 'absent' && 'Vắng mặt'}
                  {session.attendanceStatus === 'late' && 'Đi muộn'}
                  {session.attendanceStatus === 'excused' && 'Có phép'}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionDetailModal
