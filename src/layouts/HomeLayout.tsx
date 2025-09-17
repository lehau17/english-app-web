import { Bell, Globe, LogOut, Menu, Search, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="text-xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EnglishApp
              </span>
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              <NavLink
                to="/learn"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Học
              </NavLink>
              <NavLink
                to="/listening-practice"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Luyện nghe
              </NavLink>
              <NavLink
                to="/practice"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Luyện tập
              </NavLink>
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`
                }
              >
                Cửa hàng
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white/60 px-2 py-1 backdrop-blur md:flex">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                placeholder="Tìm bài học, khóa học…"
                className="w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <Link
              to="/notifications"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <button
              className="hidden rounded-full p-2 text-gray-600 hover:bg-gray-100 md:inline-flex"
              aria-label="Ngôn ngữ"
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
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
                    Tài khoản
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4" /> Hồ sơ
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Đăng xuất
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
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} EnglishApp
        </div>
      </footer>
    </div>
  )
}
