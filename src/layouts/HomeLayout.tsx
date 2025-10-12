import {
  BarChart3,
  Bell,
  BookOpen,
  Copyright,
  Gift,
  Globe,
  LogOut,
  Menu,
  Search,
  Settings,
  UserIcon,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, NavLink } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import ConversationWidget from '../components/conversation/ConversationWidget'
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

export const HomeLayout: React.FC<{ children: React.ReactNode }> = ({
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

  // Subscribe to unread counter events from NotificationsPage
  useEffect(() => {
    const off = onUnreadCount((count) => setUnread(count))
    return () => off()
  }, [])

  // Initial fetch unread
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to={user?.role === 'parent' ? '/parent-home' : '/'}
                className="text-xl font-extrabold tracking-tight"
              >
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EnglishApp
                </span>
              </Link>
              <nav className="hidden items-center gap-4 md:flex">
                {user?.role === 'parent' ? (
                  // Parent navigation
                  <>
                    <NavLink
                      to="/parent-home"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      <Users className="h-4 w-4 inline mr-1" />
                      Tổng quan
                    </NavLink>
                    <NavLink
                      to="/parent-activities"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      <BookOpen className="h-4 w-4 inline mr-1" />
                      Hoạt động
                    </NavLink>
                    <NavLink
                      to="/parent-reports"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      <BarChart3 className="h-4 w-4 inline mr-1" />
                      Báo cáo
                    </NavLink>
                    <NavLink
                      to="/parent-rewards"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      <Gift className="h-4 w-4 inline mr-1" />
                      Phần thưởng
                    </NavLink>
                    <NavLink
                      to="/parent-settings"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      <Settings className="h-4 w-4 inline mr-1" />
                      Cài đặt
                    </NavLink>
                  </>
                ) : (
                  // Student/Teacher navigation
                  <>
                    <NavLink
                      to="/listening-practice"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      Luyen nghe
                    </NavLink>
                    <NavLink
                      to="/ai-speaking"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      Luyen noi AI
                    </NavLink>
                    <NavLink
                      to="/schedule"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      Lịch Học
                    </NavLink>
                    <NavLink
                      to="/dictionary"
                      className={({ isActive }) =>
                        `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                      }
                    >
                      Từ điển
                    </NavLink>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white/60 px-2 py-1 backdrop-blur md:flex">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  placeholder={
                    user?.role === 'parent'
                      ? 'Tìm con, hoạt động...'
                      : 'Tim bai hoc, khoa hoc...'
                  }
                  className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              <Link
                to="/notifications"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
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
                className="hidden rounded-full p-2 text-gray-600 hover:bg-gray-100 md:inline-flex"
                aria-label="Language"
              >
                <Globe className="h-5 w-5" />
              </button>

              {/* User */}
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

        {/* Content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-black/5 py-6">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 flex items-center justify-center gap-1">
            <Copyright className="h-3 w-3" />
            {new Date().getFullYear()} EnglishApp
          </div>
        </footer>
      </div>
      <ConversationWidget />
    </>
  )
}
