import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Users,
} from 'lucide-react'
import React from 'react'
import { useParentUnpaidClassrooms } from '../../hooks/useParentPayments'
import { PaymentButton } from '../payment/PaymentButton'

export const ParentPaymentSection: React.FC = () => {
  const {
    data: unpaidClassrooms = [],
    isLoading,
    refetch,
  } = useParentUnpaidClassrooms()

  const formatPrice = (price: number, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(price)
  }

  const handlePaymentSuccess = () => {
    // Refetch data to update the list
    refetch()
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!unpaidClassrooms.length) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 shadow-sm ring-1 ring-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">
              Tất cả đã thanh toán
            </h3>
            <p className="text-sm text-green-700">
              Con em của bạn đã thanh toán đầy đủ cho tất cả các khóa học.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Khóa học cần thanh toán
          </h2>
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            {unpaidClassrooms.length} khóa học
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {unpaidClassrooms.map((classroom: any) => {
          const isUpcoming = classroom.status === 'upcoming'
          const isOngoing = classroom.status === 'ongoing'

          return (
            <div
              key={classroom.id}
              className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">
                      {classroom.course.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isUpcoming
                          ? 'bg-blue-100 text-blue-700'
                          : isOngoing
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {isUpcoming
                        ? 'Sắp diễn ra'
                        : isOngoing
                          ? 'Đang diễn ra'
                          : 'Đã kết thúc'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Học sinh: {classroom.child.displayName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          Lớp: {classroom.name} ({classroom.classCode})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Giáo viên: {classroom.teacher.displayName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(classroom.periodStart).toLocaleDateString(
                            'vi-VN'
                          )}{' '}
                          -{' '}
                          {new Date(classroom.periodEnd).toLocaleDateString(
                            'vi-VN'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPrice(
                          classroom.course.price,
                          classroom.course.currency
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Học phí khóa học
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <PaymentButton
                    classroomId={classroom.id}
                    courseId={classroom.course.id}
                    courseName={classroom.course.title}
                    coursePrice={classroom.course.price}
                    userRole="parent"
                    variant="primary"
                    size="sm"
                    onPaymentSuccess={handlePaymentSuccess}
                    studentId={classroom.child.id}
                  />
                </div>
              </div>

              {isUpcoming && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Khóa học sẽ bắt đầu vào{' '}
                    {new Date(classroom.periodStart).toLocaleDateString(
                      'vi-VN'
                    )}
                    . Hãy thanh toán sớm để con em không bị trễ tiến độ học tập.
                  </p>
                </div>
              )}

              {isOngoing && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Khẩn cấp:</strong> Khóa học đang diễn ra nhưng chưa
                    thanh toán. Con em có thể bị hạn chế quyền truy cập nội dung
                    học tập.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-xl bg-gray-50 p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Hướng dẫn thanh toán</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • Nhấn nút "Thanh toán" để được chuyển đến cổng thanh toán VNPay
          </li>
          <li>
            • Hỗ trợ thanh toán qua thẻ ATM, Internet Banking, và ví điện tử
          </li>
          <li>
            • Sau khi thanh toán thành công, con em sẽ có quyền truy cập đầy đủ
          </li>
          <li>• Liên hệ hỗ trợ nếu gặp vấn đề trong quá trình thanh toán</li>
        </ul>
      </div>
    </div>
  )
}
