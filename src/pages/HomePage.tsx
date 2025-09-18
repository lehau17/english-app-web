import {
  BookOpen,
  ChevronRight,
  Crown,
  FileText,
  PlayCircle,
  Users,
} from 'lucide-react'
import { type JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMyClassrooms } from '../hooks/useMyClassrooms'
import { useNextLesson } from '../hooks/useNextLesson'
import { useUserInfo } from '../hooks/useUserInfo'

const LoadingState = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500" />
  </div>
)

export default function HomePage(): JSX.Element {
  const navigate = useNavigate()

  const { data: userData, isLoading: isLoadingUser } = useUserInfo()

  const role = userData?.role
  const isStudent = role === 'student'
  const isTeacher = role === 'teacher'

  const { data: classroomsData, isLoading: isLoadingClassrooms } =
    useMyClassrooms(role, !!role)

  const { data: nextLesson, isLoading: isLoadingNextLesson } = useNextLesson(
    !!role && isStudent
  )

  const classrooms = classroomsData ?? []

  const waitingForUser = isLoadingUser || !role
  const isLoading =
    waitingForUser || isLoadingClassrooms || (isStudent && isLoadingNextLesson)

  if (isLoading) {
    return <LoadingState />
  }

  const displayName =
    userData?.displayName ||
    `${userData?.firstName ?? ''} ${userData?.lastName ?? ''}`.trim() ||
    (isTeacher ? 'Giáo viên' : 'Học sinh')

  const heroGreeting = isTeacher ? 'Chào thầy/cô' : 'Chào bạn'
  const heroHeadline = isTeacher
    ? `${displayName}, sẵn sàng giảng dạy hôm nay?`
    : `${displayName}, sẵn sàng học tiếng Anh chưa?`
  const heroSub = isTeacher
    ? 'Quản lý lớp học, giao bài và theo dõi tiến độ học viên ngay tại đây.'
    : 'Tiếp tục bài học và khám phá lớp học mà bạn đang tham gia.'

  const classroomSectionTitle = isTeacher
    ? 'Lớp đang giảng dạy'
    : 'Lớp học của tôi'

  const emptyClassMessage = isTeacher
    ? 'Bạn chưa được phân công lớp nào. Hãy liên hệ quản trị viên để được cấp lớp.'
    : 'Bạn chưa tham gia lớp nào. Hãy liên hệ giáo viên để được thêm vào lớp học.'

  const leaderboard = isStudent
    ? [
        { id: 'student-1', name: 'Bé Ong', xp: 480 },
        { id: 'student-2', name: 'Bé Gấu', xp: 430 },
        { id: 'student-3', name: 'Bé Thỏ', xp: 405 },
      ]
    : [
        { id: 'teacher-1', name: 'Cô Lan', summary: 'Lớp 5A • 28 học viên' },
        { id: 'teacher-2', name: 'Thầy Minh', summary: 'Lớp 4B • 24 học viên' },
      ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-md">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm opacity-85">{heroGreeting}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
              {heroHeadline}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium opacity-80">
              {heroSub}
            </p>
          </div>

          {isTeacher ? (
            <button
              onClick={() => navigate('/classroom')}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Users className="h-5 w-5" />
              Quản lý lớp học
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20" />
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {isStudent && (
            <button
              className="group w-full overflow-hidden rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              onClick={() => {
                if (nextLesson?.id && nextLesson?.activity?.id) {
                  navigate(
                    `/learn/${nextLesson.id}/${nextLesson.courseId}/${nextLesson.activity.id}`
                  )
                }
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
                  {nextLesson?.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {nextLesson.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-blue-600/10 px-4 py-3 text-blue-700">
                  <PlayCircle className="h-6 w-6" />
                  <span className="font-semibold">Tiếp tục học</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          )}

          {!isStudent && (
            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Trung tâm giảng dạy
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">
                    Theo dõi lớp học và giao bài cho học viên
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Xem danh sách lớp bạn phụ trách và truy cập nhanh vào trang
                    quản lý lớp.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/classroom')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Users className="h-5 w-5" />
                  Đi tới quản lý lớp
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {classroomSectionTitle}
              </h2>
              <Link
                to="/classroom"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            {classrooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                {emptyClassMessage}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {classrooms.map((c) => {
                  const studentCount = c._count?.students ?? c.students ?? 0
                  const assignmentCount =
                    c._count?.assignments ?? c.assignments ?? 0
                  const thirdLabel = isTeacher
                    ? `Mã lớp: ${c.classCode ?? '—'}`
                    : c.teacher?.displayName || c.teacherName || 'Giáo viên'

                  return (
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
                            {studentCount}/{c.maxStudents ?? '--'}
                          </div>
                          <div className="inline-flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {assignmentCount} bài tập
                          </div>
                          <div className="inline-flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {thirdLabel}
                          </div>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Nhấn để vào chi tiết lớp
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Crown className="h-5 w-5 text-yellow-500" />
              {isTeacher ? 'Giáo viên nổi bật' : 'Bảng xếp hạng tuần này'}
            </h3>

            {leaderboard.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có dữ liệu hiển thị.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-gray-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="mb-3 text-base font-semibold text-gray-900">
              {isTeacher ? 'Gợi ý giảng dạy' : 'Mẹo học tập nhanh'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {isTeacher ? (
                <>
                  <li>• Kiểm tra bài tập và phản hồi học viên mỗi tuần.</li>
                  <li>• Sử dụng thông báo để nhắc học viên hoàn thành bài.</li>
                  <li>• Cập nhật mô tả lớp để học viên nắm lịch học.</li>
                </>
              ) : (
                <>
                  <li>• Ôn lại từ mới bằng flashcard sau mỗi bài học.</li>
                  <li>• Duy trì thói quen học 15 phút mỗi ngày.</li>
                  <li>• Tham gia thảo luận lớp để luyện kỹ năng nói.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
