import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState } from 'react'
import {
  getStudentGradeDetails,
  type StudentGradeDetails,
} from '../../services/gradebook.api'

interface GradeDetailAccordionProps {
  studentId: string
  classroomId: string
}

const GradeDetailAccordion: React.FC<GradeDetailAccordionProps> = ({
  studentId,
  classroomId,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'assignments' | 'activities'>(
    'assignments'
  )

  const { data, isLoading, error } = useQuery<StudentGradeDetails>({
    queryKey: ['grade-details', studentId, classroomId],
    queryFn: () => getStudentGradeDetails(studentId, classroomId),
    enabled: isOpen,
  })

  const getAssignmentTypeLabel = (type: string) => {
    switch (type) {
      case 'MIDTERM_EXAM':
        return 'Thi giữa kỳ'
      case 'FINAL_EXAM':
        return 'Thi cuối kỳ'
      case 'QUIZ':
        return 'Bài kiểm tra'
      case 'HOMEWORK':
        return 'Bài tập về nhà'
      default:
        return type
    }
  }

  const getActivityTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      vocab: 'Từ vựng',
      pronunciation: 'Phát âm',
      listening: 'Nghe',
      speaking: 'Nói',
      reading: 'Đọc',
      writing: 'Viết',
      grammar: 'Ngữ pháp',
      quiz: 'Câu hỏi',
      flashcard: 'Thẻ ghi nhớ',
      conversation: 'Hội thoại',
    }
    return typeMap[type] || type
  }

  const getStateColor = (state: string) => {
    const stateMap: Record<string, string> = {
      not_started: 'text-gray-500',
      in_progress: 'text-yellow-600',
      done: 'text-green-600',
      review_needed: 'text-orange-600',
      mastered: 'text-blue-600',
    }
    return stateMap[state] || 'text-gray-500'
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        <span>Xem chi tiết</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-4 text-red-600">
              Không thể tải dữ liệu
            </div>
          ) : data ? (
            <>
              {/* Tabs */}
              <div className="flex space-x-1 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'assignments'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Bài tập
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'activities'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Hoạt động
                </button>
              </div>

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="space-y-4">
                  {/* Midterm */}
                  {data.assignments.midterm.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thi giữa kỳ
                      </h4>
                      <div className="space-y-2">
                        {data.assignments.midterm.map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {assignment.title}
                              </span>
                              <span className="text-sm text-gray-600">
                                {assignment.score !== null
                                  ? `${assignment.score}/${assignment.maxScore}`
                                  : 'Chưa có điểm'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Trọng số: {(assignment.weight * 100).toFixed(0)}%
                              |{' '}
                              {assignment.submittedAt
                                ? `Nộp: ${new Date(assignment.submittedAt).toLocaleDateString('vi-VN')}`
                                : 'Chưa nộp'}
                            </div>
                            {assignment.feedback && (
                              <div className="mt-2 text-sm text-gray-700 italic">
                                {assignment.feedback}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final */}
                  {data.assignments.final.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thi cuối kỳ
                      </h4>
                      <div className="space-y-2">
                        {data.assignments.final.map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {assignment.title}
                              </span>
                              <span className="text-sm text-gray-600">
                                {assignment.score !== null
                                  ? `${assignment.score}/${assignment.maxScore}`
                                  : 'Chưa có điểm'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Trọng số: {(assignment.weight * 100).toFixed(0)}%
                              |{' '}
                              {assignment.submittedAt
                                ? `Nộp: ${new Date(assignment.submittedAt).toLocaleDateString('vi-VN')}`
                                : 'Chưa nộp'}
                            </div>
                            {assignment.feedback && (
                              <div className="mt-2 text-sm text-gray-700 italic">
                                {assignment.feedback}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tests */}
                  {data.assignments.tests.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Bài kiểm tra
                      </h4>
                      <div className="space-y-2">
                        {data.assignments.tests.map((assignment) => (
                          <div
                            key={assignment.assignmentId}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900">
                                  {assignment.title}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">
                                  ({getAssignmentTypeLabel(assignment.type)})
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {assignment.score !== null
                                  ? `${assignment.score}/${assignment.maxScore}`
                                  : 'Chưa có điểm'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Trọng số: {(assignment.weight * 100).toFixed(0)}%
                              | Lần nộp: {assignment.attemptCount} |{' '}
                              {assignment.submittedAt
                                ? `Nộp: ${new Date(assignment.submittedAt).toLocaleDateString('vi-VN')}`
                                : 'Chưa nộp'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.assignments.midterm.length === 0 &&
                    data.assignments.final.length === 0 &&
                    data.assignments.tests.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Chưa có bài tập nào
                      </div>
                    )}
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="space-y-2">
                  {data.activities.length > 0 ? (
                    data.activities.map((activity) => (
                      <div
                        key={activity.activityId}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">
                              {activity.title}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({getActivityTypeLabel(activity.type)})
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {activity.bestScore !== null
                              ? activity.bestScore.toFixed(1)
                              : '-'}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Bài học: {activity.lessonTitle} | Số lần làm:{' '}
                          {activity.attemptsCount} |{' '}
                          <span className={getStateColor(activity.state)}>
                            {activity.state === 'not_started'
                              ? 'Chưa bắt đầu'
                              : activity.state === 'in_progress'
                                ? 'Đang làm'
                                : activity.state === 'done'
                                  ? 'Hoàn thành'
                                  : activity.state === 'review_needed'
                                    ? 'Cần ôn lại'
                                    : activity.state === 'mastered'
                                      ? 'Thành thạo'
                                      : activity.state}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Chưa có hoạt động nào
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default GradeDetailAccordion
