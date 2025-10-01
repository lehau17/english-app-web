import { Eye, EyeOff, Lock, Save, Shield, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PrivacySetting {
  key: string
  title: string
  description: string
  value: 'public' | 'friends' | 'private'
  options: Array<{ value: string; label: string; description: string }>
}

interface PrivacySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacySettingsModal({
  isOpen,
  onClose,
}: PrivacySettingsModalProps) {
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      key: 'profile',
      title: 'Hồ sơ cá nhân',
      description: 'Ai có thể xem thông tin cá nhân của bạn',
      value: 'friends',
      options: [
        {
          value: 'public',
          label: 'Công khai',
          description: 'Mọi người đều có thể xem',
        },
        {
          value: 'friends',
          label: 'Bạn bè',
          description: 'Chỉ bạn bè trong lớp có thể xem',
        },
        {
          value: 'private',
          label: 'Riêng tư',
          description: 'Chỉ mình bạn có thể xem',
        },
      ],
    },
    {
      key: 'progress',
      title: 'Tiến độ học tập',
      description: 'Ai có thể xem tiến độ và thành tích học tập',
      value: 'friends',
      options: [
        {
          value: 'public',
          label: 'Công khai',
          description: 'Mọi người đều có thể xem',
        },
        {
          value: 'friends',
          label: 'Bạn bè',
          description: 'Chỉ bạn bè trong lớp có thể xem',
        },
        {
          value: 'private',
          label: 'Riêng tư',
          description: 'Chỉ mình bạn có thể xem',
        },
      ],
    },
    {
      key: 'activity',
      title: 'Hoạt động gần đây',
      description: 'Ai có thể xem hoạt động học tập gần đây',
      value: 'private',
      options: [
        {
          value: 'public',
          label: 'Công khai',
          description: 'Mọi người đều có thể xem',
        },
        {
          value: 'friends',
          label: 'Bạn bè',
          description: 'Chỉ bạn bè trong lớp có thể xem',
        },
        {
          value: 'private',
          label: 'Riêng tư',
          description: 'Chỉ mình bạn có thể xem',
        },
      ],
    },
  ])
  const [dataSettings, setDataSettings] = useState({
    shareUsageData: false,
    shareProgressWithParents: true,
    allowTeacherAnalytics: true,
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSettingChange = (
    key: string,
    value: 'public' | 'friends' | 'private'
  ) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      )
    )
  }

  const handleDataSettingChange = (key: keyof typeof dataSettings) => {
    setDataSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call to save privacy settings
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save to localStorage for persistence
      localStorage.setItem(
        'privacySettings',
        JSON.stringify({ settings, dataSettings })
      )

      toast.success('Cài đặt quyền riêng tư đã được lưu!')
      onClose()
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      toast.error('Có lỗi khi lưu cài đặt quyền riêng tư')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (value: string) => {
    switch (value) {
      case 'public':
        return <Eye className="h-4 w-4 text-green-500" />
      case 'friends':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'private':
        return <EyeOff className="h-4 w-4 text-gray-500" />
      default:
        return <Lock className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Quyền riêng tư</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Hiển thị thông tin</h3>
            <div className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.key}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {setting.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {setting.description}
                      </p>
                    </div>
                    {getIcon(setting.value)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {setting.options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSettingChange(setting.key, option.value as any)
                        }
                        className={`text-left p-3 rounded-lg border transition ${
                          setting.value === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        disabled={loading}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {getIcon(option.value)}
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Usage Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Sử dụng dữ liệu</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSettings.shareUsageData}
                  onChange={() => handleDataSettingChange('shareUsageData')}
                  className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">Chia sẻ dữ liệu sử dụng</span>
                  <p className="text-sm text-gray-600">
                    Giúp cải thiện ứng dụng bằng cách chia sẻ dữ liệu sử dụng ẩn
                    danh
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSettings.shareProgressWithParents}
                  onChange={() =>
                    handleDataSettingChange('shareProgressWithParents')
                  }
                  className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">
                    Chia sẻ tiến độ với phụ huynh
                  </span>
                  <p className="text-sm text-gray-600">
                    Cho phép phụ huynh xem báo cáo tiến độ học tập của bạn
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataSettings.allowTeacherAnalytics}
                  onChange={() =>
                    handleDataSettingChange('allowTeacherAnalytics')
                  }
                  className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <div>
                  <span className="font-medium">
                    Cho phép giáo viên xem phân tích
                  </span>
                  <p className="text-sm text-gray-600">
                    Giúp giáo viên có dữ liệu để hỗ trợ bạn học tập tốt hơn
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info Note */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Bảo mật thông tin</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Thông tin cá nhân của bạn luôn được bảo mật và không bao giờ
                  được chia sẻ với bên thứ ba mà không có sự đồng ý của bạn.
                </p>
              </div>
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
