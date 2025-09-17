import axiosInstance from '../config/axiosConfig'

export const getClassroomDetail = async (id: string) => {
  const response = await axiosInstance.get(
    `/private/v1/classrooms/${id}/detail`
  )
  return response.data
}
