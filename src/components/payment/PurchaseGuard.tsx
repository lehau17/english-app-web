import { CheckCircle2, CreditCard, Loader2, Lock } from 'lucide-react'
import React, { useState } from 'react'
import { usePurchaseStatus } from '../../hooks/payment.hooks'
import { PaymentModal } from './PaymentModal'

interface PurchaseGuardProps {
  classroomId: string
  courseId: string
  courseName: string
  coursePrice: number
  userRole: 'student' | 'parent'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const PurchaseGuard: React.FC<PurchaseGuardProps> = ({
  classroomId,
  courseId,
  courseName,
  coursePrice,
  userRole,
  children,
  fallback,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const {
    data: purchaseStatus,
    isLoading,
    error,
    refetch,
  } = usePurchaseStatus(classroomId)

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-600">
            Đang kiểm tra trạng thái thanh toán...
          </p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Không thể kiểm tra trạng thái thanh toán
          </h3>
          <p className="text-gray-600">
            Có lỗi xảy ra khi kiểm tra trạng thái. Vui lòng thử lại.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // If purchased, show content
  if (purchaseStatus?.data.isPurchased) {
    return (
      <>
        {children}
        {/* Optional success indicator */}
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Đã thanh toán</span>
          </div>
        </div>
      </>
    )
  }

  // If free course (price = 0), this should not happen as backend auto-sets isPurchased
  if (coursePrice === 0) {
    return <>{children}</>
  }

  // Show purchase required state
  const PurchaseRequiredContent = fallback || (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-6 max-w-md">
        {/* Lock Icon */}
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Lock className="h-8 w-8 text-blue-600" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900">
          Cần thanh toán để truy cập
        </h3>

        {/* Course Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{courseName}</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giá:</span>
            <span className="text-xl font-bold text-blue-600">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(coursePrice)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600">
          {userRole === 'parent'
            ? 'Vui lòng thanh toán để con em có thể tham gia khóa học này.'
            : 'Bạn cần thanh toán hoặc liên hệ phụ huynh để tham gia khóa học này.'}
        </p>

        {/* Action Button */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <CreditCard className="h-5 w-5" />
          <span>Thanh toán ngay</span>
        </button>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>✓ Thanh toán an toàn với VNPay</p>
          <p>✓ Truy cập ngay sau khi thanh toán</p>
          <p>✓ Hỗ trợ 24/7</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {PurchaseRequiredContent}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        classroomId={classroomId}
        courseId={courseId}
        courseName={courseName}
        coursePrice={coursePrice}
        userRole={userRole}
      />
    </>
  )
}
