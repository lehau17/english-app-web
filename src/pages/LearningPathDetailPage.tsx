import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, CheckCircle2, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import LearningPathProgress from '../components/learning-path/LearningPathProgress'
import {
  useDeleteLearningPath,
  useLearningPath,
} from '../hooks/useLearningPath'
import { fetchActivitiesByIds } from '../services/activity.api'

export default function LearningPathDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: path, isLoading, error } = useLearningPath(id || '')
  const deletePath = useDeleteLearningPath()

  // Fetch activity details
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['activities', path?.activityIds],
    queryFn: () => fetchActivitiesByIds(path?.activityIds || []),
    enabled: !!path && path.activityIds.length > 0,
  })

  const activities = activitiesData?.data || []
  const activitiesMap = new Map(activities.map((a) => [a.id, a]))

  useEffect(() => {
    if (error) {
      navigate('/learning-paths')
    }
  }, [error, navigate])

  const handleDelete = async () => {
    if (!id || !confirm('Bạn có chắc muốn xóa lộ trình học này?')) return

    setIsDeleting(true)
    try {
      await deletePath.mutateAsync(id)
      navigate('/learning-paths')
    } catch (error) {
      console.error('Failed to delete learning path:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!path) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Không tìm thấy lộ trình học
          </h3>
          <button
            onClick={() => navigate('/learning-paths')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/learning-paths')}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{path.name}</h1>
              {path.isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Hoàn thành
                </span>
              ) : path.currentStep > 0 ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                  Đang học
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                  Chưa bắt đầu
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">Mục tiêu:</span>
                <span className="capitalize">{path.targetLevel}</span>
              </div>
              {path.focusAreas && path.focusAreas.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-600">
                    Tập trung:
                  </span>
                  {path.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
              {path.timeframe && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Thời gian:</span>{' '}
                  {path.timeframe} ngày
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <LearningPathProgress path={path} showDetails />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!path.isCompleted && path.activityIds.length > 0 && (
              <button
                onClick={() => {
                  const currentActivityId = path.activityIds[path.currentStep]
                  const activity = activitiesMap.get(currentActivityId)

                  // Derive classroomId with fallback logic
                  const classroomId = path.classroomId || activity?.classroomId

                  if (!classroomId) {
                    toast.error(
                      'Không tìm thấy thông tin lớp học. Vui lòng thử lại.'
                    )
                    console.error('Missing classroomId for navigation', {
                      path,
                      activity,
                    })
                    return
                  }

                  if (!activity?.lessonId) {
                    toast.error('Không tìm thấy thông tin bài học')
                    console.warn(
                      'Current activity not found:',
                      currentActivityId
                    )
                    return
                  }

                  // Fixed navigation pattern
                  navigate(`/learn/${classroomId}/${activity.lessonId}`)
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <Play className="h-4 w-4" />
                Tiếp tục học
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Danh sách hoạt động ({path.activityIds.length})
        </h2>

        {isLoadingActivities ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : path.activityIds.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Chưa có hoạt động trong lộ trình này
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {path.activityIds.map((activityId, idx) => {
              const isCompleted = idx < path.currentStep
              const isCurrent = idx === path.currentStep
              const isUpcoming = idx > path.currentStep

              return (
                <div
                  key={activityId}
                  className={`rounded-lg border p-4 transition ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isCompleted
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activitiesMap.get(activityId)?.title ||
                            `Hoạt động ${idx + 1}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activitiesMap.get(activityId)?.type ? (
                            <span className="capitalize">
                              {activitiesMap.get(activityId)?.type}
                            </span>
                          ) : (
                            `ID: ${activityId}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Hoàn thành
                        </span>
                      )}
                      {isCurrent && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          Đang học
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                          Sắp tới
                        </span>
                      )}
                      {isCurrent && (
                        <button
                          onClick={() => {
                            const activity = activitiesMap.get(activityId)

                            // Derive classroomId with fallback logic
                            const classroomId =
                              path.classroomId || activity?.classroomId

                            if (!classroomId) {
                              toast.error(
                                'Không tìm thấy thông tin lớp học. Vui lòng thử lại.'
                              )
                              console.error(
                                'Missing classroomId for navigation',
                                { path, activity }
                              )
                              return
                            }

                            if (!activity?.lessonId) {
                              toast.error('Không tìm thấy thông tin bài học')
                              console.warn(
                                'Activity not found or missing lessonId:',
                                activityId
                              )
                              return
                            }

                            // Fixed navigation pattern
                            navigate(
                              `/learn/${classroomId}/${activity.lessonId}`
                            )
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                        >
                          <Play className="h-3 w-3" />
                          Bắt đầu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
