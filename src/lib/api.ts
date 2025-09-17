// api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
})

let isRedirecting401 = false

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Bỏ qua nếu request bị cancel hoặc lỗi mạng không có response
    if (axios.isCancel?.(error) || !error?.response) {
      return Promise.reject(error)
    }

    const status = error.response.status as number
    if (status === 401 && !isRedirecting401) {
      const url = (error.config?.url || '').toString()

      const onLoginPage =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/login')
      const isAuthApi = url.includes('/auth/') // ví dụ: /auth/login, /auth/refresh

      if (!onLoginPage && !isAuthApi) {
        isRedirecting401 = true

        // Tuỳ bạn: clear local storage/session storage nếu có lưu token
        // localStorage.removeItem('access_token');

        const next =
          typeof window !== 'undefined'
            ? encodeURIComponent(
                window.location.pathname + window.location.search
              )
            : ''

        // Dùng assign để hard redirect (reset toàn bộ state)
        if (typeof window !== 'undefined') {
          window.location.assign(`/login${next ? `?next=${next}` : ''}`)
        }
      }
    }

    return Promise.reject(error)
  }
)

export default api
