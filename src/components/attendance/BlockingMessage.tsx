import { AlertCircle, Clock, FileText, Mail } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { BlockingStatus } from '../../types/attendance.type'

interface BlockingMessageProps {
  blockingStatus: BlockingStatus
  classroomId: string
  studentId: string
}

/**
 * Component to display blocking message when student is blocked from learning
 */
export const BlockingMessage = ({
  blockingStatus,
  classroomId,
  studentId,
}: BlockingMessageProps) => {
  const navigate = useNavigate()

  const handleRequestMakeup = () => {
    navigate(`/classroom/${classroomId}/attendance`, {
      state: { showMakeupRequest: true },
    })
  }

  const handleViewHistory = () => {
    navigate(`/classroom/${classroomId}/attendance`)
  }

  const handleContactTeacher = () => {
    navigate(`/classroom/${classroomId}`)
  }

  return (
    <>
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-red-900">
              Bạn đã bị chặn truy cập nội dung học tập
            </h3>
            <p className="mb-4 text-sm text-red-800">
              {blockingStatus.blockedReason ||
                `Bạn đã vắng ${blockingStatus.consecutiveAbsences} buổi học liên tiếp (ngưỡng: ${blockingStatus.threshold} buổi).`}
            </p>

            {blockingStatus.blockedAt && (
              <p className="mb-4 text-xs text-red-700">
                Thời gian chặn:{' '}
                {new Date(blockingStatus.blockedAt).toLocaleString('vi-VN')}
              </p>
            )}

            <div className="mb-4 rounded-md bg-red-100 p-3">
              <p className="text-sm font-medium text-red-900">
                Số buổi vắng liên tiếp:{' '}
                <span className="font-bold">
                  {blockingStatus.consecutiveAbsences}
                </span>{' '}
                / {blockingStatus.threshold}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-red-900">Bạn có thể:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRequestMakeup}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  Xin điểm danh bù
                </button>
                <button
                  onClick={handleViewHistory}
                  className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Clock className="h-4 w-4" />
                  Xem lịch sử điểm danh
                </button>
                <button
                  onClick={handleContactTeacher}
                  className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Mail className="h-4 w-4" />
                  Liên hệ giáo viên
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
