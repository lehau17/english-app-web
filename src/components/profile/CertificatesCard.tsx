import { useQuery } from '@tanstack/react-query'
import { Award, Calendar, Download, Eye, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { certificateApi } from '../../apis/certificate.api'
import type { IssuedCertificate } from '../../types/certificate.type'
import CertificateDetailModal from './CertificateDetailModal'

const CertificatesCard: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [selectedCertificate, setSelectedCertificate] =
    useState<IssuedCertificate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getMyCertificates({ skip: 0, take: 12 }),
  })

  const handleDownload = async (
    certificateId: string,
    certificateName: string
  ) => {
    if (downloadingId) return

    setDownloadingId(certificateId)
    try {
      const blob = await certificateApi.downloadCertificate(certificateId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${certificateName}-certificate.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Đã tải xuống chứng chỉ')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Không thể tải xuống chứng chỉ')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold">
            Chứng chỉ của tôi
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold">
            Chứng chỉ của tôi
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Không thể tải danh sách chứng chỉ</p>
        </div>
      </div>
    )
  }

  const certificates = data?.data || []
  const total = data?.total || 0

  if (certificates.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold">
            Chứng chỉ của tôi
          </h3>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Award className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Bạn chưa có chứng chỉ nào</p>
          <p className="text-sm text-gray-500">
            Hoàn thành các khóa học để nhận chứng chỉ
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            Chứng chỉ của tôi
          </h3>
          <p className="text-sm text-gray-500 mt-1">{total} chứng chỉ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate: IssuedCertificate) => (
          <div
            key={certificate.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Award className="h-6 w-6 text-white" />
              </div>
              {certificate.finalScore !== null &&
                certificate.finalScore !== undefined && (
                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    <TrendingUp className="h-3 w-3" />
                    {certificate.finalScore.toFixed(1)}
                  </div>
                )}
            </div>

            <h4 className="mb-2 line-clamp-2 font-semibold text-gray-900">
              {certificate.courseName}
            </h4>

            <div className="mb-3 space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Cấp ngày: {formatDate(certificate.issueDate)}</span>
              </div>
              {certificate.classroom?.name && (
                <div className="text-gray-600">
                  Lớp: {certificate.classroom.name}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCertificate(certificate)
                  setIsModalOpen(true)
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                <span>Xem chi tiết</span>
              </button>
              <button
                onClick={() =>
                  handleDownload(certificate.id, certificate.courseName)
                }
                disabled={downloadingId === certificate.id}
                className="flex items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingId === certificate.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600"></div>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <CertificateDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCertificate(null)
        }}
        certificate={selectedCertificate}
      />
    </div>
  )
}

export default CertificatesCard
