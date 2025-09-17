import React, { useState, useMemo } from 'react'
import {
  Bell,
  Check,
  Clock,
  Filter,
  MoreVertical,
  Trash2,
  ArrowLeft,
  Search,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Notification {
  id: string
  type:
    | 'achievement'
    | 'lesson'
    | 'reminder'
    | 'assignment'
    | 'system'
    | 'social'
    | 'event'
  title: string
  content: string
  time: string
  timestamp: Date
  isRead: boolean
  icon: string
  color: string
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={`relative group ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'}
                     border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full text-lg"
            style={{ backgroundColor: notification.color + '20' }}
          >
            {notification.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3
                className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900 font-semibold' : 'text-gray-800'}
                              line-clamp-2`}
              >
                {notification.title}
              </h3>
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {notification.time}
                </span>
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {notification.content}
            </p>
            {!notification.isRead && (
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
          {!notification.isRead && (
            <button
              onClick={() => {
                onMarkAsRead(notification.id)
                setShowActions(false)
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
            >
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu đã đọc
            </button>
          )}
          <button
            onClick={() => {
              onDelete(notification.id)
              setShowActions(false)
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </button>
        </div>
      )}
    </div>
  )
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Chúc mừng! Bạn đã hoàn thành streak 7 ngày',
      content:
        'Bạn đã học liên tục 7 ngày. Hãy tiếp tục duy trì thói quen học tập tốt này! Bạn đã nhận được 50 xu và 100 XP thưởng.',
      time: '2 phút trước',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      isRead: false,
      icon: '🏆',
      color: '#FFD700',
    },
    {
      id: '2',
      type: 'lesson',
      title: 'Bài học mới đã sẵn sàng',
      content:
        'Unit 2: Colors - Màu sắc quanh ta đã được mở khóa. Bài học này bao gồm 15 từ vựng mới và 3 hoạt động thú vị. Hãy bắt đầu học ngay!',
      time: '1 giờ trước',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: false,
      icon: '📚',
      color: '#4CAF50',
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Đến giờ học rồi!',
      content:
        'Hãy dành 15 phút để ôn lại từ vựng hôm nay nhé. Bạn có 12 từ cần ôn tập để không bị quên.',
      time: '3 giờ trước',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      icon: '⏰',
      color: '#FF9800',
    },
    {
      id: '4',
      type: 'assignment',
      title: 'Bài tập mới từ Cô Lan',
      content:
        'Lớp Tiếng Anh 5A có bài tập mới: "Từ vựng Unit 3". Bài tập bao gồm 20 câu hỏi trắc nghiệm và 5 câu điền từ. Hạn nộp: 31/08/2024',
      time: '5 giờ trước',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
      icon: '📝',
      color: '#2196F3',
    },
    {
      id: '5',
      type: 'system',
      title: 'Cập nhật ứng dụng',
      content:
        'Phiên bản mới v1.0.1 đã có sẵn với nhiều tính năng thú vị: Chế độ tối, game từ vựng mới và cải thiện hiệu suất.',
      time: '1 ngày trước',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '🔄',
      color: '#9C27B0',
    },
    {
      id: '6',
      type: 'social',
      title: 'Bạn bè mới',
      content:
        'Bé Gấu đã tham gia lớp học của bạn. Hãy chào đón bạn ấy! Bạn có thể xem profile và thành tích của Bé Gấu.',
      time: '2 ngày trước',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '👋',
      color: '#E91E63',
    },
    {
      id: '7',
      type: 'event',
      title: 'Sự kiện tuần: Thử thách 7 ngày',
      content:
        'Tham gia ngay để nhận huy hiệu đặc biệt và 200 xu thưởng! Hoàn thành ít nhất 1 bài học mỗi ngày trong 7 ngày liên tiếp.',
      time: '3 ngày trước',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '🎉',
      color: '#FF5722',
    },
    {
      id: '8',
      type: 'achievement',
      title: 'Bạn đã lên cấp!',
      content:
        'Chúc mừng! Bạn đã đạt cấp độ 5. Bây giờ bạn có thể truy cập các bài học nâng cao và mini-games mới.',
      time: '1 tuần trước',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isRead: true,
      icon: '⭐',
      color: '#FF6B35',
    },
  ])

  const filteredNotifications = useMemo(() => {
    let result = notifications

    // Filter by read status
    if (filter === 'unread') {
      result = result.filter((n) => !n.isRead)
    } else if (filter === 'read') {
      result = result.filter((n) => n.isRead)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, filter, searchQuery])

  const filterCounts = useMemo(
    () => ({
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      read: notifications.filter((n) => n.isRead).length,
    }),
    [notifications]
  )

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead))
  }

  const filterTabs = [
    { key: 'all' as const, label: 'Tất cả', count: filterCounts.all },
    { key: 'unread' as const, label: 'Chưa đọc', count: filterCounts.unread },
    { key: 'read' as const, label: 'Đã đọc', count: filterCounts.read },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Thông báo
                </h1>
                {filterCounts.unread > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {filterCounts.unread}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {filterCounts.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Đánh dấu tất cả
                </button>
              )}
              {filterCounts.read > 0 && (
                <button
                  onClick={clearAllRead}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Xóa đã đọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thông báo..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có thông báo
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `Không tìm thấy thông báo nào với từ khóa "${searchQuery}"`
                : filter === 'unread'
                  ? 'Bạn đã đọc hết thông báo'
                  : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Tải thêm thông báo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
