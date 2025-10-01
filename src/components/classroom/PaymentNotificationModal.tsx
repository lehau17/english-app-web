import { AlertCircle, CreditCard, X } from 'lucide-react'
import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { PaymentButton } from '../payment/PaymentButton'

interface PaymentNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  classroom: {
    id: string
    name: string
    course?: {
      id: string
      title: string
      price: number
      currency?: string
    }
    teacher?: {
      displayName: string
    }
  }
}

export const PaymentNotificationModal: React.FC<
  PaymentNotificationModalProps
> = ({ isOpen, onClose, classroom }) => {
  const { user } = useAuth()
  const isParent = user?.role === 'parent'
  const isStudent = user?.role === 'student'

  if (!isOpen) return null

  const formatPrice = (price: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(price)
  }

  const coursePrice = classroom.course?.price || 0
  const courseCurrency = classroom.course?.currency || 'VND'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Yêu cầu thanh toán
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Course Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Khóa học</div>
            <div className="font-semibold text-gray-900">
              {classroom.course?.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Lớp: {classroom.name}
            </div>
            {classroom.teacher && (
              <div className="text-sm text-gray-600">
                Giáo viên: {classroom.teacher.displayName}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-700">Học phí</div>
            <div className="text-xl font-bold text-blue-700">
              {formatPrice(coursePrice, courseCurrency)}
            </div>
          </div>

          {/* Message based on user role */}
          <div className="text-center space-y-3">
            {isStudent && (
              <div className="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                <p className="font-medium text-yellow-800 mb-2">
                  Bạn cần thanh toán để truy cập khóa học này
                </p>
                <p>
                  Vui lòng liên hệ phụ huynh để thực hiện thanh toán học phí.
                  Sau khi thanh toán thành công, bạn sẽ có thể truy cập đầy đủ
                  nội dung khóa học.
                </p>
              </div>
            )}

            {isParent && (
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <CreditCard className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800 mb-2">
                  Con bạn cần thanh toán để truy cập khóa học
                </p>
                <p>
                  Khóa học này yêu cầu thanh toán học phí trước khi con bạn có
                  thể truy cập nội dung bài học và tham gia các hoạt động.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          {isParent && (
            <PaymentButton
              classroomId={classroom.id}
              courseId={classroom.course?.id || ''}
              courseName={classroom.course?.title || classroom.name}
              coursePrice={coursePrice}
              userRole="parent"
              variant="primary"
              size="lg"
              className="w-full"
              onPaymentSuccess={() => {
                onClose()
                // Reload để update payment status
                window.location.reload()
              }}
            />
          )}

          {isStudent && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Liên hệ phụ huynh để thực hiện thanh toán
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
