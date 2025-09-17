import {
  BookOpen,
  ChevronRight,
  FileText,
  PlayCircle,
  Users,
} from 'lucide-react'
import React, { useMemo, type JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMyClassrooms } from '../hooks/useMyClassrooms'
import { useNextLesson } from '../hooks/useNextLesson'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import { useUserInfo } from '../hooks/useUserInfo'
import {} from '../services/home.api'

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = Math.max(0, Math.min(1, value)) * circumference
  return (
    <svg viewBox="0 0 72 72" className="h-16 w-16">
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="8"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeLinecap="round"
        className="text-blue-500 transition-all"
        transform="rotate(-90 36 36)"
      />
    </svg>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/60 px-2 py-0.5 text-xs text-gray-600 backdrop-blur">
      {children}
    </span>
  )
}

// -----------------------------
// Home Page (Updated: "Lớp học của tôi")
// -----------------------------
export default function HomePage(): JSX.Element {
  // const { t } = useTranslation();
  const navigate = useNavigate()

  const { data: userData, isLoading: isLoadingUser } = useUserInfo()
  const { data: nextLesson, isLoading: isLoadingNextLesson } = useNextLesson()
  const { data: classrooms, isLoading: isLoadingClassrooms } = useMyClassrooms()
  const { data: dashboard, isLoading: isLoadingDashboard } =
    useStudentDashboard()

  const isLoading =
    isLoadingUser ||
    isLoadingNextLesson ||
    isLoadingClassrooms ||
    isLoadingDashboard

  // Sử dụng dashboard cho các thông tin tiến độ, level, coins, streak, xp nếu có
  const displayName = userData?.firstName ?? 'Học sinh'
  const top3 = useMemo(
    () => (dashboard?.leaderboard ? dashboard.leaderboard.slice(0, 3) : []),
    [dashboard]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero / Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-md">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm opacity-90">Chào buổi sáng</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
              {displayName}, sẵn sàng học tiếng Anh chưa?
            </h1>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20"></div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Continue / Next Lesson */}
          <button
            className="group w-full overflow-hidden rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
            onClick={() => {
              if (nextLesson?.id)
                navigate(
                  `/learn/${nextLesson.id}/${nextLesson.courseId}/${nextLesson.activity?.id}`
                )
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Bài học tiếp theo
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {nextLesson?.title || 'Chưa có bài học tiếp theo'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {nextLesson?.description || ''}
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-blue-600/10 px-4 py-3 text-blue-700">
                <PlayCircle className="h-6 w-6" />
                <span className="font-semibold">Tiếp tục học</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </button>

          {/* ✅ My Classrooms Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Lớp học của tôi
              </h2>
              {/* NOTE: user requested link to "/classroom" */}
              <Link
                to="/classroom"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {classrooms?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/classroom-detail/${c.id}`)}
                  className="group relative overflow-hidden rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                >
                  <div className="flex h-28 flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold leading-tight text-gray-900 line-clamp-2">
                        {c.name}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5" />
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {c._count.students ?? 0}/{c.maxStudents}
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {c._count.assignments ?? 0} bài tập
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {c?.teacher?.displayName || 'Giáo viên'}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Nhấn để vào chi tiết lớp
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {/* Pagination Controls */}
            {/* <div className="flex justify-center items-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={!hasPrevPage}
                onClick={() => setPage(page - 1)}
              >
                Trang trước
              </button>
              <span className="text-sm">Trang {page} / {totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                disabled={!hasNextPage}
                onClick={() => setPage(page + 1)}
              >
                Trang sau
              </button>
            </div> */}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Bảng xếp hạng tuần
              </h3>
              <Link
                to="/leaderboard"
                className="text-sm text-blue-600 hover:underline"
              >
                Xem thêm
              </Link>
            </div>
            <ol className="space-y-2">
              {top3.map((u, idx) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {u.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{u.xp} XP</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
