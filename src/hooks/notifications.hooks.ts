import { useEffect, useRef, useState } from 'react'
import { emitUnreadCount } from '../lib/notificationBus'
import type { ApiNotification } from '../services/notifications.api'
import { listNotifications } from '../services/notifications.api'

export type NotificationFilter = 'all' | 'unread' | 'read'

export function useNotificationsPagination(opts: {
  filter: NotificationFilter
  pageSize?: number
}) {
  const { filter, pageSize = 10 } = opts

  const [items, setItems] = useState<ApiNotification[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)

  // Reset when filter changes
  useEffect(() => {
    setPage(1)
    setItems([])
  }, [filter])

  // Fetch page
  useEffect(() => {
    let cancelled = false
    const rid = ++requestIdRef.current
    const run = async () => {
      try {
        setLoading(true)
        const readParam = filter === 'all' ? undefined : filter === 'read'
        const data = await listNotifications({
          page,
          limit: pageSize,
          read: readParam,
        })
        if (cancelled || rid !== requestIdRef.current) return

        // Ensure data is valid and data.data is an array
        if (data && typeof data === 'object') {
          const itemsArray = Array.isArray(data.data) ? data.data : []
          setHasNext(!!data.hasNextPage)
          setItems((prev) =>
            page === 1 ? itemsArray : [...prev, ...itemsArray]
          )
        } else {
          setHasNext(false)
          setItems((prev) => (page === 1 ? [] : prev))
        }
      } catch (e) {
        // Swallow here; page-level can toast if needed
        if (!cancelled && rid === requestIdRef.current) {
          setHasNext(false)
          setItems((prev) => (page === 1 ? [] : prev))
        }
      } finally {
        if (!cancelled && rid === requestIdRef.current) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [page, filter, pageSize])

  const loadMore = () => setPage((p) => p + 1)

  const reload = () => {
    // force re-fetch current filter from first page
    setPage(1)
  }

  const refreshUnread = async () => {
    try {
      const unread = await listNotifications({ read: false, page: 1, limit: 1 })
      if (unread && typeof unread === 'object') {
        emitUnreadCount(unread.totalItems || 0)
      } else {
        emitUnreadCount(0)
      }
    } catch {
      console.log('Failed to fetch unread count')
      emitUnreadCount(0)
    }
  }

  return {
    items,
    page,
    setPage,
    hasNext,
    loading,
    loadMore,
    reload,
    refreshUnread,
  }
}
