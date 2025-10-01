import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  MyClassroomResponse,
  NextLesson,
  StudentDashboard,
} from '../types/home.type'
import type { LeaderboardApiResponse } from '../types/leaderboard.type'
import type { User } from '../types/user.type'

// Lấy thông tin user hiện tại
export const fetchUserInfo = async (): Promise<BaseResponse<User>> => {
  const { data } = await api.get<BaseResponse<User>>('/private/v1/auth/me')
  return data
}

// Lấy danh sách lớp học của user
export const fetchMyClassrooms = async (
  params?: any
): Promise<BaseResponse<MyClassroomResponse[]>> => {
  const { data } = await api.get<BaseResponse<MyClassroomResponse[]>>(
    '/private/v1/classrooms/my-classrooms',
    { params }
  )
  return data
}

// Lấy bài học tiếp theo của user (giả sử API có endpoint này, nếu không cần chỉnh lại)
export const fetchNextLesson = async (): Promise<BaseResponse<NextLesson>> => {
  const { data } = await api.get<BaseResponse<NextLesson>>(
    '/private/v1/lessons/next'
  )
  return data
}

// Lấy nhiệm vụ hôm nay và bảng xếp hạng tuần từ dashboard
export const fetchStudentDashboard = async (): Promise<
  BaseResponse<StudentDashboard>
> => {
  const { data } = await api.get<BaseResponse<StudentDashboard>>(
    '/private/v1/student-dashboard'
  )
  return data
}

export const fetchClassroomLeaderboard = async (
  classroomId: string,
  params?: { year?: number; month?: number; from?: string; to?: string }
): Promise<LeaderboardApiResponse> => {
  const { data } = await api.get<LeaderboardApiResponse>(
    `/private/v1/leaderboards/classrooms/${classroomId}`,
    { params }
  )
  return data
}

export const fetchMonthlyLeaderboard = async (params: {
  year: number
  month: number
  classroomId?: string
}): Promise<LeaderboardApiResponse> => {
  const { data } = await api.get<LeaderboardApiResponse>(
    '/private/v1/leaderboards/monthly',
    { params }
  )
  return data
}

export const fetchYearlyLeaderboard = async (params: {
  year: number
  classroomId?: string
}): Promise<LeaderboardApiResponse> => {
  const { data } = await api.get<LeaderboardApiResponse>(
    '/private/v1/leaderboards/yearly',
    { params }
  )
  return data
}
