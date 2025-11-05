import {
  Bell,
  BookmarkCheck,
  Globe,
  LogOut,
  Menu,
  Search,
  UserIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'
import { onUnreadCount } from '../lib/notificationBus'
import { resolveSocketUrl } from '../lib/socket'
import { listNotifications } from '../services/notifications.api'

function Avatar({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-gradient-to-br from-white/10 to-white/5 shadow-sm">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <UserIcon className="h-5 w-5 text-white/90" />
      )}
    </div>
  )
}

/**
 * LessonMapLayout - Layout riêng cho trang bản đồ bài học
 * Header trong suốt, hình nền lặp lại, không scroll hình
 */
export const LessonMapLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const socketUrl = useMemo(() => resolveSocketUrl(), [])

  useEffect(() => {
    if (!user?.id) return

    const socket: Socket = io(socketUrl, {
      transports: ['websocket'],
      query: { userId: user.id },
    })

    socket.on('notification', (msg: any) => {
      const title = msg?.title ?? 'Notification'
      const body = msg?.body ?? ''
      toast(`${title}${body ? ` - ${body}` : ''}`)
      setUnread((n) => n + 1)
    })

    return () => {
      socket.disconnect()
    }
  }, [socketUrl, user?.id])

  useEffect(() => {
    const off = onUnreadCount((count) => setUnread(count))
    return () => off()
  }, [])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await listNotifications({ read: false, page: 1, limit: 1 })
        setUnread(res.totalItems || 0)
      } catch {
        // ignore
      }
    }
    run()
  }, [])

  // Remove body and root background when this layout is mounted
  useEffect(() => {
    const body = document.body
    const root = document.getElementById('root')

    const originalBodyBg = body.style.background
    const originalBodyBgColor = body.style.backgroundColor
    const originalRootBg = root?.style.background
    const originalRootBgColor = root?.style.backgroundColor

    body.style.setProperty('background', 'transparent', 'important')
    body.style.setProperty('background-color', 'transparent', 'important')
    if (root) {
      root.style.setProperty('background', 'transparent', 'important')
      root.style.setProperty('background-color', 'transparent', 'important')
    }

    return () => {
      body.style.background = originalBodyBg
      body.style.backgroundColor = originalBodyBgColor
      if (root) {
        root.style.background = originalRootBg || ''
        root.style.backgroundColor = originalRootBgColor || ''
      }
    }
  }, [])

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-transparent"
      style={{
        background: 'none !important',
        backgroundColor: 'transparent !important',
      }}
    >
      {/* Fixed semi-transparent header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to={user?.role === 'parent' ? '/parent-home' : '/'}
              className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              EnglishApp
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              <NavLink
                to="/listening-practice"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Luyen nghe
              </NavLink>
              <NavLink
                to="/ai-speaking"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Luyen noi AI
              </NavLink>
              <NavLink
                to="/schedule"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Lịch Học
              </NavLink>
              <NavLink
                to="/dictionary"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Từ điển
              </NavLink>
              <NavLink
                to="/vocabulary"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`
                }
              >
                Từ vựng
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-2 py-1 backdrop-blur md:flex">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                placeholder="Tim bai hoc, khoa hoc..."
                className="w-56 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <Link
              to="/notifications"
              className="relative rounded-full p-2 text-gray-700 hover:bg-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
            <button
              className="hidden rounded-full p-2 text-gray-700 hover:bg-gray-100 md:inline-flex"
              aria-label="Language"
            >
              <Globe className="h-5 w-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full bg-gray-900 px-2 py-1 pr-3 text-white"
              >
                <Avatar
                  src={'/vite.svg'}
                  alt={user?.displayName || user?.email}
                />
                <span className="hidden text-sm md:inline">
                  {user?.displayName ||
                    user?.firstName ||
                    user?.lastName ||
                    'Guest'}
                </span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/5 bg-white/95 shadow-lg backdrop-blur">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500">
                    Tai khoan
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4" /> Ho so
                  </Link>
                  {user?.role === 'student' && (
                    <Link
                      to="/my-vocabulary"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <BookmarkCheck className="h-4 w-4" /> Từ đã lưu
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Dang xuat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content with repeating background */}
      <div
        className="w-full h-full pt-16 overflow-x-auto overflow-y-hidden bg-transparent"
        style={{
          background: 'none !important',
          backgroundColor: 'transparent !important',
        }}
      >
        <div
          className="absolute inset-0 top-16 w-full h-full"
          style={{
            backgroundImage: 'url(/image.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat-x',
            opacity: 0.8,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div
          className="relative z-10 bg-transparent"
          style={{ background: 'none !important' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
