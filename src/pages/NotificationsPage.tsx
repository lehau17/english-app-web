import {
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  Calendar,
  Check,
  Clock,
  FileText,
  MessageCircle,
  MoreVertical,
  Search,
  Settings as SettingsIcon,
  Trash2,
  X,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useNotificationsPagination } from '../hooks/notifications.hooks'
import {
  deleteNotification as apiDeleteNotification,
  markNotificationRead,
  type ApiNotification,
} from '../services/notifications.api'

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
  icon: React.ComponentType<{ size?: number; className?: string }>
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
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{
              backgroundColor: notification.color + '20',
              color: notification.color,
            }}
          >
            <notification.icon size={20} />
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
  const { items, hasNext, loading, loadMore, reload, refreshUnread } =
    useNotificationsPagination({ filter, pageSize: 10 })

  // Map API notification to UI
  function mapApi(n: ApiNotification): Notification {
    const created = new Date(n.createdAt)
    const type = (n.type as Notification['type']) || 'system'
    const iconMap: Record<
      Notification['type'],
      React.ComponentType<{ size?: number; className?: string }>
    > = {
      achievement: Award,
      lesson: BookOpen,
      reminder: Clock,
      assignment: FileText,
      system: SettingsIcon,
      social: MessageCircle,
      event: Calendar,
    }
    const colorMap: Record<Notification['type'], string> = {
      achievement: '#10b981',
      lesson: '#3b82f6',
      reminder: '#f59e0b',
      assignment: '#6366f1',
      system: '#6b7280',
      social: '#ec4899',
      event: '#22c55e',
    }
    return {
      id: n.id,
      type,
      title: n.title,
      content: n.body || '',
      time: created.toLocaleString('vi-VN'),
      timestamp: created,
      isRead: !!n.readAt,
      icon: iconMap[type],
      color: colorMap[type],
    }
  }

  // Initial unread refresh
  useEffect(() => {
    refreshUnread().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mappedNotifications = useMemo(() => items.map(mapApi), [items])
  const filteredNotifications = useMemo(() => {
    let result = mappedNotifications

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
  }, [mappedNotifications, filter, searchQuery])

  const filterCounts = useMemo(
    () => ({
      all: mappedNotifications.length,
      unread: mappedNotifications.filter((n) => !n.isRead).length,
      read: mappedNotifications.filter((n) => n.isRead).length,
    }),
    [mappedNotifications]
  )

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      await refreshUnread()
      reload()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unread = mappedNotifications.filter((n) => !n.isRead)
      await Promise.allSettled(unread.map((n) => markNotificationRead(n.id)))
      await refreshUnread()
      reload()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await apiDeleteNotification(id)
      await refreshUnread()
      reload()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thất bại')
    }
  }

  const clearAllRead = async () => {
    try {
      const readList = mappedNotifications.filter((n) => n.isRead)
      await Promise.allSettled(readList.map((n) => apiDeleteNotification(n.id)))
      await refreshUnread()
      reload()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thất bại')
    }
  }

  // Bulk selection state
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const allIds = filteredNotifications.map((n) => n.id)
  const selectedIds = allIds.filter((id) => selected[id])
  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    allIds.forEach((id) => (next[id] = checked))
    setSelected(next)
  }
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((prev) => ({ ...prev, [id]: checked }))

  const bulkMarkRead = async () => {
    if (selectedIds.length === 0) return
    try {
      const targets = filteredNotifications.filter(
        (n) => selected[n.id] && !n.isRead
      )
      await Promise.allSettled(targets.map((n) => markNotificationRead(n.id)))
      await refreshUnread()
      setSelected({})
      reload()
      toast.success(`Đã đánh dấu ${targets.length} thông báo`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại')
    }
  }
  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      await Promise.allSettled(
        selectedIds.map((id) => apiDeleteNotification(id))
      )
      await refreshUnread()
      setSelected({})
      reload()
      toast.success(`Đã xóa ${selectedIds.length} thông báo`)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Xóa thất bại')
    }
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
              {selectedIds.length > 0 && (
                <>
                  <button
                    onClick={bulkMarkRead}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Đánh dấu đã đọc ({selectedIds.length})
                  </button>
                  <button
                    onClick={bulkDelete}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Xóa ({selectedIds.length})
                  </button>
                </>
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
            {/* Bulk selector header */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={
                  selectedIds.length === allIds.length && allIds.length > 0
                }
                onChange={(e) => toggleAll(e.target.checked)}
              />
              <span>Chọn tất cả</span>
              {selectedIds.length > 0 && (
                <span className="ml-2 text-gray-500">
                  Đã chọn {selectedIds.length}/{allIds.length}
                </span>
              )}
            </div>
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={!!selected[notification.id]}
                  onChange={(e) => toggleOne(notification.id, e.target.checked)}
                />
                <div className="flex-1">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredNotifications.length > 0 && hasNext && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Đang tải...' : 'Tải thêm thông báo'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
