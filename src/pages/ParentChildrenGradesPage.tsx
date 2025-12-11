import { useQuery } from '@tanstack/react-query'
import { Download, GraduationCap, Users } from 'lucide-react'
import React, { useState } from 'react'
import ChildGradeDetailModal from '../components/parent/ChildGradeDetailModal'
import {
  exportParentChildrenGradesApi,
  getParentChildrenGradesApi,
  type ParentChildrenGrades,
} from '../services/parent.api'

const ParentChildrenGradesPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedChildForDetails, setSelectedChildForDetails] = useState<{
    childId: string
    childName: string
    classroomId: string
    classroomName: string
  } | null>(null)

  const { data, isLoading, error } = useQuery<ParentChildrenGrades>({
    queryKey: ['parent-children-grades'],
    queryFn: async () => {
      const response = await getParentChildrenGradesApi()
      return response.data
    },
  })

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await exportParentChildrenGradesApi()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bang-diem-cac-con-${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải bảng điểm...</p>
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
          <p className="text-gray-600">Không thể tải bảng điểm</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Bảng Điểm Các Con
              </h1>
              <p className="text-white/90 text-lg">
                Xem điểm số của tất cả các con trong các lớp học
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || !data}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {data && data.children && data.children.length > 0 ? (
          <div className="space-y-8">
            {data.children.map((child) => (
              <div
                key={child.childId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                  <div className="bg-indigo-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {child.childName}
                  </h2>
                </div>

                {child.classrooms && child.classrooms.length > 0 ? (
                  <div className="space-y-4">
                    {child.classrooms.map((classroom) => (
                      <div
                        key={classroom.classroomId}
                        className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {classroom.classroomName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {classroom.courseName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              Điểm tổng kết
                            </p>
                            <p className="text-3xl font-bold text-indigo-600">
                              {classroom.finalGrade.toFixed(1)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => {
                              setSelectedChildForDetails({
                                childId: child.childId,
                                childName: child.childName,
                                classroomId: classroom.classroomId,
                                classroomName: classroom.classroomName,
                              })
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Xem chi tiết
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Giữa kỳ
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classroom.midterm !== null &&
                              classroom.midterm !== undefined
                                ? classroom.midterm.toFixed(1)
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Cuối kỳ
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classroom.final !== null &&
                              classroom.final !== undefined
                                ? classroom.final.toFixed(1)
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Bài kiểm tra
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classroom.tests !== null &&
                              classroom.tests !== undefined
                                ? classroom.tests.toFixed(1)
                                : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Hoạt động
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {classroom.activities !== null &&
                              classroom.activities !== undefined
                                ? classroom.activities.toFixed(1)
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có lớp học nào</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có dữ liệu điểm
            </h3>
            <p className="text-gray-600">
              Các con chưa có điểm số trong bất kỳ lớp học nào
            </p>
          </div>
        )}
      </div>

      {selectedChildForDetails && (
        <ChildGradeDetailModal
          open={!!selectedChildForDetails}
          onClose={() => setSelectedChildForDetails(null)}
          childId={selectedChildForDetails.childId}
          childName={selectedChildForDetails.childName}
          classroomId={selectedChildForDetails.classroomId}
          classroomName={selectedChildForDetails.classroomName}
        />
      )}
    </div>
  )
}

export default ParentChildrenGradesPage
