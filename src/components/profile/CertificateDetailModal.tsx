import {
  Award,
  Calendar,
  CheckCircle,
  Download,
  TrendingUp,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { certificateApi } from '../../apis/certificate.api'
import type { IssuedCertificate } from '../../types/certificate.type'

interface CertificateDetailModalProps {
  isOpen: boolean
  onClose: () => void
  certificate: IssuedCertificate | null
}

const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen || !certificate) return null

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      const blob = await certificateApi.downloadCertificate(certificate.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${certificate.courseName}-certificate.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Đã tải xuống chứng chỉ')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Không thể tải xuống chứng chỉ')
    } finally {
      setIsDownloading(false)
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Chi tiết chứng chỉ
                  </h3>
                  <p className="text-sm text-gray-500">
                    Thông tin chứng chỉ của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Course Info */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {certificate.courseName}
                </h4>
                {certificate.courseDescription && (
                  <p className="text-sm text-gray-600">
                    {certificate.courseDescription}
                  </p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày cấp</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatDate(certificate.issueDate)}
                  </p>
                </div>

                {certificate.completionDate && (
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Hoàn thành</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatDate(certificate.completionDate)}
                    </p>
                  </div>
                )}

                {certificate.finalScore !== null &&
                  certificate.finalScore !== undefined && (
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Điểm số</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {certificate.finalScore.toFixed(1)} / 100
                      </p>
                    </div>
                  )}

                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Award className="h-4 w-4" />
                    <span>Tiến độ</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {certificate.progress}%
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {(certificate.classroom?.name ||
                certificate.verificationCode) && (
                <div className="space-y-2 rounded-lg border border-gray-200 p-4">
                  {certificate.classroom?.name && (
                    <div>
                      <p className="text-sm text-gray-500">Lớp học</p>
                      <p className="font-medium text-gray-900">
                        {certificate.classroom.name}
                      </p>
                    </div>
                  )}
                  {certificate.verificationCode && (
                    <div>
                      <p className="text-sm text-gray-500">Mã xác thực</p>
                      <p className="font-mono text-sm font-medium text-gray-900">
                        {certificate.verificationCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Certificate Number */}
              {certificate.certificateNumber && (
                <div className="rounded-lg border border-gray-200 bg-indigo-50 p-3">
                  <p className="text-xs text-gray-500 mb-1">Số chứng chỉ</p>
                  <p className="font-mono text-sm font-semibold text-indigo-900">
                    {certificate.certificateNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Tải xuống PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateDetailModal
