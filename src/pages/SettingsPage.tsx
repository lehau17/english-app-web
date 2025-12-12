import React, { useState } from 'react'
import {
  Bell,
  Globe,
  Monitor,
  User,
  Lock,
  Mail,
  Phone,
  HelpCircle,
  MessageSquare,
  Star,
  FileText,
  Download,
  Trash2,
  ChevronRight,
  Settings,
  ArrowLeft,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ParentInvitationCard } from '../components/parent-invitation/ParentInvitationCard'
import { PendingInvitationsTable } from '../components/parent-invitation/PendingInvitationsTable'

interface SettingSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const SettingSwitch: React.FC<SettingSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
)

interface SettingItemProps {
  icon: React.ReactNode
  label: string
  description?: string
  onClick?: () => void
  rightElement?: React.ReactNode
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  onClick,
  rightElement,
}) => (
  <button
    onClick={onClick}
    className="flex items-center w-full py-3 text-left hover:bg-gray-50 rounded-lg px-3 -mx-3 transition-colors"
  >
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 mr-3">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    {rightElement || <ChevronRight className="h-4 w-4 text-gray-400" />}
  </button>
)

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()

  // Notification settings
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [lessonReminders, setLessonReminders] = useState(true)
  const [achievementNotifications, setAchievementNotifications] = useState(true)
  const [assignmentNotifications, setAssignmentNotifications] = useState(true)

  // Interface settings
  const [darkMode, setDarkMode] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [hapticFeedback, setHapticFeedback] = useState(true)

  // Learning settings
  const [dailyGoal] = useState(30)
  const [autoplay, setAutoplay] = useState(true)
  const [showHints, setShowHints] = useState(true)
  const [practiceReminders, setPracticeReminders] = useState(true)

  const settingSections = [
    {
      title: 'Thông báo',
      icon: <Bell className="h-5 w-5 text-blue-600" />,
      items: [
        {
          type: 'switch' as const,
          label: 'Thông báo đẩy',
          description: 'Nhận thông báo từ ứng dụng',
          checked: pushNotifications,
          onChange: setPushNotifications,
        },
        {
          type: 'switch' as const,
          label: 'Thông báo email',
          description: 'Nhận thông báo qua email',
          checked: emailNotifications,
          onChange: setEmailNotifications,
        },
        {
          type: 'switch' as const,
          label: 'Nhắc nhở bài học',
          description: 'Thông báo giờ học hàng ngày',
          checked: lessonReminders,
          onChange: setLessonReminders,
        },
        {
          type: 'switch' as const,
          label: 'Thông báo thành tích',
          description: 'Thông báo khi đạt được thành tích mới',
          checked: achievementNotifications,
          onChange: setAchievementNotifications,
        },
        {
          type: 'switch' as const,
          label: 'Thông báo bài tập',
          description: 'Thông báo bài tập mới từ giáo viên',
          checked: assignmentNotifications,
          onChange: setAssignmentNotifications,
        },
      ],
    },
    {
      title: 'Giao diện',
      icon: <Monitor className="h-5 w-5 text-purple-600" />,
      items: [
        {
          type: 'switch' as const,
          label: 'Chế độ tối',
          description: 'Sử dụng giao diện tối',
          checked: darkMode,
          onChange: setDarkMode,
        },
        {
          type: 'item' as const,
          icon: <Globe className="h-4 w-4 text-gray-600" />,
          label: 'Ngôn ngữ',
          description: 'Tiếng Việt',
          onClick: () => console.log('Change language'),
        },
        {
          type: 'switch' as const,
          label: 'Hiệu ứng âm thanh',
          description: 'Phát âm thanh khi tương tác',
          checked: soundEffects,
          onChange: setSoundEffects,
        },
        {
          type: 'switch' as const,
          label: 'Rung phản hồi',
          description: 'Rung khi có tương tác',
          checked: hapticFeedback,
          onChange: setHapticFeedback,
        },
      ],
    },
    {
      title: 'Học tập',
      icon: <Settings className="h-5 w-5 text-green-600" />,
      items: [
        {
          type: 'item' as const,
          icon: <Star className="h-4 w-4 text-gray-600" />,
          label: 'Mục tiêu hàng ngày',
          description: `${dailyGoal} phút/ngày`,
          onClick: () => console.log('Change daily goal'),
        },
        {
          type: 'switch' as const,
          label: 'Tự động phát',
          description: 'Tự động phát audio trong bài học',
          checked: autoplay,
          onChange: setAutoplay,
        },
        {
          type: 'switch' as const,
          label: 'Hiển thị gợi ý',
          description: 'Hiện gợi ý khi làm bài tập',
          checked: showHints,
          onChange: setShowHints,
        },
        {
          type: 'switch' as const,
          label: 'Nhắc nhở ôn tập',
          description: 'Nhắc nhở ôn lại từ vựng đã học',
          checked: practiceReminders,
          onChange: setPracticeReminders,
        },
      ],
    },
    {
      title: 'Tài khoản',
      icon: <User className="h-5 w-5 text-orange-600" />,
      items: [
        {
          type: 'item' as const,
          icon: <User className="h-4 w-4 text-gray-600" />,
          label: 'Thông tin cá nhân',
          description: 'Chỉnh sửa hồ sơ và thông tin',
          onClick: () => navigate('/profile'),
        },
        {
          type: 'item' as const,
          icon: <Lock className="h-4 w-4 text-gray-600" />,
          label: 'Đổi mật khẩu',
          description: 'Cập nhật mật khẩu bảo mật',
          onClick: () => console.log('Change password'),
        },
        {
          type: 'item' as const,
          icon: <Mail className="h-4 w-4 text-gray-600" />,
          label: 'Email & Liên kết',
          description: 'Quản lý email và tài khoản liên kết',
          onClick: () => console.log('Manage email'),
        },
        {
          type: 'item' as const,
          icon: <Phone className="h-4 w-4 text-gray-600" />,
          label: 'Số điện thoại',
          description: 'Cập nhật số điện thoại',
          onClick: () => console.log('Update phone'),
        },
      ],
    },
    {
      title: 'Hỗ trợ',
      icon: <HelpCircle className="h-5 w-5 text-red-600" />,
      items: [
        {
          type: 'item' as const,
          icon: <HelpCircle className="h-4 w-4 text-gray-600" />,
          label: 'Trung tâm trợ giúp',
          description: 'Câu hỏi thường gặp và hướng dẫn',
          onClick: () => console.log('Help center'),
        },
        {
          type: 'item' as const,
          icon: <MessageSquare className="h-4 w-4 text-gray-600" />,
          label: 'Liên hệ hỗ trợ',
          description: 'Gửi yêu cầu hỗ trợ',
          onClick: () => console.log('Contact support'),
        },
        {
          type: 'item' as const,
          icon: <Star className="h-4 w-4 text-gray-600" />,
          label: 'Đánh giá ứng dụng',
          description: 'Chia sẻ trải nghiệm của bạn',
          onClick: () => console.log('Rate app'),
        },
        {
          type: 'item' as const,
          icon: <FileText className="h-4 w-4 text-gray-600" />,
          label: 'Điều khoản sử dụng',
          description: 'Xem điều khoản và chính sách',
          onClick: () => console.log('Terms of service'),
        },
      ],
    },
    {
      title: 'Khác',
      icon: <Settings className="h-5 w-5 text-gray-600" />,
      items: [
        {
          type: 'item' as const,
          icon: <Download className="h-4 w-4 text-gray-600" />,
          label: 'Tải dữ liệu của tôi',
          description: 'Xuất dữ liệu học tập',
          onClick: () => console.log('Download data'),
        },
        {
          type: 'item' as const,
          icon: <Trash2 className="h-4 w-4 text-red-600" />,
          label: 'Xóa tài khoản',
          description: 'Xóa vĩnh viễn tài khoản',
          onClick: () => console.log('Delete account'),
          rightElement: <ChevronRight className="h-4 w-4 text-red-600" />,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Cài đặt</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Parent Monitoring Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 mr-3">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Parent Monitoring
              </h2>
            </div>
            <ParentInvitationCard />
          </div>

          {/* Pending Invitations Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 mr-3">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Invitations
              </h2>
            </div>
            <PendingInvitationsTable />
          </div>

          {settingSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 mr-3">
                  {section.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-1">
                {section.items.map((item, index) => (
                  <div key={index}>
                    {item.type === 'switch' ? (
                      <SettingSwitch
                        label={item.label}
                        description={item.description}
                        checked={item.checked}
                        onChange={item.onChange}
                      />
                    ) : (
                      <SettingItem
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                        onClick={item.onClick}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* App Version */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">English Learning App v1.0.1</p>
          <p className="text-xs text-gray-400 mt-1">
            © 2024 English Learning Platform
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
