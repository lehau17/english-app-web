import { useQuery } from '@tanstack/react-query'
import { Award, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import certificateApi from '../apis/certificate.api'
import CertificateCard from '../components/certificates/CertificateCard'

const MyCertificatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch certificates
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => certificateApi.getMyCertificates({ skip: 0, take: 100 }),
  })

  // Filter certificates based on search
  const filteredCertificates =
    data?.data.filter(
      (cert) =>
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Có lỗi xảy ra
          </h3>
          <p className="text-gray-600">Không thể tải danh sách chứng chỉ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Chứng Chỉ Của Tôi
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Tất cả các chứng chỉ bạn đã đạt được trong quá trình học tập
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 -mt-20">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng chứng chỉ</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.total || 0}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-full p-3">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.data.length
                    ? Math.round(
                        data.data
                          .filter((c) => c.finalScore)
                          .reduce((sum, c) => sum + (c.finalScore || 0), 0) /
                          data.data.filter((c) => c.finalScore).length
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hoàn thành 100%</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.data.filter((c) => c.progress === 100).length || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chứng chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <Award className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy chứng chỉ' : 'Chưa có chứng chỉ'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Hoàn thành các khóa học để nhận chứng chỉ của bạn'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => (window.location.href = '/courses')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>Khám phá khóa học</span>
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCertificatesPage
