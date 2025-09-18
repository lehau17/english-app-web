import {
  Calendar,
  Camera,
  ChevronRight,
  Globe,
  Settings,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

type TabId = 'overview' | 'settings'

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
  avatar: '/api/placeholder/120/120',
  joinDate: '',
  bio: '',
  location: '',
  timezone: '',
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const { user } = useAuth()

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

  return (
    <div className="min-h-screen space-y-6">
      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 md:flex-row">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 bg-white/10 md:h-32 md:w-32">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-2 text-gray-700 shadow-lg hover:bg-gray-50">
              <Camera className="h-4 w-4" />
            </button>
          </div>

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
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {(
          [
            { id: 'overview', label: 'Tổng quan', icon: User },
            { id: 'settings', label: 'Cài đặt', icon: Settings },
          ] as Array<{ id: TabId; label: string; icon: any }>
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="text-lg font-semibold mb-4">
                  Thông tin cá nhân
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Giới thiệu</p>
                    <p className="font-medium text-gray-900">
                      {profile.bio || '—'}
                    </p>
                  </div>
                </div>
              </div>
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
                    },
                    {
                      title: 'Thông báo',
                      desc: 'Quản lý thông báo học tập và nhắc nhở',
                    },
                    {
                      title: 'Quyền riêng tư',
                      desc: 'Điều khiển ai có thể xem hồ sơ của bạn',
                    },
                    { title: 'Ngôn ngữ', desc: 'Thay đổi ngôn ngữ giao diện' },
                    {
                      title: 'Bảo mật',
                      desc: 'Thay đổi mật khẩu và cài đặt bảo mật',
                    },
                  ] as Array<{ title: string; desc: string }>
                ).map((setting, idx) => (
                  <button
                    key={idx}
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

        {/* Sidebar removed */}
      </div>
    </div>
  )
}
