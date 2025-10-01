import { ArrowLeft, Book, Clock, Star, Users } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PaymentButton, PurchaseGuard } from '../components/payment'
import { useAuth } from '../context/AuthContext'

// Demo data - in real app this would come from API
const demoCourse = {
  id: 'demo-course-1',
  title: 'Tiếng Anh Giao Tiếp Căn Bản',
  description:
    'Khóa học giúp bạn nắm vững các kỹ năng giao tiếp tiếng Anh cơ bản trong các tình huống hàng ngày.',
  price: 299000,
  instructor: 'Cô Mai Anh',
  duration: '8 tuần',
  students: 45,
  rating: 4.8,
  lessons: [
    { id: '1', title: 'Giới thiệu bản thân', duration: '30 phút' },
    { id: '2', title: 'Hỏi đường và chỉ đường', duration: '25 phút' },
    { id: '3', title: 'Mua sắm và thanh toán', duration: '35 phút' },
    { id: '4', title: 'Đặt món ăn tại nhà hàng', duration: '30 phút' },
    { id: '5', title: 'Nói về sở thích', duration: '40 phút' },
  ],
}

const demoClassroom = {
  id: 'demo-classroom-1',
  name: 'Lớp Giao Tiếp Sáng T2-T4-T6',
  classCode: 'GTC001',
}

export const PaymentDemoPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState<'overview' | 'lessons'>(
    'overview'
  )

  const handleGoBack = () => {
    navigate(-1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const courseContent = (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{demoCourse.title}</h1>
            <p className="text-blue-100 text-lg mb-6">
              {demoCourse.description}
            </p>

            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>{demoCourse.students} học viên</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>{demoCourse.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 fill-current" />
                <span>{demoCourse.rating} ⭐</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold mb-2">
              {formatPrice(demoCourse.price)}
            </div>
            <div className="text-blue-100">Giá khóa học</div>
          </div>
        </div>
      </div>

      {/* Course Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === 'overview'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tổng quan
        </button>
        <button
          onClick={() => setSelectedTab('lessons')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === 'lessons'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Bài học ({demoCourse.lessons.length})
        </button>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'overview' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Thông tin giảng viên</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">MA</span>
              </div>
              <div>
                <div className="font-medium">{demoCourse.instructor}</div>
                <div className="text-gray-600 text-sm">
                  Giảng viên tiếng Anh
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Bạn sẽ học được gì?</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Giao tiếp tự tin trong các tình huống hàng ngày</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Nắm vững từ vựng và cấu trúc câu cơ bản</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Phát âm chuẩn và tự nhiên</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Tự tin khi nói chuyện với người nước ngoài</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {demoCourse.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="bg-white p-6 rounded-lg border flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-gray-600 text-sm">{lesson.duration}</p>
                </div>
              </div>
              <Book className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Demo Payment System
              </h1>
              <p className="text-gray-600">
                Lớp: {demoClassroom.name} ({demoClassroom.classCode})
              </p>
            </div>
          </div>

          {/* Payment Button in Header */}
          <PaymentButton
            classroomId={demoClassroom.id}
            courseId={demoCourse.id}
            courseName={demoCourse.title}
            coursePrice={demoCourse.price}
            userRole={user?.role === 'parent' ? 'parent' : 'student'}
            variant="primary"
            size="lg"
            onPaymentSuccess={() => {
              // Refetch purchase status or redirect
              window.location.reload()
            }}
          />
        </div>

        {/* Main Content with Purchase Guard */}
        <PurchaseGuard
          classroomId={demoClassroom.id}
          courseId={demoCourse.id}
          courseName={demoCourse.title}
          coursePrice={demoCourse.price}
          userRole={user?.role === 'parent' ? 'parent' : 'student'}
        >
          {courseContent}
        </PurchaseGuard>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <strong>Lưu ý:</strong> Đây là trang demo hệ thống thanh toán. Sử
            dụng thông tin thanh toán demo của VNPay sandbox để test. Không có
            tiền thật được thu.
          </p>
        </div>
      </div>
    </div>
  )
}
