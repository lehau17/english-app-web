import {
  BookOpen,
  ChevronRight,
  Coins,
  FileText,
  Flame,
  PlayCircle,
  Star,
  Trophy,
  Users,
} from 'lucide-react'
import React, { useMemo, type JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// -----------------------------
// Mock data (can be replaced by props / API)
// -----------------------------
const userData = {
  displayName: 'Bé Ong',
  level: 5,
  xp: 750,
  xpToNextLevel: 1000,
  streak: 12,
  coins: 250,
}

const nextLesson = {
  title: 'Bài 3: Màu sắc quanh ta',
  description: 'Học từ vựng về các màu sắc cơ bản',
  duration: '12 phút',
}

// ✅ Replace featured courses with "My Classrooms"
interface MyClassroomItem {
  id: string
  name: string
  teacherName: string
  students: number
  maxStudents: number
  assignments: number
}

const myClassrooms: MyClassroomItem[] = [
  {
    id: '1',
    name: 'Tiếng Anh Lớp 5A',
    teacherName: 'Cô Lan',
    students: 24,
    maxStudents: 30,
    assignments: 2,
  },
  {
    id: '2',
    name: 'Tiếng Anh Lớp 4B',
    teacherName: 'Thầy Minh',
    students: 22,
    maxStudents: 28,
    assignments: 5,
  },
  {
    id: '3',
    name: 'Luyện Thi Movers',
    teacherName: 'Cô Hương',
    students: 25,
    maxStudents: 25,
    assignments: 12,
  },
  {
    id: '4',
    name: 'Phát âm cơ bản',
    teacherName: 'Cô Mai',
    students: 18,
    maxStudents: 25,
    assignments: 3,
  },
  {
    id: '5',
    name: 'Từ vựng theo chủ đề',
    teacherName: 'Thầy Phong',
    students: 20,
    maxStudents: 30,
    assignments: 6,
  },
  {
    id: '6',
    name: 'Ngữ pháp nền tảng',
    teacherName: 'Cô Vy',
    students: 27,
    maxStudents: 30,
    assignments: 4,
  },
]

const dailyQuests = [
  { id: 'q1', text: 'Hoàn thành 1 bài học', done: true },
  { id: 'q2', text: 'Ôn tập 10 từ vựng', done: false },
  { id: 'q3', text: 'Duy trì chuỗi ngày học', done: false },
]

const leaderboard = [
  { id: 1, name: 'An', xp: 920 },
  { id: 2, name: 'Bình', xp: 870 },
  { id: 3, name: 'Chi', xp: 860 },
]

// -----------------------------
// Small UI Building Blocks
// -----------------------------
// function StatCard({
//   icon: Icon,
//   label,
//   value,
//   helper,
// }: {
//   icon: any;
//   label: string;
//   value: React.ReactNode;
//   helper?: string;
// }) {
//   return (
//     <div className="group relative overflow-hidden rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:shadow-md">
//       <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 opacity-0 transition group-hover:opacity-100" />
//       <div className="flex items-center gap-3">
//         <div className="rounded-xl bg-gray-900/90 p-2 text-white shadow-sm">
//           <Icon className="h-5 w-5" />
//         </div>
//         <div className="min-w-0">
//           <p className="truncate text-sm text-gray-500">{label}</p>
//           <div className="flex items-end gap-2">
//             <p className="text-xl font-semibold text-gray-900">{value}</p>
//             {helper && <span className="text-xs text-gray-400">{helper}</span>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
  const xpProgress = userData.xp / userData.xpToNextLevel
  const top3 = useMemo(() => leaderboard.slice(0, 3), [])

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
              {userData.displayName}, sẵn sàng học tiếng Anh chưa?
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Pill>
                <Flame className="h-4 w-4" /> {userData.streak} ngày liên tiếp
              </Pill>
              <Pill>
                <Coins className="h-4 w-4" /> {userData.coins} xu
              </Pill>
              <Pill>
                <Star className="h-4 w-4" /> Cấp độ {userData.level}
              </Pill>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20">
            <div className="text-center">
              <ProgressRing value={xpProgress} />
            </div>
            <div>
              <p className="text-sm/5 opacity-90">Tiến độ cấp độ</p>
              <p className="text-lg font-semibold">
                {userData.xp} / {userData.xpToNextLevel} XP
              </p>
              <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-white/80"
                  style={{ width: `${xpProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
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
              /* navigate to lesson */
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Bài học tiếp theo
                </p>
                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {nextLesson.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {nextLesson.description} · {nextLesson.duration}
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
              {myClassrooms.map((c) => (
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
                        {c.students}/{c.maxStudents}
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {c.assignments} bài tập
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {c.teacherName}
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-gray-500">
                      Nhấn để vào chi tiết lớp
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Daily Quests */}
          <div className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Nhiệm vụ hôm nay
              </h3>
              <Pill>
                <Flame className="h-4 w-4" /> +20 XP
              </Pill>
            </div>
            <ul className="space-y-2">
              {dailyQuests.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-gray-50 px-3 py-2"
                >
                  <span
                    className={`text-sm ${q.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
                  >
                    {q.text}
                  </span>
                  <input
                    type="checkbox"
                    checked={q.done}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-0"
                  />
                </li>
              ))}
            </ul>
          </div>

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

          {/* Announcements */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm ring-1 ring-amber-200">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <Trophy className="h-5 w-5" />
              <h3 className="text-base font-semibold">
                Sự kiện tuần: Thử thách 7 ngày
              </h3>
            </div>
            <p className="text-sm text-amber-800/90">
              Hoàn thành tối thiểu 1 bài học mỗi ngày để nhận huy hiệu đặc biệt
              và 200 xu. Tham gia ngay!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
