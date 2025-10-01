import { Bell, BellOff, Check, Save, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface NotificationSetting {
  key: string
  title: string
  description: string
  enabled: boolean
}

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      key: 'newLessons',
      title: 'Bài học mới',
      description:
        'Thông báo khi có bài học mới được thêm vào khóa học của bạn',
      enabled: true,
    },
    {
      key: 'assignments',
      title: 'Bài tập được giao',
      description: 'Thông báo khi giáo viên giao bài tập mới',
      enabled: true,
    },
    {
      key: 'deadlines',
      title: 'Hạn nộp bài',
      description: 'Nhắc nhở trước 24h và 1h về hạn nộp bài tập',
      enabled: true,
    },
    {
      key: 'achievements',
      title: 'Thành tích',
      description:
        'Thông báo khi bạn đạt được thành tích mới hoặc hoàn thành mục tiêu',
      enabled: false,
    },
    {
      key: 'weeklyReport',
      title: 'Báo cáo tuần',
      description: 'Gửi báo cáo tiến độ học tập hàng tuần',
      enabled: false,
    },
    {
      key: 'socialUpdates',
      title: 'Hoạt động bạn bè',
      description: 'Thông báo về hoạt động của bạn bè trong lớp học',
      enabled: false,
    },
  ])
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleToggle = (key: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.key === key
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call to save notification settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage for persistence
      localStorage.setItem('notificationSettings', JSON.stringify(settings))

      toast.success('Cài đặt thông báo đã được lưu!')
      onClose()
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Có lỗi khi lưu cài đặt thông báo')
    } finally {
      setLoading(false)
    }
  }

  const enabledCount = settings.filter((s) => s.enabled).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Cài đặt thông báo</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Bell className="h-4 w-4" />
            <span className="font-medium">
              {enabledCount} trên {settings.length} loại thông báo đã được bật
            </span>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-4">
          {settings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-start gap-4 rounded-xl border border-gray-200 p-4"
            >
              <button
                onClick={() => handleToggle(setting.key)}
                className={`mt-1 flex h-5 w-5 items-center justify-center rounded border-2 transition ${
                  setting.enabled
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white'
                }`}
                disabled={loading}
              >
                {setting.enabled && <Check className="h-3 w-3" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{setting.title}</h3>
                  {setting.enabled ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {setting.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Browser Notification Permission */}
        <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Thông báo trình duyệt
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Để nhận thông báo khi không sử dụng ứng dụng, vui lòng cho phép
                thông báo trong trình duyệt.
              </p>
              <button
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission().then((permission) => {
                      if (permission === 'granted') {
                        toast.success('Đã cho phép thông báo!')
                      } else {
                        toast.error('Bạn đã từ chối thông báo')
                      }
                    })
                  }
                }}
                className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Cho phép thông báo
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
