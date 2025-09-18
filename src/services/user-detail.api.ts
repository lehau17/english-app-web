import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type { User } from '../types/user.type'

export async function getStudentById(id: string) {
  const { data } = await api.get<BaseResponse<User>>(
    `/private/v1/students/${id}`
  )
  return data
}

export async function getTeacherById(id: string) {
  const { data } = await api.get<BaseResponse<User>>(
    `/private/v1/teachers/${id}`
  )
  return data
}
