import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle,
  Download,
  QrCode,
  Share2,
  TrendingUp,
} from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import certificateApi from '../apis/certificate.api'

const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showQR, setShowQR] = useState(false)

  const {
    data: certificate,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['certificate', id],
    queryFn: () => certificateApi.getCertificateById(id!),
    enabled: !!id,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleDownload = () => {
    // TODO: Implement PDF download when ready
    console.log('Download certificate:', id)
    alert('Tính năng tải xuống PDF đang được phát triển!')
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/verify-certificate?code=${certificate?.verificationCode}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Chứng chỉ của tôi',
          text: `Xem chứng chỉ ${certificate?.courseName}`,
          url: shareUrl,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Đã copy link xác thực vào clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải chứng chỉ...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Không tìm thấy chứng chỉ
          </h3>
          <p className="text-gray-600 mb-6">
            Chứng chỉ này không tồn tại hoặc đã bị xóa
          </p>
          <button
            onClick={() => navigate('/certificates')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/certificates')}
            className="flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Chi Tiết Chứng Chỉ
              </h1>
              <p className="text-white/90">{certificate.certificateNumber}</p>
            </div>
            {certificate.isRevoked && (
              <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                Đã thu hồi
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Certificate Preview */}
        <div className="bg-white rounded-2xl shadow-2xl border-4 border-indigo-100 p-12 mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full translate-x-20 translate-y-20 opacity-50"></div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
              <Award className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {certificate.template?.title || 'Certificate of Completion'}
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              {certificate.template?.description ||
                'This certificate is awarded for successfully completing the course'}
            </p>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
              <p className="text-sm text-gray-600 mb-2">
                Chứng chỉ này được trao cho
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {certificate.studentName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Đã hoàn thành khóa học
              </p>
              <h4 className="text-2xl font-semibold text-indigo-600">
                {certificate.courseName}
              </h4>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Ngày hoàn thành</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(certificate.completionDate)}
                </p>
              </div>

              {certificate.finalScore && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">Điểm số</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {certificate.finalScore}%
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-gray-600 mb-1">Tiến độ</p>
                <p className="text-sm font-semibold text-gray-900">
                  {certificate.progress}%
                </p>
              </div>

              {certificate.totalHours && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <span className="text-2xl mb-2 block">⏱️</span>
                  <p className="text-xs text-gray-600 mb-1">Thời gian</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {certificate.totalHours}h
                  </p>
                </div>
              )}
            </div>

            {/* Issuer Info */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-2">
                {certificate.template?.issuerName ||
                  'English Learning Platform'}
              </p>
              {certificate.template?.issuerTitle && (
                <p className="text-xs text-gray-500">
                  {certificate.template.issuerTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Tải xuống PDF</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Chia sẻ</span>
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <QrCode className="w-5 h-5" />
            <span>Mã QR</span>
          </button>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Mã QR Xác Thực
            </h3>
            <div className="inline-block bg-gray-100 p-8 rounded-xl mb-4">
              <div className="w-48 h-48 bg-white flex items-center justify-center">
                <p className="text-gray-500">QR Code sẽ được tạo tại đây</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Quét mã QR để xác thực chứng chỉ này
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Code: {certificate.verificationCode}
            </p>
          </div>
        )}

        {/* Certificate Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Thông Tin Chứng Chỉ
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Số chứng chỉ:</span>
              <span className="font-mono font-semibold text-gray-900">
                {certificate.certificateNumber}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ngày cấp:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(certificate.issueDate)}
              </span>
            </div>
            {certificate.verifiedAt && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Đã xác thực:</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(certificate.verifiedAt)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Trạng thái:</span>
              <span
                className={`font-semibold ${certificate.isRevoked ? 'text-red-600' : 'text-green-600'}`}
              >
                {certificate.isRevoked ? 'Đã thu hồi' : 'Hợp lệ'}
              </span>
            </div>
            {certificate.isRevoked && certificate.revokedReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-800">
                  <span className="font-semibold">Lý do thu hồi:</span>{' '}
                  {certificate.revokedReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateDetailPage
