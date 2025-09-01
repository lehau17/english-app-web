import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  ChevronRight,
  Clock,
  Coins,
  Edit3,
  Flame,
  Globe,
  Medal,
  Settings,
  Target,
  Trophy,
  User,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

/* =========================
   Types
   ========================= */

type TabId = 'overview' | 'achievements' | 'activity' | 'settings'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  joinDate: string // ISO date
  bio: string
  level: number
  xp: number
  xpToNextLevel: number
  totalXP: number
  streak: number
  longestStreak: number
  coins: number
  totalCoins: number
  lessonsCompleted: number
  hoursStudied: number
  wordsLearned: number
  accuracy: number // percentage 0..100
  location: string
  timezone: string
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string // emoji
  unlocked: boolean
  date?: string // dd/MM/yyyy khi unlocked
}

type WeekdayVN = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN'

interface WeeklyStat {
  day: WeekdayVN
  xp: number
  completed: boolean
}

type ActivityType = 'lesson' | 'achievement' | 'streak'

interface ActivityItem {
  id: number
  type: ActivityType
  title: string
  xp: number
  time: string // e.g. "2 giờ trước"
}

type StatColor = 'blue' | 'green' | 'orange' | 'purple' | 'red'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  subtitle?: string
  color?: StatColor
}

interface ProgressRingProps {
  /** Tỉ lệ tiến độ trong [0..1] */
  value: number
  /** Kích thước svg (px) */
  size?: number
}

/* =========================
   Mock data (typed)
   ========================= */

const userProfile: UserProfile = {
  id: 'user123',
  name: 'Bé Ong',
  email: 'beong@example.com',
  avatar: '/api/placeholder/120/120',
  joinDate: '2024-01-15',
  bio: 'Học tiếng Anh mỗi ngày để trở thành phiên bản tốt hơn của chính mình! 🌟',
  level: 5,
  xp: 750,
  xpToNextLevel: 1000,
  totalXP: 4250,
  streak: 12,
  longestStreak: 25,
  coins: 250,
  totalCoins: 1450,
  lessonsCompleted: 45,
  hoursStudied: 38.5,
  wordsLearned: 342,
  accuracy: 87,
  location: 'Việt Nam',
  timezone: 'Asia/Ho_Chi_Minh',
}

const achievements: Achievement[] = [
  {
    id: 1,
    title: 'Người mới bắt đầu',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🎯',
    unlocked: true,
    date: '15/01/2024',
  },
  {
    id: 2,
    title: 'Chuỗi 7 ngày',
    description: 'Học liên tiếp 7 ngày',
    icon: '🔥',
    unlocked: true,
    date: '22/01/2024',
  },
  {
    id: 3,
    title: 'Thạc sĩ từ vựng',
    description: 'Học 100 từ vựng mới',
    icon: '📚',
    unlocked: true,
    date: '05/02/2024',
  },
  {
    id: 4,
    title: 'Siêu tốc độ',
    description: 'Hoàn thành 5 bài trong 1 ngày',
    icon: '⚡',
    unlocked: true,
    date: '12/02/2024',
  },
  {
    id: 5,
    title: 'Chính xác tuyệt đối',
    description: 'Đạt 100% chính xác 3 bài liên tiếp',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 6,
    title: 'Chuỗi 30 ngày',
    description: 'Học liên tiếp 30 ngày',
    icon: '🏆',
    unlocked: false,
  },
]

const weeklyStats: WeeklyStat[] = [
  { day: 'T2', xp: 120, completed: true },
  { day: 'T3', xp: 85, completed: true },
  { day: 'T4', xp: 0, completed: false },
  { day: 'T5', xp: 150, completed: true },
  { day: 'T6', xp: 95, completed: true },
  { day: 'T7', xp: 110, completed: true },
  { day: 'CN', xp: 75, completed: true },
]

const recentActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'lesson',
    title: 'Hoàn thành: Màu sắc quanh ta',
    xp: 45,
    time: '2 giờ trước',
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Đạt thành tựu: Siêu tốc độ',
    xp: 50,
    time: '1 ngày trước',
  },
  {
    id: 3,
    type: 'streak',
    title: 'Chuỗi học tập: 12 ngày',
    xp: 0,
    time: '1 ngày trước',
  },
  {
    id: 4,
    type: 'lesson',
    title: 'Hoàn thành: Động vật trong nông trại',
    xp: 40,
    time: '2 ngày trước',
  },
]

/* =========================
   Components (typed)
   ========================= */

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = 'blue',
}: StatCardProps) {
  const colorClasses: Record<StatColor, string> = {
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-700 border-blue-200/50',
    green:
      'from-green-500/10 to-green-600/5 text-green-700 border-green-200/50',
    orange:
      'from-orange-500/10 to-orange-600/5 text-orange-700 border-orange-200/50',
    purple:
      'from-purple-500/10 to-purple-600/5 text-purple-700 border-purple-200/50',
    red: 'from-red-500/10 to-red-600/5 text-red-700 border-red-200/50',
  }

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 ${colorClasses[color]}`}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/80 p-2 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm opacity-75">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ value, size = 80 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const dash = clamped * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        className="text-blue-500 transition-all duration-500"
      />
    </svg>
  )
}

/* =========================
   Page
   ========================= */

export default function ProfilePage() {
  const [, setIsEditing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const xpProgress: number =
    userProfile.xpToNextLevel > 0
      ? userProfile.xp / userProfile.xpToNextLevel
      : 0

  const maxWeeklyXP: number =
    weeklyStats.length > 0 ? Math.max(...weeklyStats.map((s) => s.xp)) : 0

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
                src={userProfile.avatar}
                alt={userProfile.name}
                className="h-full w-full object-cover"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-2 text-gray-700 shadow-lg hover:bg-gray-50">
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col items-center gap-2 md:flex-row md:items-start">
              <h1 className="text-3xl font-bold">{userProfile.name}</h1>
              <button
                onClick={() => setIsEditing((v) => !v)}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 opacity-90">{userProfile.email}</p>
            <p className="mt-2 max-w-md text-sm opacity-75">
              {userProfile.bio}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Calendar className="h-4 w-4" />
                Tham gia từ{' '}
                {new Date(userProfile.joinDate).toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                <Globe className="h-4 w-4" />
                {userProfile.location}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <ProgressRing value={xpProgress} />
              <p className="mt-2 text-sm opacity-90">
                Cấp độ {userProfile.level}
              </p>
              <p className="text-xs opacity-75">
                {userProfile.xp}/{userProfile.xpToNextLevel} XP
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={Flame}
          label="Chuỗi hiện tại"
          value={userProfile.streak}
          subtitle={`Tốt nhất: ${userProfile.longestStreak}`}
          color="orange"
        />
        <StatCard
          icon={Coins}
          label="Xu hiện tại"
          value={userProfile.coins}
          subtitle={`Tổng: ${userProfile.totalCoins}`}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Bài đã học"
          value={userProfile.lessonsCompleted}
          subtitle={`${userProfile.hoursStudied}h học`}
          color="green"
        />
        <StatCard
          icon={Target}
          label="Độ chính xác"
          value={`${userProfile.accuracy}%`}
          subtitle={`${userProfile.wordsLearned} từ`}
          color="purple"
        />
      </section>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
        {(
          [
            { id: 'overview', label: 'Tổng quan', icon: User },
            { id: 'achievements', label: 'Thành tựu', icon: Trophy },
            { id: 'activity', label: 'Hoạt động', icon: Clock },
            { id: 'settings', label: 'Cài đặt', icon: Settings },
          ] as Array<{ id: TabId; label: string; icon: LucideIcon }>
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
            <>
              {/* Weekly Progress */}
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h3 className="mb-4 text-lg font-semibold">Tiến độ tuần này</h3>
                <div className="flex items-end justify-between gap-2">
                  {weeklyStats.map((stat, idx) => {
                    const heightPx =
                      maxWeeklyXP > 0
                        ? Math.max(8, (stat.xp / maxWeeklyXP) * 100)
                        : 8
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-8 rounded-t-lg transition-all ${
                            stat.completed ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                          style={{ height: `${heightPx}px` }}
                        />
                        <span className="text-xs text-gray-600">
                          {stat.day}
                        </span>
                        <span className="text-xs font-medium">{stat.xp}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Learning Streak */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-6 ring-1 ring-orange-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-orange-900">
                      Chuỗi học tập
                    </h3>
                    <p className="text-orange-800/75">
                      Bạn đã học liên tiếp {userProfile.streak} ngày!
                    </p>
                  </div>
                  <div className="text-orange-600">
                    <Flame className="h-8 w-8" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-orange-200">
                      <div
                        className="h-full rounded-full bg-orange-500"
                        style={{
                          width: `${
                            (userProfile.streak / userProfile.longestStreak) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-orange-800">
                    {userProfile.longestStreak - userProfile.streak} ngày nữa để
                    phá kỷ lục!
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thành tựu của bạn</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-2xl border p-4 transition ${
                      achievement.unlocked
                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                        : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`text-2xl ${!achievement.unlocked ? 'grayscale' : ''}`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            achievement.unlocked
                              ? 'text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            achievement.unlocked
                              ? 'text-gray-700'
                              : 'text-gray-400'
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.date && (
                          <p className="mt-1 text-xs text-green-600">
                            Đạt được ngày {achievement.date}
                          </p>
                        )}
                      </div>
                      {achievement.unlocked && (
                        <Medal className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          activity.type === 'lesson'
                            ? 'bg-blue-100 text-blue-600'
                            : activity.type === 'achievement'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {activity.type === 'lesson' ? (
                          <BookOpen className="h-4 w-4" />
                        ) : activity.type === 'achievement' ? (
                          <Award className="h-4 w-4" />
                        ) : (
                          <Flame className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    {activity.xp > 0 && (
                      <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                        <Zap className="h-4 w-4" />+{activity.xp}
                      </div>
                    )}
                  </div>
                ))}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 text-base font-semibold">Thống kê tổng quan</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng XP</span>
                <span className="font-semibold">
                  {userProfile.totalXP.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Từ đã học</span>
                <span className="font-semibold">
                  {userProfile.wordsLearned}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Giờ học</span>
                <span className="font-semibold">
                  {userProfile.hoursStudied}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cấp độ</span>
                <span className="font-semibold">{userProfile.level}</span>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 text-base font-semibold">Thành tựu gần đây</h3>
            <div className="space-y-3">
              {achievements
                .filter((a) => a.unlocked)
                .slice(0, 3)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-lg bg-green-50 p-3"
                  >
                    <span className="text-xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-green-600">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
