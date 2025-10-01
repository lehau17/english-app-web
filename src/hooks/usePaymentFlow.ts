import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ClassroomWithStatus } from './useClassroomStatus'

export const usePaymentFlow = () => {
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomWithStatus | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const { user } = useAuth()

  const handleClassroomClick = (classroom: ClassroomWithStatus) => {
    // Nếu classroom cần thanh toán và chưa thanh toán
    if (classroom.needsPayment && !classroom.isPurchased) {
      // Nếu là học sinh hoặc phụ huynh, hiển thị modal thanh toán
      if (user?.role === 'student' || user?.role === 'parent') {
        setSelectedClassroom(classroom)
        setShowPaymentModal(true)
        return true // Prevent navigation
      }
    }
    return false // Allow normal navigation
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
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
    handleClassroomClick,
    closePaymentModal,
    handlePaymentSuccess,
  }
}
