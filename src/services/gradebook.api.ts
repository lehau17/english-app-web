import api from '../lib/api'

export interface StudentGrade {
  studentId: string
  studentName: string
  midterm?: number | null
  final?: number | null
  tests?: number | null
  activities?: number | null
  finalGrade: number
}

export interface ClassroomGradeItem {
  classroomId: string
  classroomName: string
  courseName: string
  midterm?: number | null
  final?: number | null
  tests?: number | null
  activities?: number | null
  finalGrade: number
}

export interface StudentTranscript {
  studentId: string
  studentName: string
  classrooms: ClassroomGradeItem[]
}

export const getStudentTranscript = async (
  studentId?: string
): Promise<StudentTranscript> => {
  const endpoint = studentId
    ? `/private/v1/gradebook/students/${studentId}/transcript`
    : `/private/v1/gradebook/students/me/transcript`
  const response = await api.get<{
    statusCode: number
    message: string
    data: StudentTranscript
  }>(endpoint)
  return response.data.data
}

export const exportStudentTranscript = async (
  studentId?: string
): Promise<Blob> => {
  const endpoint = studentId
    ? `/private/v1/gradebook/students/${studentId}/transcript/export`
    : `/private/v1/gradebook/students/me/transcript/export`
  const response = await api.get(endpoint, {
    responseType: 'blob',
  })
  return response.data
}

export interface AssignmentDetail {
  assignmentId: string
  title: string
  type: string
  totalPoints: number
  weight: number
  score: number | null
  maxScore: number
  submissionId: string | null
  submittedAt: string | null
  gradedAt: string | null
  feedback: string | null
  attemptCount: number
}

export interface ActivityDetail {
  activityId: string
  title: string
  type: string
  lessonTitle: string
  bestScore: number | null
  currentScore: number | null
  attemptsCount: number
  state: string
  timeSpentSec: number
}

export interface StudentGradeDetails {
  studentId: string
  studentName: string
  classroomId: string
  classroomName: string
  assignments: {
    midterm: AssignmentDetail[]
    final: AssignmentDetail[]
    tests: AssignmentDetail[]
  }
  activities: ActivityDetail[]
}

export const getStudentGradeDetails = async (
  studentId: string,
  classroomId: string
): Promise<StudentGradeDetails> => {
  const response = await api.get<{
    statusCode: number
    message: string
    data: StudentGradeDetails
  }>(
    `/private/v1/gradebook/students/${studentId}/classrooms/${classroomId}/details`
  )
  return response.data.data
}
