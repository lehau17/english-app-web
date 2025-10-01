import { useQuery } from '@tanstack/react-query'
import { parentApi } from '../services/parent.api'

export interface ParentUnpaidClassroom {
  id: string
  name: string
  classCode: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  periodStart: string
  periodEnd: string
  child: {
    id: string
    firstName: string
    lastName: string
    displayName: string
    avatarUrl?: string
  }
  course: {
    id: string
    title: string
    price: number
    currency: string
  }
  teacher: {
    id: string
    firstName: string
    lastName: string
    displayName: string
    avatarUrl?: string
  }
  _count?: {
    students: number
    assignments: number
  }
}

// Hook to get unpaid classrooms for parent
export const useParentUnpaidClassrooms = () => {
  return useQuery({
    queryKey: ['parent', 'unpaid-classrooms'],
    queryFn: async (): Promise<ParentUnpaidClassroom[]> => {
      try {
        const response = await parentApi.getUnpaidClassrooms()
        return response.data || []
      } catch (error) {
        console.error('Failed to fetch unpaid classrooms:', error)
        return []
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook to get children payment summary
export const useParentPaymentSummary = () => {
  return useQuery({
    queryKey: ['parent', 'payment-summary'],
    queryFn: async () => {
      try {
        const response = await parentApi.getPaymentSummary()
        return response.data
      } catch (error) {
        console.error('Failed to fetch payment summary:', error)
        return {
          totalUnpaid: 0,
          totalAmount: 0,
          urgentPayments: 0,
          children: [],
        }
      }
    },
  })
}
