import { Award, CheckCircle, Search, ShieldCheck, XCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import certificateApi from '../apis/certificate.api'
import { type IssuedCertificate } from '../types/certificate.type'

const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [verificationInput, setVerificationInput] = useState(
    searchParams.get('code') || searchParams.get('number') || ''
  )
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    certificate?: IssuedCertificate
    message?: string
  } | null>(null)

  const handleVerify = async () => {
    if (!verificationInput.trim()) {
      alert('Vui lòng nhập mã xác thực hoặc số chứng chỉ')
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      let result

      // Determine if input is certificate number or verification code
      if (verificationInput.startsWith('CERT-')) {
        // Certificate number format
        result = await certificateApi.verifyCertificateByNumber(
          verificationInput.trim()
        )
      } else {
        // Verification code (UUID format)
        result = await certificateApi.verifyCertificateByCode(
          verificationInput.trim()
        )
      }

      setVerificationResult(result)
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Không tìm thấy chứng chỉ hoặc mã xác thực không hợp lệ',
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-6">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Xác Thực Chứng Chỉ
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Nhập mã xác thực hoặc số chứng chỉ để kiểm tra tính hợp lệ
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 -mt-20">
          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mã xác thực hoặc số chứng chỉ
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Ví dụ: CERT-ABCD-1234567890-X7K9PQ hoặc UUID"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-xl font-medium transition-colors whitespace-nowrap"
              >
                {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Bạn có thể nhập số chứng chỉ (bắt đầu bằng CERT-) hoặc mã xác thực
              UUID
            </p>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className="animate-fadeIn">
            {verificationResult.success && verificationResult.certificate ? (
              // Success - Valid Certificate
              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Chứng Chỉ Hợp Lệ
                  </h2>
                  <p className="text-white/90">
                    Chứng chỉ này đã được xác thực thành công
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-8">
                  {verificationResult.certificate.isRevoked && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 mb-1">
                            Chứng chỉ đã bị thu hồi
                          </p>
                          {verificationResult.certificate.revokedReason && (
                            <p className="text-sm text-red-700">
                              Lý do:{' '}
                              {verificationResult.certificate.revokedReason}
                            </p>
                          )}
                          {verificationResult.certificate.revokedAt && (
                            <p className="text-xs text-red-600 mt-1">
                              Ngày thu hồi:{' '}
                              {formatDate(
                                verificationResult.certificate.revokedAt
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {verificationResult.certificate.studentName}
                    </h3>
                    <p className="text-gray-600 mb-4">Đã hoàn thành khóa học</p>
                    <h4 className="text-xl font-semibold text-indigo-600">
                      {verificationResult.certificate.courseName}
                    </h4>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Số chứng chỉ</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {verificationResult.certificate.certificateNumber}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Ngày cấp</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(verificationResult.certificate.issueDate)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">
                        Ngày hoàn thành
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(
                          verificationResult.certificate.completionDate
                        )}
                      </p>
                    </div>
                    {verificationResult.certificate.finalScore && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Điểm số</p>
                        <p className="font-semibold text-gray-900">
                          {verificationResult.certificate.finalScore}%
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6 text-center">
                    <p className="text-sm text-gray-600">
                      Chứng chỉ được cấp bởi
                    </p>
                    <p className="font-semibold text-gray-900">
                      English Learning Platform
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Error - Invalid Certificate
              <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-500 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
                    <XCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Không Tìm Thấy
                  </h2>
                  <p className="text-white/90">
                    {verificationResult.message || 'Mã xác thực không hợp lệ'}
                  </p>
                </div>
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-6">
                    Vui lòng kiểm tra lại mã xác thực hoặc số chứng chỉ và thử
                    lại
                  </p>
                  <button
                    onClick={() => {
                      setVerificationInput('')
                      setVerificationResult(null)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!verificationResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Xác Thực Nhanh
              </h3>
              <p className="text-sm text-gray-600">
                Kiểm tra tính hợp lệ của chứng chỉ chỉ trong vài giây
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Thông Tin Đầy Đủ
              </h3>
              <p className="text-sm text-gray-600">
                Xem chi tiết người nhận và khóa học đã hoàn thành
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tin Cậy</h3>
              <p className="text-sm text-gray-600">
                Hệ thống xác thực được mã hóa an toàn
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyCertificatePage
