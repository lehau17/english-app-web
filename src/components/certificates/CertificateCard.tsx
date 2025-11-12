import { Award, Calendar, Download, Eye, Star } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import certificateApi from '../../apis/certificate.api'
import { type IssuedCertificate } from '../../types/certificate.type'

interface CertificateCardProps {
  certificate: IssuedCertificate
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleView = () => {
    navigate(`/certificates/${certificate.id}`)
  }

  return (
    <div className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-indigo-300 transition-all duration-300 overflow-hidden hover:shadow-xl">
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="absolute top-4 right-4">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>
        {certificate.isRevoked && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Đã thu hồi
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Certificate Number */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {certificate.certificateNumber}
          </span>
          {certificate.finalScore && (
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">
                {certificate.finalScore}%
              </span>
            </div>
          )}
        </div>

        {/* Course Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {certificate.courseName}
        </h3>

        {/* Student Name */}
        <p className="text-sm text-gray-600 mb-4">
          Cấp cho:{' '}
          <span className="font-semibold text-gray-900">
            {certificate.studentName}
          </span>
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(certificate.completionDate)}</span>
          </div>
          {certificate.totalHours && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{certificate.totalHours}h</span>{' '}
              học tập
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Tiến độ hoàn thành</span>
            <span className="font-semibold text-indigo-600">
              {certificate.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${certificate.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Xem chi tiết</span>
          </button>
          <button
            onClick={async () => {
              try {
                const blob = await certificateApi.downloadCertificate(
                  certificate.id
                )
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `certificate-${certificate.certificateNumber}.pdf`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
                toast.success('Đã tải xuống chứng chỉ!')
              } catch (error: any) {
                console.error('Failed to download certificate:', error)
                toast.error(
                  'Không thể tải xuống chứng chỉ. Vui lòng thử lại sau!'
                )
              }
            }}
            className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition-colors"
            title="Tải xuống"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateCard
