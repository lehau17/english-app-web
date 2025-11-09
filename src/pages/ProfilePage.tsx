import {
  Calendar,
  ChevronRight,
  CreditCard,
  Edit,
  Globe,
  ListMusic,
  Settings,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PlaylistGrid from '../components/playlist/PlaylistGrid'
import AvatarUpload from '../components/profile/AvatarUpload'
import ChangePasswordModal from '../components/profile/ChangePasswordModal'
import EditProfileModal from '../components/profile/EditProfileModal'
import LanguageSettingsModal from '../components/profile/LanguageSettingsModal'
import LearningStatsCard from '../components/profile/LearningStatsCard'
import NotificationSettingsModal from '../components/profile/NotificationSettingsModal'
import PrivacySettingsModal from '../components/profile/PrivacySettingsModal'
import ProfilePageSkeleton from '../components/profile/ProfilePageSkeleton'
import RecentActivityCard from '../components/profile/RecentActivityCard'
import TransactionHistoryCard from '../components/profile/TransactionHistoryCard'
import { useAuth } from '../context/AuthContext'
import { useUserPlaylists } from '../hooks/playlist.hooks'
import { changePasswordApi, updateProfileApi } from '../services/auth.api'
import { playlistApi } from '../services/playlist.api'
import { uploadFile } from '../services/upload.api'
import type { User as UserType } from '../types/user.type'
import {
  handleApiError,
  retryWithBackoff,
  validateFileUpload,
} from '../utils/errorHandling'

type TabId = 'overview' | 'playlists' | 'settings' | 'transactions'

interface UserProfile {
  id: string
  name: string
  email?: string
  avatar?: string
  joinDate?: string
  bio?: string
  location?: string
  timezone?: string
}

const fallbackProfile: UserProfile = {
  id: 'user',
  name: 'Người dùng',
  email: '',
  avatar: '',
  joinDate: '',
  bio: '',
  location: '',
  timezone: '',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const { user, setUser } = useAuth()

  // Playlist hooks
  const {
    playlists,
    loading: playlistsLoading,
    addPlaylist,
    updatePlaylist,
    removePlaylist,
  } = useUserPlaylists({ limit: 6 }) // Limit to 6 for profile display

  const handleProfileUpdate = async (data: Partial<UserType>) => {
    if (!user?.id) return

    try {
      console.log('Updating profile with:', data)

      // Retry profile update with exponential backoff
      const updatedUser = await retryWithBackoff(() =>
        updateProfileApi(user.id, data)
      )

      // Update local state
      setUser({ ...user, ...updatedUser })
      toast.success('Cập nhật thông tin thành công!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = handleApiError(
        error,
        'Có lỗi xảy ra khi cập nhật thông tin'
      )
      toast.error(errorMessage)
      throw error // Re-throw để EditProfileModal có thể handle
    }
  }

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      await retryWithBackoff(() =>
        changePasswordApi({ currentPassword, newPassword })
      )
      toast.success('Đổi mật khẩu thành công!')
    } catch (error: any) {
      console.error('Error changing password:', error)
      const errorMessage = handleApiError(
        error,
        'Có lỗi xảy ra khi đổi mật khẩu'
      )
      toast.error(errorMessage)
      throw error // Re-throw để ChangePasswordModal có thể handle
    }
  }

  const handleEditClick = () => {
    setIsEditModalOpen(true)
  }

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true)
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return

    // Validate file before upload
    const validation = validateFileUpload(file)
    if (!validation.isValid) {
      toast.error(validation.error || 'File không hợp lệ')
      return
    }

    setIsAvatarUploading(true)
    try {
      console.log('Uploading avatar:', file.name)

      // Upload file and get URL with retry
      const avatarUrl = await retryWithBackoff(() => uploadFile(file))

      // Update profile with new avatar URL
      const updatedUser = await retryWithBackoff(() =>
        updateProfileApi(user.id, { avatarUrl })
      )

      // Update local state
      setUser({ ...user, ...updatedUser })
      toast.success('Cập nhật ảnh đại diện thành công!')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      const errorMessage = handleApiError(
        error,
        'Có lỗi xảy ra khi tải ảnh lên'
      )
      toast.error(errorMessage)
    } finally {
      setIsAvatarUploading(false)
    }
  }

  // Playlist handlers
  const handlePlaylistDelete = async (playlistId: string) => {
    try {
      await playlistApi.delete(playlistId)
      removePlaylist(playlistId)
    } catch (error) {
      // Error already handled by API
    }
  }

  const profile: UserProfile = useMemo(() => {
    const u = user
    return {
      id: u?.id || fallbackProfile.id,
      name:
        u?.displayName ||
        `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() ||
        fallbackProfile.name,
      email: u?.email || fallbackProfile.email,
      avatar: u?.avatarUrl || fallbackProfile.avatar,
      joinDate:
        (u?.createdAt
          ? new Date(u.createdAt).toISOString()
          : fallbackProfile.joinDate) || '',
      bio: u?.bio || '',
      location: u?.nationality || '',
      timezone: u?.timezone || '',
    }
  }, [user])

  // Learning stats - TODO: Fetch from API when available
  const learningStats = useMemo(
    () => ({
      completedLessons: 0,
      totalLessons: 0,
      studyStreak: 0,
      hoursThisWeek: 0,
      averageScore: 0,
      certificatesEarned: 0,
    }),
    []
  )

  // Recent activities - TODO: Fetch from API when available
  const recentActivities = useMemo(() => [], [])

  // Show loading skeleton while user data is loading
  if (!user) {
    return <ProfilePageSkeleton />
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <AvatarUpload
            avatar={profile.avatar || ''}
            name={profile.name}
            onUpload={handleAvatarUpload}
            loading={isAvatarUploading}
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="mt-1 opacity-90">{profile.email}</p>
            <p className="mt-2 max-w-md text-sm opacity-75">
              {profile.bio || 'Chưa có mô tả.'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Calendar className="h-4 w-4" />
                Tham gia từ{' '}
                {profile.joinDate
                  ? new Date(profile.joinDate).toLocaleDateString('vi-VN')
                  : '—'}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Globe className="h-4 w-4" />
                {profile.location || '—'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1 overflow-x-auto">
        {(
          [
            { id: 'overview', label: 'Tổng quan', icon: User },
            { id: 'playlists', label: 'Playlist', icon: ListMusic },
            ...(user?.role === 'parent'
              ? [
                  {
                    id: 'transactions' as TabId,
                    label: 'Giao dịch',
                    icon: CreditCard,
                  },
                ]
              : []),
            { id: 'settings', label: 'Cài đặt', icon: Settings },
          ] as Array<{ id: TabId; label: string; icon: any }>
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Learning Stats */}
            <LearningStatsCard stats={learningStats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information */}
              <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Thông tin cá nhân
                  </h3>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Họ và tên</p>
                    <p className="font-medium text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {profile.email || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quốc gia</p>
                    <p className="font-medium text-gray-900">
                      {profile.location || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Múi giờ</p>
                    <p className="font-medium text-gray-900">
                      {profile.timezone || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Giới thiệu</p>
                    <p className="font-medium text-gray-900">
                      {profile.bio || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
                  <button
                    onClick={() => navigate('/listening-practice/my-history')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem lịch sử học tập
                  </button>
                </div>
                <RecentActivityCard activities={recentActivities} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Playlist của tôi</h3>
                <p className="text-sm text-gray-600">
                  Quản lý và tổ chức podcast yêu thích
                </p>
              </div>
              {playlists.length > 6 && (
                <a
                  href="/playlists"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xem tất cả ({playlists.length})
                </a>
              )}
            </div>

            <PlaylistGrid
              playlists={playlists.slice(0, 6)} // Show only first 6
              loading={playlistsLoading}
              onPlaylistCreate={addPlaylist}
              onPlaylistUpdate={updatePlaylist}
              onPlaylistDelete={handlePlaylistDelete}
              showOwner={false}
              emptyMessage="Bạn chưa có playlist nào"
              className="lg:grid-cols-2" // Override to show 2 columns max
            />
          </div>
        )}

        {activeTab === 'transactions' && user?.role === 'parent' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
              <p className="text-sm text-gray-600">
                Theo dõi các giao dịch thanh toán của bạn
              </p>
            </div>
            <TransactionHistoryCard limit={20} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cài đặt tài khoản</h3>
            <div className="space-y-3">
              {(
                [
                  {
                    title: 'Thông tin cá nhân',
                    desc: 'Cập nhật tên, email và ảnh đại diện',
                    onClick: handleEditClick,
                  },
                  {
                    title: 'Thông báo',
                    desc: 'Quản lý thông báo học tập và nhắc nhở',
                    onClick: () => setIsNotificationModalOpen(true),
                  },
                  {
                    title: 'Quyền riêng tư',
                    desc: 'Điều khiển ai có thể xem hồ sơ của bạn',
                    onClick: () => setIsPrivacyModalOpen(true),
                  },
                  {
                    title: 'Ngôn ngữ',
                    desc: 'Thay đổi ngôn ngữ giao diện',
                    onClick: () => setIsLanguageModalOpen(true),
                  },
                  {
                    title: 'Bảo mật',
                    desc: 'Thay đổi mật khẩu và cài đặt bảo mật',
                    onClick: handleChangePasswordClick,
                  },
                ] as Array<{ title: string; desc: string; onClick: () => void }>
              ).map((setting, idx) => (
                <button
                  key={idx}
                  onClick={setting.onClick}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {setting.title}
                    </h4>
                    <p className="text-sm text-gray-500">{setting.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileUpdate}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSave={handleChangePassword}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      {/* Language Settings Modal */}
      <LanguageSettingsModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  )
}
