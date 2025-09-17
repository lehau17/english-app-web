import { useQuery } from '@tanstack/react-query'
import { fetchStudentDashboard } from '../services/home.api'

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: fetchStudentDashboard,
    select: (res) => res?.data || null,
  })
}
