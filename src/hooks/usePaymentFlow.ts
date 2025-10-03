import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ClassroomWithStatus } from './useClassroomStatus'

export const usePaymentFlow = () => {
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomWithStatus | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showDirectPaymentModal, setShowDirectPaymentModal] = useState(false)
  const { user } = useAuth()

  const handleClassroomClick = (
    classroom: ClassroomWithStatus,
    hasParent?: boolean
  ) => {
    // Nếu classroom cần thanh toán và chưa thanh toán
    if (classroom.needsPayment && !classroom.isPurchased) {
      if (user?.role === 'parent') {
        // Phụ huynh: hiển thị modal thanh toán bình thường
        setSelectedClassroom(classroom)
        setShowPaymentModal(true)
        return true
      } else if (user?.role === 'student') {
        setSelectedClassroom(classroom)

        // Học sinh không có phụ huynh: hiển thị modal thanh toán trực tiếp
        if (hasParent === false) {
          setShowDirectPaymentModal(true)
        } else {
          // Học sinh có phụ huynh: hiển thị modal thông báo liên hệ phụ huynh
          setShowPaymentModal(true)
        }
        return true // Prevent navigation
      }
    }
    return false // Allow normal navigation
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedClassroom(null)
  }

  const closeDirectPaymentModal = () => {
    setShowDirectPaymentModal(false)
    setSelectedClassroom(null)
  }

  const handlePaymentSuccess = () => {
    closePaymentModal()
    // Reload trang để cập nhật trạng thái thanh toán
    window.location.reload()
  }

  return {
    selectedClassroom,
    showPaymentModal,
    showDirectPaymentModal,
    handleClassroomClick,
    closePaymentModal,
    closeDirectPaymentModal,
    handlePaymentSuccess,
  }
}
