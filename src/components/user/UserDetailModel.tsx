// Enhanced User Type Definition

import type { User } from '../../types/user.type'

// Enhanced Modal Props
interface UserDetailModalProps {
  open: boolean
  onClose: () => void
  user: User | null | undefined
  title: string
  loading?: boolean
}

function UserDetailModal({
  open,
  onClose,
  user,
  title,
  loading = false,
}: UserDetailModalProps) {
  if (!open) return null

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return '—'
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const getDisplayName = (user: User) => {
    if (user.displayName) return user.displayName
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    return name || 'Chưa có tên'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                Đang tải thông tin...
              </div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={getDisplayName(user)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xl font-semibold">
                        {getDisplayName(user).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {getDisplayName(user)}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {user.email || 'Chưa có email'}
                  </p>
                  {user.status && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {user.status === 'active'
                        ? 'Hoạt động'
                        : user.status === 'inactive'
                          ? 'Không hoạt động'
                          : user.status === 'suspended'
                            ? 'Tạm khóa'
                            : 'Chờ duyệt'}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-1">
                    Giới thiệu
                  </h5>
                  <p className="text-sm text-gray-900">{user.bio}</p>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Thông tin cá nhân
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Giới tính"
                    value={
                      user.gender === 'male'
                        ? 'Nam'
                        : user.gender === 'female'
                          ? 'Nữ'
                          : user.gender === 'other'
                            ? 'Khác'
                            : user.gender === 'prefer_not_to_say'
                              ? 'Không muốn tiết lộ'
                              : '—'
                    }
                  />
                  <InfoItem label="Quốc tịch" value={user.nationality || '—'} />
                  <InfoItem
                    label="Ngôn ngữ"
                    value={user.nativeLanguage || '—'}
                  />
                </div>
              </div>

              {/* System Information */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Hệ thống
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Vai trò"
                    value={
                      user.role === 'admin'
                        ? 'Quản trị viên'
                        : user.role === 'moderator'
                          ? 'Người kiểm duyệt'
                          : 'Người dùng'
                    }
                  />
                  <InfoItem label="Múi giờ" value={user.timezone || '—'} />
                  <InfoItem
                    label="Đăng nhập cuối"
                    value={formatDate(user.lastLoginAt)}
                  />
                  <InfoItem
                    label="Hoạt động cuối"
                    value={formatDate(user.lastActiveAt)}
                  />
                </div>
              </div>

              {/* Security Status */}
              {/* <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Bảo mật
                </h5>
                <div className="flex flex-wrap gap-2">
                  <SecurityBadge
                    label="Email"
                    verified={user.emailVerified}
                  />
                  <SecurityBadge
                    label="Số điện thoại"
                    verified={user.phoneVerified}
                  />
                  <SecurityBadge
                    label="Xác thực 2 bước"
                    verified={user.twoFactorEnabled}
                  />
                </div>
              </div> */}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              Không tìm thấy thông tin người dùng
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

function SecurityBadge({
  label,
  verified,
}: {
  label: string
  verified?: boolean
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          verified ? 'bg-green-600' : 'bg-gray-400'
        }`}
      ></div>
      {label}
    </div>
  )
}

export default UserDetailModal
