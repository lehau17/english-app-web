import {
  BookOpen,
  Clock,
  Gift,
  Settings,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ParentPaymentSection } from '../components/parent'
import { useAuth } from '../context/AuthContext'
import { useParentDashboardQuery } from '../hooks/parent.queries'

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = Math.max(0, Math.min(1, value)) * circumference
  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="8"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        className="text-green-500 transition-all"
        transform="rotate(-90 36 36)"
      />
    </svg>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/60 px-2 py-0.5 text-xs text-gray-600 backdrop-blur">
      {children}
    </span>
  )
}

// -----------------------------
// Parent Home Page
// -----------------------------
export default function ParentHomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardData, isLoading } = useParentDashboardQuery()

  const displayName = user?.displayName || user?.firstName || 'Phụ huynh'

  // Fallback to mock data if API fails
  const children = dashboardData?.children || []
  const rewards = dashboardData?.rewards || []
  const notifications = dashboardData?.notifications || []
  const totalStudyTime = dashboardData?.totalStudyTime || 0
  const completionRate = dashboardData?.completionRate || 0

  const totalChildren = children.length
  const totalCompleted = children.reduce(
    (sum, child) => sum + child.completedActivities,
    0
  )
  const totalActivities = children.reduce(
    (sum, child) => sum + child.totalActivities,
    0
  )
  const unreadNotifications = notifications.filter((n) => !n.readAt).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // When API fails, continue with empty arrays (fallback mock data)
  // Error is already handled by React Query, we just use empty defaults

  return (
    <div className="space-y-6">
      {/* Hero / Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-6 text-white shadow-md">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm opacity-90">Chào mừng trở lại</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
              {displayName}, theo dõi con yêu của bạn!
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill>
                <Users className="h-4 w-4" /> {totalChildren} con
              </Pill>
              <Pill>
                <Clock className="h-4 w-4" /> {totalStudyTime} phút hôm nay
              </Pill>
              <Pill>
                <Trophy className="h-4 w-4" /> {totalCompleted}/
                {totalActivities} bài hoàn thành
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
            <div className="text-center">
              <ProgressRing value={completionRate / 100} />
            </div>
            <div>
              <p className="text-sm/5 opacity-90">Tỷ lệ hoàn thành</p>
              <p className="text-lg font-semibold">
                {Math.round(completionRate)}%
              </p>
              <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white/80"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <ParentPaymentSection />

      {/* Main Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Children Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Tiến độ học tập của con
              </h2>
              <Link
                to="/parent/children"
                className="text-sm font-medium text-green-600 hover:underline"
              >
                Quản lý con cái
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0 flex items-center justify-center">
                        {child.avatar &&
                        (child.avatar.startsWith('http') ||
                          child.avatar.startsWith('/')) ? (
                          <img
                            src={child.avatar}
                            alt={child.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=6366f1&color=fff&size=48`
                            }}
                          />
                        ) : (
                          <span className="text-2xl">
                            {child.avatar || '👦'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {child.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Level {child.level}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{child.todayStudyTime} phút</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-green-500" />
                        <span>{child.completedActivities} bài</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {child.completedActivities}/{child.totalActivities} bài
                        hoàn thành
                      </span>
                      <span className="text-xs text-gray-400">
                        {child.lastActive}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 italic">
                      "{child.recentActivity}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <button
              onClick={() => navigate('/parent-schedule')}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 text-center transition hover:shadow-md"
            >
              <Clock className="h-8 w-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                Lịch học
              </span>
            </button>

            <button
              onClick={() => navigate('/parent/rewards')}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center transition hover:shadow-md"
            >
              <Gift className="h-8 w-8 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">
                Phần thưởng
              </span>
            </button>

            <button
              onClick={() => navigate('/parent/settings')}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center transition hover:shadow-md"
            >
              <Settings className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Cài đặt</span>
            </button>

            <button
              onClick={() => navigate('/parent-reports')}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center transition hover:shadow-md"
            >
              <TrendingUp className="h-8 w-8 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Báo cáo</span>
            </button>

            <button
              onClick={() => navigate('/parent/activities')}
              className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 p-4 text-center transition hover:shadow-md"
            >
              <BookOpen className="h-8 w-8 text-orange-600" />
              <span className="text-sm font-medium text-gray-900">
                Hoạt động
              </span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Custom Rewards */}
          <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Phần thưởng đã tạo
              </h3>
              <Link
                to="/parent/rewards"
                className="text-sm font-medium text-purple-600 hover:underline"
              >
                Quản lý
              </Link>
            </div>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-700">
                      {reward.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{reward.type}</span>
                    {reward.isActive && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Hoạt động
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Thông báo
                {unreadNotifications > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
              </h3>
              <Link
                to="/parent/notifications"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border p-3 ${
                    notification.readAt
                      ? 'border-black/5 bg-gray-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        notification.readAt ? 'bg-gray-400' : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.type}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Study Time Settings */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 shadow-sm ring-1 ring-indigo-200">
            <div className="mb-2 flex items-center gap-2 text-indigo-700">
              <Clock className="h-5 w-5" />
              <h3 className="text-base font-semibold">
                Giới hạn thời gian học
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-indigo-800">Hôm nay</span>
                <span className="text-sm font-medium text-indigo-900">
                  {totalStudyTime}/60 phút
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-indigo-200">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{
                    width: `${Math.min((totalStudyTime / 60) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-indigo-700">
                Còn {Math.max(0, 60 - totalStudyTime)} phút học tập
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
