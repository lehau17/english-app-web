import { useQuery } from '@tanstack/react-query'
import { getStudentById, getTeacherById } from '../services/user-detail.api'

export const useStudentDetail = (id?: string) =>
  useQuery({
    queryKey: ['student-detail', id],
    enabled: !!id,
    queryFn: () => getStudentById(id as string),
    select: (res) => res?.data ?? null,
  })

export const useTeacherDetail = (id?: string) =>
  useQuery({
    queryKey: ['teacher-detail', id],
    enabled: !!id,
    queryFn: () => getTeacherById(id as string),
    select: (res) => res?.data ?? null,
  })
