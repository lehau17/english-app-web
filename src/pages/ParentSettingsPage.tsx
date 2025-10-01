import {
  Bell,
  Clock,
  Eye,
  EyeOff,
  Moon,
  Save,
  Settings2,
  Shield,
  Sun,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Switch } from '../components/ui/switch'
import {
  useChildNotificationSettingsQuery,
  useParentChildrenQuery,
  useUpdateChildNotificationSettingsMutation,
} from '../hooks/parent.queries'

interface NotificationSettings {
  notificationsEnabled: boolean
  notificationTypes: string[]
  notificationSchedule: string
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: string
  minProgressThreshold: number
  streakNotificationDays: number
  activityCompletionNotify: boolean
  goalReachedNotify: boolean
}

interface ChildSettings extends NotificationSettings {
  canViewProgress: boolean
  canSetGoals: boolean
  canControlTime: boolean
  dailyTimeLimit?: number
  bedtimeStart?: string
  bedtimeEnd?: string
  allowedActivities: string[]
  blockedContent: string[]
}

const NOTIFICATION_TYPES = [
  {
    key: 'achievement',
    label: 'Thành tích mới',
    description: 'Khi con đạt được thành tích',
  },
  {
    key: 'progress',
    label: 'Tiến độ học tập',
    description: 'Cập nhật tiến độ hằng ngày',
  },
  {
    key: 'activity_completed',
    label: 'Hoàn thành bài tập',
    description: 'Khi con hoàn thành bài tập',
  },
  {
    key: 'daily_goal_reached',
    label: 'Đạt mục tiêu ngày',
    description: 'Khi con đạt mục tiêu học tập',
  },
  {
    key: 'weekly_summary',
    label: 'Tổng kết tuần',
    description: 'Báo cáo tổng kết hằng tuần',
  },
]

const ACTIVITY_TYPES = [
  { key: 'vocabulary', label: 'Từ vựng' },
  { key: 'grammar', label: 'Ngữ pháp' },
  { key: 'listening', label: 'Nghe' },
  { key: 'speaking', label: 'Nói' },
  { key: 'reading', label: 'Đọc' },
  { key: 'writing', label: 'Viết' },
  { key: 'podcast', label: 'Podcast' },
  { key: 'games', label: 'Trò chơi' },
]

