import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { PageResponse } from '../types/page-response.type'
import type {
  Attempt,
  CanStartActivityRequest,
  CanStartActivityResponse,
  CompleteActivityRequest,
  CompleteActivityResponse,
  LessonFullResponse,
  LessonMeta,
  NextActivityResponse,
  ProgressSummaryResponse,
  StartActivityRequest,
  StartActivityResponse,
} from '../types/learn.type'

export async function getLessonFull(lessonId: string, userId?: string) {
  const url = userId
    ? `/private/v1/lessons/${lessonId}/full?userId=${userId}`
    : `/private/v1/lessons/${lessonId}/full`
  const response = await api.get<BaseResponse<LessonFullResponse>>(url)
  return response.data
}

export async function getNextActivity(lessonId: string, userId: string) {
  const response = await api.get<BaseResponse<NextActivityResponse>>(
    `/private/v1/lessons/${lessonId}/next-activity?userId=${userId}`
  )
  return response.data
}

export async function getLessonProgressSummary(
  lessonId: string,
  userId: string
) {
  const response = await api.get<BaseResponse<ProgressSummaryResponse>>(
    `/private/v1/lessons/${lessonId}/progress-summary?userId=${userId}`
  )
  return response.data
}

export async function startActivity(dto: StartActivityRequest) {
  const response = await api.post<BaseResponse<StartActivityResponse>>(
    '/private/v1/lessons/activity/start',
    dto
  )
  return response.data
}

export async function canStartActivity(dto: CanStartActivityRequest) {
  const response = await api.post<BaseResponse<CanStartActivityResponse>>(
    '/private/v1/lessons/activity/can-start',
    dto
  )
  return response.data
}

export async function completeActivity(dto: CompleteActivityRequest) {
  const response = await api.post<BaseResponse<CompleteActivityResponse>>(
    '/private/v1/lessons/activity/complete',
    dto
  )
  return response.data
}

export async function unlockNextLesson(lessonId: string) {
  const response = await api.post<
    BaseResponse<{ message: string; nextLessonId?: string }>
  >(`/private/v1/lessons/${lessonId}/unlock`)
  return response.data
}

export async function getClassroomDetail(classroomId: string) {
  const response = await api.get<BaseResponse<any>>(
    `/private/v1/classrooms/${classroomId}/detail`
  )
  return response.data
}

export async function getNextLesson() {
  const response = await api.get<BaseResponse<any>>('/private/v1/lessons/next')
  return response.data
}

export async function getLessonDetail(lessonId: string) {
  const response = await api.get<BaseResponse<any>>(
    `/private/v1/lessons/${lessonId}`
  )
  return response.data
}

export async function fetchLessonAndActivities(
  _classroomId: string,
  lessonId: string,
  userId: string
) {
  // Get lesson full data (bao gồm activities và progress)
  const lessonResponse = await getLessonFull(lessonId, userId)
  const lesson = lessonResponse.data

  // Tìm current activity dựa trên progress của user
  let currentActivityId = lesson.activities[0]?.id

  // Nếu có progress data, tìm activity chưa hoàn thành đầu tiên
  if (lesson.activities && lesson.activities.length > 0) {
    const inProgressActivity = lesson.activities.find(
      (activity: any) =>
        activity.progress?.state === 'in_progress' ||
        activity.progress?.state === 'not_started'
    )
    if (inProgressActivity) {
      currentActivityId = inProgressActivity.id
    } else {
      // Nếu tất cả đã hoàn thành, lấy activity đầu tiên
      currentActivityId = lesson.activities[0].id
    }
  }

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      orderNo: lesson.orderNo,
      description: lesson.description,
      estimatedTime: lesson.estimatedTime,
      objectives: lesson.objectives,
    } as LessonMeta,
    activities: lesson.activities,
    currentActivityId,
  }
}

export async function getActivityAttemptHistory(
  activityId: string,
  userId: string,
  page = 1,
  limit = 20
) {
  const response = await api.get<BaseResponse<PageResponse<Attempt>>>(
    `/private/v1/attempts?activityId=${activityId}&userId=${userId}&page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`
  )
  return response.data
}

export interface UpdateProgressTimeSpentRequest {
  userId: string
  activityId: string
  timeSpentSec: number
}

export async function updateProgressTimeSpent(
  dto: UpdateProgressTimeSpentRequest
) {
  const response = await api.put<BaseResponse<any>>(
    '/private/v1/progresses/time-spent',
    dto
  )
  return response.data
}
