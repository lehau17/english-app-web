import { useQuery } from '@tanstack/react-query'
import { fetchStudentDashboard } from '../services/home.api'

export const useStudentDashboard = (enabled = true) => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: fetchStudentDashboard,
    enabled,
    select: (res) => res?.data ?? null,
  })
}
