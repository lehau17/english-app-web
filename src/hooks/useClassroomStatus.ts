import { useQuery } from '@tanstack/react-query'
import { fetchMyClassrooms } from '../services/home.api'

export type ClassroomStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export interface ClassroomWithStatus {
  id: string
  name: string
  description?: string
  classCode: string
  status: ClassroomStatus
  maxStudents?: number
  isActive: boolean
  periodStart: string
  periodEnd: string
  teacher?: {
    id: string
    firstName: string
    lastName: string
    displayName: string
    avatarUrl?: string
  }
  course?: {
    id: string
    title: string
    price?: number
    currency?: string
  }
  students?: Array<{
    studentId: string
    isPurchased: boolean
    isActive: boolean
    student?: {
      id: string
      firstName: string
      lastName: string
      displayName: string
      avatarUrl?: string
    }
  }>
  _count?: {
    students: number
    assignments: number
  }
  // Payment info for student
  needsPayment?: boolean
  isPurchased?: boolean
  hasAccess?: boolean
}

export interface ClassroomsByStatus {
  upcoming: ClassroomWithStatus[]
  ongoing: ClassroomWithStatus[]
  completed: ClassroomWithStatus[]
  unpaid: ClassroomWithStatus[]
}

// Hook to get all classrooms
export const useMyClassroomsWithStatus = (role?: string, enabled = true) => {
  return useQuery({
    queryKey: ['my-classrooms-with-status', role],
    queryFn: () => fetchMyClassrooms(),
    enabled,
    select: (res): ClassroomWithStatus[] => {
      if (!res?.data) return []

      // Transform MyClassroomResponse to ClassroomWithStatus
      return res.data.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        description: undefined,
        classCode: classroom.classCode || '',
        status: 'ongoing' as ClassroomStatus, // Default status - API should provide this
        maxStudents: classroom.maxStudents,
        isActive: true, // Default - API should provide this
        periodStart: new Date().toISOString(), // Default - API should provide this
        periodEnd: new Date().toISOString(), // Default - API should provide this
        teacher: classroom.teacher
          ? {
              id: '', // Not provided in MyClassroomResponse
              firstName: '',
              lastName: '',
              displayName: classroom.teacher.displayName,
              avatarUrl: undefined,
            }
          : undefined,
        _count: classroom._count,
      }))
    },
  })
}

// Hook to get classrooms by specific status
export const useMyClassroomsByStatus = (
  status: ClassroomStatus,
  role?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['my-classrooms', role, status],
    queryFn: () => fetchMyClassrooms({ status }),
    enabled,
    select: (res): ClassroomWithStatus[] => {
      if (!res?.data) return []

      // Transform MyClassroomResponse to ClassroomWithStatus
      return res.data.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
        description: undefined,
        classCode: classroom.classCode || '',
        status: status, // Use the requested status
        maxStudents: classroom.maxStudents,
        isActive: true, // Default - API should provide this
        periodStart: new Date().toISOString(), // Default - API should provide this
        periodEnd: new Date().toISOString(), // Default - API should provide this
        teacher: classroom.teacher
          ? {
              id: '', // Not provided in MyClassroomResponse
              firstName: '',
              lastName: '',
              displayName: classroom.teacher.displayName,
              avatarUrl: undefined,
            }
          : undefined,
        _count: classroom._count,
      }))
    },
  })
}

// Hook to get classrooms grouped by status
export const useClassroomsGroupedByStatus = (role?: string, enabled = true) => {
  const { data: allClassrooms, ...rest } = useMyClassroomsWithStatus(
    role,
    enabled
  )

  const groupedClassrooms: ClassroomsByStatus = {
    upcoming: [],
    ongoing: [],
    completed: [],
    unpaid: [],
  }

  if (allClassrooms) {
    allClassrooms.forEach((classroom) => {
      // Check payment status first (for students)
      if (role === 'student') {
        const needsPayment =
          classroom.course?.price && classroom.course.price > 0
        const isPurchased = classroom.students?.[0]?.isPurchased || false

        if (needsPayment && !isPurchased) {
          groupedClassrooms.unpaid.push({
            ...classroom,
            needsPayment: true,
            isPurchased: false,
            hasAccess: false,
          })
          return
        }
      }

      // Group by classroom status
      const status = classroom.status || 'upcoming'
      if (status in groupedClassrooms) {
        groupedClassrooms[status as keyof ClassroomsByStatus].push({
          ...classroom,
          needsPayment: classroom.course?.price
            ? classroom.course.price > 0
            : false,
          isPurchased: classroom.students?.[0]?.isPurchased || false,
          hasAccess:
            !classroom.course?.price ||
            classroom.course.price <= 0 ||
            classroom.students?.[0]?.isPurchased ||
            false,
        })
      }
    })
  }

  return {
    ...rest,
    data: allClassrooms,
    groupedData: groupedClassrooms,
    counts: {
      upcoming: groupedClassrooms.upcoming.length,
      ongoing: groupedClassrooms.ongoing.length,
      completed: groupedClassrooms.completed.length,
      unpaid: groupedClassrooms.unpaid.length,
      total: allClassrooms?.length || 0,
    },
  }
}

// Helper function to get status display info
export const getStatusDisplayInfo = (status: ClassroomStatus) => {
  const statusMap = {
    upcoming: {
      label: 'Sắp diễn ra',
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
    },
    ongoing: {
      label: 'Đang diễn ra',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    completed: {
      label: 'Đã hoàn thành',
      color: 'gray',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
    cancelled: {
      label: 'Đã hủy',
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  }

  return statusMap[status] || statusMap.upcoming
}

// Helper function to get payment status display info
export const getPaymentStatusDisplayInfo = (
  needsPayment: boolean,
  isPurchased: boolean
) => {
  if (!needsPayment) {
    return {
      label: 'Miễn phí',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    }
  }

  if (isPurchased) {
    return {
      label: 'Đã thanh toán',
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    }
  }

  return {
    label: 'Chưa thanh toán',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  }
}