function ChildSettingsCard({ child }: { child: any }) {
  const { data: existingSettings } = useChildNotificationSettingsQuery(child.id)
  const updateSettingsMutation = useUpdateChildNotificationSettingsMutation()

  const [settings, setSettings] = useState<ChildSettings>({
    // Notification settings
    notificationsEnabled: true,
    notificationTypes: ['achievement', 'activity_completed'],
    notificationSchedule: 'realtime',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    timezone: 'Asia/Ho_Chi_Minh',
    minProgressThreshold: 10,
    streakNotificationDays: 3,
    activityCompletionNotify: true,
    goalReachedNotify: true,
    // Child control settings
    canViewProgress: true,
    canSetGoals: false,
    canControlTime: true,
    dailyTimeLimit: 120,
    bedtimeStart: '21:30',
    bedtimeEnd: '06:30',
    allowedActivities: ['vocabulary', 'grammar', 'listening', 'reading'],
    blockedContent: [],
  })

  const [isExpanded, setIsExpanded] = useState(false)

  // Update settings when API data is loaded
  useEffect(() => {
    if (existingSettings) {
      setSettings((prev) => ({
        ...prev,
        ...existingSettings,
      }))
    }
  }, [existingSettings])

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        childId: child.id,
        settings,
      })
      toast.success(`Đã lưu cài đặt cho ${child.name}`)
    } catch (error) {
      toast.error('Có lỗi khi lưu cài đặt')
      console.error('Save settings error:', error)
    }
  }

  const updateSetting = (key: keyof ChildSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const toggleNotificationType = (type: string) => {
    setSettings((prev) => ({
      ...prev,
      notificationTypes: prev.notificationTypes.includes(type)
        ? prev.notificationTypes.filter((t) => t !== type)
        : [...prev.notificationTypes, type],
    }))
  }

  const toggleAllowedActivity = (activity: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedActivities: prev.allowedActivities.includes(activity)
        ? prev.allowedActivities.filter((a) => a !== activity)
        : [...prev.allowedActivities, activity],
    }))
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{child.avatar || '👦'}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {child.name}
            </h3>
            <p className="text-sm text-gray-600">Level {child.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={settings.notificationsEnabled ? 'default' : 'secondary'}
          >
            {settings.notificationsEnabled ? 'Thông báo bật' : 'Thông báo tắt'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Cài đặt thông báo
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bật thông báo</p>
                  <p className="text-sm text-gray-600">
                    Nhận thông báo về hoạt động của con
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked: boolean) =>
                    updateSetting('notificationsEnabled', checked)
                  }
                />
              </div>

              {settings.notificationsEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại thông báo
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {NOTIFICATION_TYPES.map((type) => (
                        <div
                          key={type.key}
                          className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-gray-600">
                              {type.description}
                            </p>
                          </div>
                          <Switch
                            checked={settings.notificationTypes.includes(
                              type.key
                            )}
                            onCheckedChange={() =>
                              toggleNotificationType(type.key)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ bắt đầu im lặng
                      </label>
                      <input
                        type="time"
                        value={settings.quietHoursStart || ''}
                        onChange={(e) =>
                          updateSetting('quietHoursStart', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ kết thúc im lặng
                      </label>
                      <input
                        type="time"
                        value={settings.quietHoursEnd || ''}
                        onChange={(e) =>
                          updateSetting('quietHoursEnd', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Time Control Settings */}
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Kiểm soát thời gian
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Kiểm soát thời gian học</p>
                  <p className="text-sm text-gray-600">
                    Đặt giới hạn thời gian học hàng ngày
                  </p>
                </div>
                <Switch
                  checked={settings.canControlTime}
                  onCheckedChange={(checked: boolean) =>
                    updateSetting('canControlTime', checked)
                  }
                />
              </div>

              {settings.canControlTime && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới hạn thời gian học/ngày (phút)
                    </label>
                    <input
                      type="number"
                      value={settings.dailyTimeLimit || ''}
                      onChange={(e) =>
                        updateSetting(
                          'dailyTimeLimit',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="720"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Moon className="h-4 w-4 inline mr-1" />
                        Giờ đi ngủ
                      </label>
                      <input
                        type="time"
                        value={settings.bedtimeStart || ''}
                        onChange={(e) =>
                          updateSetting('bedtimeStart', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Sun className="h-4 w-4 inline mr-1" />
                        Giờ thức dậy
                      </label>
                      <input
                        type="time"
                        value={settings.bedtimeEnd || ''}
                        onChange={(e) =>
                          updateSetting('bedtimeEnd', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Control */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Kiểm soát nội dung
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoạt động được phép
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <div
                    key={activity.key}
                    className="flex items-center justify-between p-2 border border-gray-100 rounded-lg"
                  >
                    <span className="text-sm">{activity.label}</span>
                    <Switch
                      checked={settings.allowedActivities.includes(
                        activity.key
                      )}
                      onCheckedChange={() =>
                        toggleAllowedActivity(activity.key)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Quyền truy cập
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Xem tiến độ chi tiết</p>
                  <p className="text-sm text-gray-600">
                    Cho phép xem báo cáo tiến độ chi tiết
                  </p>
                </div>
                <Switch
                  checked={settings.canViewProgress}
                  onCheckedChange={(checked: boolean) =>
                    updateSetting('canViewProgress', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Đặt mục tiêu học tập</p>
                  <p className="text-sm text-gray-600">
                    Cho phép đặt mục tiêu học tập cho con
                  </p>
                </div>
                <Switch
                  checked={settings.canSetGoals}
                  onCheckedChange={(checked: boolean) =>
                    updateSetting('canSetGoals', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4" />
              {updateSettingsMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ParentSettingsPage() {
  const { data: childrenData, isLoading } = useParentChildrenQuery()
  const children = (childrenData as any)?.data || childrenData || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Cài đặt phụ huynh
          </h1>
          <p className="text-gray-600">
            Quản lý thông báo, thời gian học và nội dung cho từng con
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Số con đang theo dõi</p>
                <p className="text-xl font-semibold">{children.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Thông báo hôm nay</p>
                <p className="text-xl font-semibold">0</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kiểm soát hoạt động</p>
                <p className="text-xl font-semibold">
                  {children.length > 0 ? 'Đang hoạt động' : 'Chưa cài đặt'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Children Settings */}
        <div className="space-y-6">
          {children.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có con nào được liên kết
              </h3>
              <p className="text-gray-600">
                Liên kết tài khoản con để có thể theo dõi và quản lý học tập
              </p>
            </Card>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Cài đặt cho từng con ({children.length})
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Nhấn vào biểu tượng mắt để mở rộng cài đặt chi tiết cho từng
                  con
                </p>
              </div>

              {children.map((child: any) => (
                <ChildSettingsCard key={child.id} child={child} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
