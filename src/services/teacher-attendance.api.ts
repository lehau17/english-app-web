import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { AttendanceStatus } from '../types/attendance.type'

/**
 * Classroom session
 */
export interface ClassroomSession {
  id: string
  classroomId: string
  instructorId: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  timezone: string
  durationHours: number
  type: string
  status: string
  meetingUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Student attendance record with student info
 */
export interface StudentAttendance {
  id: string
  sessionId: string
  studentId: string
  status: AttendanceStatus
  checkInTime: string | null
  checkOutTime: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    displayName: string
    avatarUrl: string | null
  }
}

/**
 * Session attendance summary
 */
export interface SessionAttendanceSummary {
  sessionId: string
  totalStudents: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
  attendances: StudentAttendance[]
}

/**
 * Unmarked student
 */
export interface UnmarkedStudent {
  id: string
  firstName: string
  lastName: string
  displayName: string
  avatarUrl: string | null
}

/**
 * Mark attendance DTO
 */
export interface MarkAttendanceDto {
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  notes?: string
}

/**
 * Bulk attendance item
 */
export interface BulkAttendanceItem {
  studentId: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  notes?: string
}

/**
 * Bulk attendance DTO
 */
export interface BulkAttendanceDto {
  attendances: BulkAttendanceItem[]
}

/**
 * Get all attendances for a session
 */
export const getSessionAttendances = async (
  sessionId: string
): Promise<BaseResponse<StudentAttendance[]>> => {
  const { data } = await api.get<BaseResponse<StudentAttendance[]>>(
    `/private/v1/sessions/${sessionId}/attendance`
  )
  return data
}

/**
 * Get session attendance summary
 */
export const getSessionAttendanceSummary = async (
  sessionId: string
): Promise<BaseResponse<SessionAttendanceSummary>> => {
  const { data } = await api.get<BaseResponse<SessionAttendanceSummary>>(
    `/private/v1/sessions/${sessionId}/attendance/summary`
  )
  return data
}

/**
 * Get unmarked students for a session
 */
export const getUnmarkedStudents = async (
  sessionId: string
): Promise<BaseResponse<UnmarkedStudent[]>> => {
  const { data } = await api.get<BaseResponse<UnmarkedStudent[]>>(
    `/private/v1/sessions/${sessionId}/attendance/unmarked`
  )
  return data
}

/**
 * Mark attendance for a single student
 */
export const markAttendance = async (
  sessionId: string,
  studentId: string,
  dto: MarkAttendanceDto
): Promise<BaseResponse<any>> => {
  const { data } = await api.post<BaseResponse<any>>(
    `/private/v1/sessions/${sessionId}/attendance/${studentId}`,
    dto
  )
  return data
}

/**
 * Bulk mark attendance
 */
export const bulkMarkAttendance = async (
  sessionId: string,
  dto: BulkAttendanceDto
): Promise<BaseResponse<any[]>> => {
  const { data } = await api.post<BaseResponse<any[]>>(
    `/private/v1/sessions/${sessionId}/attendance/bulk`,
    dto
  )
  return data
}

/**
 * Quick check-in
 */
export const quickCheckIn = async (
  sessionId: string,
  studentId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.post<BaseResponse<any>>(
    `/private/v1/sessions/${sessionId}/attendance/${studentId}/check-in`
  )
  return data
}

/**
 * Quick check-out
 */
export const quickCheckOut = async (
  sessionId: string,
  studentId: string
): Promise<BaseResponse<any>> => {
  const { data } = await api.put<BaseResponse<any>>(
    `/private/v1/sessions/${sessionId}/attendance/${studentId}/check-out`
  )
  return data
}

/**
 * Mark all unmarked students as absent
 */
export const markAllAbsent = async (
  sessionId: string
): Promise<
  BaseResponse<{
    markedCount: number
    students: Array<{ id: string; name: string }>
  }>
> => {
  const { data } = await api.post<
    BaseResponse<{
      markedCount: number
      students: Array<{ id: string; name: string }>
    }>
  >(`/private/v1/sessions/${sessionId}/attendance/mark-all-absent`)
  return data
}

/**
 * Delete attendance record
 */
export const deleteAttendance = async (
  sessionId: string,
  studentId: string
): Promise<BaseResponse<{ success: boolean; message: string }>> => {
  const { data } = await api.delete<
    BaseResponse<{ success: boolean; message: string }>
  >(`/private/v1/sessions/${sessionId}/attendance/${studentId}`)
  return data
}

/**
 * Get classroom sessions (for teacher to select session)
 */
export const getClassroomSessions = async (
  classroomId: string
): Promise<BaseResponse<ClassroomSession[]>> => {
  const { data } = await api.get<BaseResponse<ClassroomSession[]>>(
    `/private/v1/classrooms/${classroomId}/sessions`
  )
  return data
}
