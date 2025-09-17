export type User = {
  id: string
  email?: string
  phone?: string
  passwordHash?: string
  role?: string
  status?: string
  provider?: string
  providerId?: string

  // Thông tin cá nhân chi tiết
  firstName?: string
  lastName?: string
  displayName?: string
  gender?: string
  dob?: Date
  nationality?: string
  nativeLanguage?: string
  avatarUrl?: string
  bio?: string

  // Cài đặt hệ thống
  language?: string
  timezone?: string

  // Thông tin xác thực
  lastLoginAt?: Date
  lastActiveAt?: Date
  emailVerified?: boolean
  phoneVerified?: boolean
  twoFactorEnabled?: boolean

  // Cài đặt và tùy chọn
  preferences?: any
  privacySettings?: any
  notificationSettings?: any
  parentalConsent?: boolean

  // Metadata
  profileCompleteness?: number
  isOnline?: boolean
  createdAt?: Date
  updatedAt?: Date
}
