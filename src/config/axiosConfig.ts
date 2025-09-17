import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api', // chỉnh lại nếu cần
  withCredentials: true,
})

export default axiosInstance
