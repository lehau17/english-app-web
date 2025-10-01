import { ArrowLeft, CheckCircle2, Home, Loader2, XCircle } from 'lucide-react'
import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useVNPayReturnHandler } from '../../hooks/payment.hooks'

export const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { processReturnParams, isProcessing, result } = useVNPayReturnHandler()

  useEffect(() => {
    // Process VNPay return parameters when component mounts
    if (searchParams.toString()) {
      processReturnParams(searchParams)
    }
  }, [searchParams, processReturnParams])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoToMyClasses = () => {
    navigate('/my-classrooms')
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang xử lý kết quả thanh toán...
          </h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy thông tin thanh toán
          </h2>
          <p className="text-gray-600 mb-6">
            Có vẻ như bạn đã truy cập sai đường dẫn hoặc phiên thanh toán đã hết
            hạn.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleGoBack}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {result.success ? (
          <>
            {/* Success State */}
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Thanh toán thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn đã thanh toán thành công. Giờ bạn có thể tham gia khóa học.
            </p>

            {/* Success Actions */}
            <div className="space-y-3">
              <button
                onClick={handleGoToMyClasses}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Vào lớp học ngay</span>
              </button>
              <button
                onClick={handleGoHome}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Về trang chủ</span>
              </button>
            </div>

            {/* Transaction Info */}
            {result.responseCode && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Mã giao dịch:{' '}
                  <span className="font-mono">{result.responseCode}</span>
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Error State */}
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Thanh toán không thành công
            </h2>
            <p className="text-red-600 mb-6">{result.message}</p>

            {/* Error Actions */}
            <div className="space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại thanh toán
              </button>
              <button
                onClick={handleGoHome}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Về trang chủ</span>
              </button>
            </div>

            {/* Error Details */}
            {result.responseCode && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  Mã lỗi:{' '}
                  <span className="font-mono">{result.responseCode}</span>
                </p>
              </div>
            )}
          </>
        )}

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ?
            <button className="text-blue-600 hover:text-blue-700 ml-1">
              Liên hệ với chúng tôi
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
