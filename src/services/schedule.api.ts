import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  StudentDailySchedule,
  StudentWeeklySchedule,
} from '../types/student-schedule.type'

export type DailyScheduleParams = {
  date?: string
  timezone?: string
}

const buildQueryParams = (params?: DailyScheduleParams) => {
  if (!params) return undefined
  const query: Record<string, string> = {}
  if (params.date) {
    query.date = params.date
  }
  if (params.timezone) {
    query.timezone = params.timezone
  }
  return Object.keys(query).length ? query : undefined
}

export const getMyDailySchedule = async (
  params?: DailyScheduleParams
): Promise<BaseResponse<StudentDailySchedule>> => {
  const { data } = await api.get<BaseResponse<StudentDailySchedule>>(
    '/private/v1/classrooms/my-schedule/daily',
    {
      params: buildQueryParams(params),
    }
  )
  return data
}

export const getStudentDailySchedule = async (
  studentId: string,
  params?: DailyScheduleParams
): Promise<BaseResponse<StudentDailySchedule>> => {
  const { data } = await api.get<BaseResponse<StudentDailySchedule>>(
    `/private/v1/classrooms/students/${studentId}/schedule/daily`,
    {
      params: buildQueryParams(params),
    }
  )
  return data
}

export type WeeklyScheduleParams = {
  weekStart?: string
  days?: number
  timezone?: string
}

const buildWeeklyQueryParams = (params?: WeeklyScheduleParams) => {
  if (!params) return undefined
  const query: Record<string, string> = {}
  if (params.weekStart) {
    query.weekStart = params.weekStart
  }
  if (params.days) {
    query.days = String(params.days)
  }
  if (params.timezone) {
    query.timezone = params.timezone
  }
  return Object.keys(query).length ? query : undefined
}

export const getMyWeeklySchedule = async (
  params?: WeeklyScheduleParams
): Promise<BaseResponse<StudentWeeklySchedule>> => {
  const { data } = await api.get<BaseResponse<StudentWeeklySchedule>>(
    '/private/v1/classrooms/my-schedule/weekly',
    {
      params: buildWeeklyQueryParams(params),
    }
  )
  return data
}

export const getStudentWeeklySchedule = async (
  studentId: string,
  params?: WeeklyScheduleParams
): Promise<BaseResponse<StudentWeeklySchedule>> => {
  const { data } = await api.get<BaseResponse<StudentWeeklySchedule>>(
    `/private/v1/classrooms/students/${studentId}/schedule/weekly`,
    {
      params: buildWeeklyQueryParams(params),
    }
  )
  return data
}
