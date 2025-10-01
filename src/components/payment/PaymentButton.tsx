import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { usePurchaseStatus } from '../../hooks/payment.hooks'
import { PaymentModal } from './PaymentModal'

interface PaymentButtonProps {
  classroomId: string
  courseId: string
  courseName: string
  coursePrice: number
  userRole: 'student' | 'parent'
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  onPaymentSuccess?: () => void
  studentId?: string // Thêm studentId cho phụ huynh
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  classroomId,
  courseId,
  courseName,
  coursePrice,
  userRole,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onPaymentSuccess,
  studentId,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { data: purchaseStatus, isLoading } = usePurchaseStatus(classroomId)

  // Get button styling
  const getButtonStyles = () => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    const variantStyles = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
      secondary:
        'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
      outline:
        'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-300',
    }

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`
  }

  // Handle payment modal close with success callback
  const handleModalClose = () => {
    setShowPaymentModal(false)
    if (purchaseStatus?.data.isPurchased && onPaymentSuccess) {
      onPaymentSuccess()
    }
  }

  // If free course, don't show payment button
  if (coursePrice === 0) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <button disabled className={getButtonStyles()}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Kiểm tra...
      </button>
    )
  }

  // Already purchased
  if (purchaseStatus?.data.isPurchased) {
    return (
      <button disabled className={getButtonStyles()}>
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Đã thanh toán
      </button>
    )
  }

  // Payment required
  return (
    <>
      <button
        onClick={() => setShowPaymentModal(true)}
        disabled={disabled}
        className={getButtonStyles()}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {userRole === 'parent' ? 'Thanh toán ngay' : 'Yêu cầu thanh toán'}
      </button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleModalClose}
        classroomId={classroomId}
        courseId={courseId}
        courseName={courseName}
        coursePrice={coursePrice}
        userRole={userRole}
        studentId={studentId}
      />
    </>
  )
}
