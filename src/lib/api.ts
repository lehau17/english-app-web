// api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
})

// Bỏ global 401 interceptor - để AuthContext xử lý refresh token logic
// AuthContext sẽ setup dynamic interceptor với refresh token flow
// Nếu refresh fail thì AuthContext sẽ logout và redirect

export default api
