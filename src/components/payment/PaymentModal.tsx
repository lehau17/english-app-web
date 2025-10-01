import { AlertCircle, CreditCard, Loader2, X } from 'lucide-react'
import React from 'react'
import { usePaymentProcess } from '../../hooks/payment.hooks'
import type { CreatePaymentRequest } from '../../services/payment.api'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  classroomId: string
  courseId: string
  courseName: string
  coursePrice: number
  userRole: 'student' | 'parent'
  studentId?: string // Thêm studentId để phụ huynh có thể thanh toán cho con
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  classroomId,
  courseId,
  courseName,
  coursePrice,
  userRole,
  studentId,
}) => {
  const { initiatePayment, resetPayment, isProcessing, paymentStep, error } =
    usePaymentProcess()

  if (!isOpen) return null

  const handlePayment = async () => {
    const paymentData: CreatePaymentRequest = {
      classroomId,
      courseId,
      amount: coursePrice,
      description: `Thanh toán khóa học: ${courseName}`,
    }

    // Nếu là phụ huynh thanh toán, cần truyền thêm studentId
    if (userRole === 'parent' && studentId) {
      paymentData.studentId = studentId
    }

    await initiatePayment(paymentData)
  }

  const handleClose = () => {
    resetPayment()
    onClose()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getStepContent = () => {
    switch (paymentStep) {
      case 'idle':
        return (
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{courseName}</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Giá khóa học:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(coursePrice)}
                </span>
              </div>
            </div>

            {/* Role-specific message */}
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800">
                    {userRole === 'parent'
                      ? 'Quý phụ huynh đang thực hiện thanh toán cho con em. Vui lòng kiểm tra thông tin trước khi thanh toán.'
                      : 'Bạn cần thanh toán để tham gia khóa học này. Hãy liên hệ phụ huynh nếu cần hỗ trợ.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Phương thức thanh toán
              </h4>
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VNPay</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">VNPay</p>
                    <p className="text-sm text-gray-500">
                      Thanh toán qua ví điện tử, ngân hàng
                    </p>
                  </div>
                  <CreditCard className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Thanh toán ngay</span>
              </button>
            </div>
          </div>
        )

      case 'creating':
        return (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              Đang tạo giao dịch...
            </h3>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        )

      case 'redirecting':
        return (
          <div className="text-center space-y-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Chuyển hướng đến VNPay...
            </h3>
            <p className="text-gray-600">
              Bạn sẽ được chuyển đến trang thanh toán VNPay
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Có lỗi xảy ra
            </h3>
            <p className="text-red-600">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  resetPayment()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0    bg-opacity-50 flex items-center justify-center z-50 p-4 border border-gray-300 shadow-2xl">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Thanh toán khóa học
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{getStepContent()}</div>
      </div>
    </div>
  )
}
