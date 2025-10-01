// Error handling utilities for consistent error message extraction and handling

export interface ApiError {
  response?: {
    data?: {
      message?: string
      errors?: string[]
    }
    status?: number
  }
  message?: string
}

export const extractErrorMessage = (
  error: unknown,
  fallbackMessage = 'Đã có lỗi xảy ra'
): string => {
  if (!error) return fallbackMessage

  const apiError = error as ApiError

  // Try to extract message from API response
  if (apiError.response?.data?.message) {
    return apiError.response.data.message
  }

  // Try to extract from errors array
  if (apiError.response?.data?.errors?.length) {
    return apiError.response.data.errors[0]
  }

  // Try to extract from error message
  if (apiError.message) {
    return apiError.message
  }

  // Return fallback
  return fallbackMessage
}

export const getHttpStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Dữ liệu không hợp lệ'
    case 401:
      return 'Bạn cần đăng nhập lại'
    case 403:
      return 'Bạn không có quyền thực hiện hành động này'
    case 404:
      return 'Không tìm thấy dữ liệu'
    case 422:
      return 'Dữ liệu không hợp lệ'
    case 429:
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau'
    case 500:
      return 'Lỗi hệ thống. Vui lòng thử lại sau'
    case 503:
      return 'Dịch vụ tạm thời không khả dụng'
    default:
      return 'Đã có lỗi xảy ra'
  }
}

export const handleApiError = (
  error: unknown,
  fallbackMessage = 'Đã có lỗi xảy ra'
): string => {
  const apiError = error as ApiError

  // If we have status code, use that for more specific messaging
  if (apiError.response?.status) {
    const statusMessage = getHttpStatusMessage(apiError.response.status)
    const customMessage = extractErrorMessage(error, '')

    // Combine status message with custom message if available
    return customMessage ? `${statusMessage}: ${customMessage}` : statusMessage
  }

  // Fall back to basic message extraction
  return extractErrorMessage(error, fallbackMessage)
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateFileUpload = (
  file: File
): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]

  if (file.size > maxSize) {
    return { isValid: false, error: 'File quá lớn. Kích thước tối đa là 5MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error:
        'Định dạng file không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP',
    }
  }

  return { isValid: true }
}

// Retry mechanism
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 1) {
      throw error
    }

    const delay = baseDelay * (4 - retries) // Exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay))

    return retryWithBackoff(fn, retries - 1, baseDelay)
  }
}
