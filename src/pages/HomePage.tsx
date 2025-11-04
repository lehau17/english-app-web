import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Crown,
  FileText,
  Globe,
  PlayCircle,
  Users,
} from 'lucide-react'
import { type JSX, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DirectPaymentModal } from '../components/classroom/DirectPaymentModal'
import { PaymentNotificationModal } from '../components/classroom/PaymentNotificationModal'
import { WordOfTheDayWidget } from '../components/WordOfTheDayWidget'
import {
  getPaymentStatusDisplayInfo,
  getStatusDisplayInfo,
  useClassroomsGroupedByStatus,
} from '../hooks/useClassroomStatus'
import { useHasParent } from '../hooks/useHasParent'
import { useClassroomLeaderboard } from '../hooks/useLeaderboard'
import { useNextLesson } from '../hooks/useNextLesson'
import { usePaymentFlow } from '../hooks/usePaymentFlow'
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

  // Check if student has parent (only for students)
  const { data: parentStatus } = useHasParent(isStudent)

  const {
    groupedData: classroomsGrouped,
    counts: classroomCounts,
    isLoading: isLoadingClassrooms,
  } = useClassroomsGroupedByStatus(role, !!role)

  const classrooms = classroomsGrouped
    ? [
        ...classroomsGrouped.ongoing,
        ...classroomsGrouped.upcoming,
        ...classroomsGrouped.completed,
        ...classroomsGrouped.unpaid,
      ]
    : []

  // Tabs for filtering classrooms
  const [activeTab, setActiveTab] = useState<
    'all' | 'ongoing' | 'upcoming' | 'completed' | 'unpaid'
  >('all')

  // Payment flow
  const {
    selectedClassroom: paymentClassroom,
    showPaymentModal: showPaymentNotification,
    showDirectPaymentModal,
    handleClassroomClick,
    closePaymentModal: closePaymentNotification,
    closeDirectPaymentModal,
  } = usePaymentFlow()

  const { data: nextLesson, isLoading: isLoadingNextLesson } = useNextLesson(
    !!role && isStudent
  )

  const primaryClassroom = classrooms[0]
  const [selectedClassId, setSelectedClassId] = useState<string>(
    primaryClassroom?.id ?? ''
  )

  // Get classrooms for current tab
  const getClassroomsForTab = () => {
    if (!classroomsGrouped) return []
    switch (activeTab) {
      case 'ongoing':
        return classroomsGrouped.ongoing
      case 'upcoming':
        return classroomsGrouped.upcoming
      case 'completed':
        return classroomsGrouped.completed
      case 'unpaid':
        return classroomsGrouped.unpaid
      default:
        return classrooms
    }
  }

  const currentTabClassrooms = getClassroomsForTab()

  useEffect(() => {
    if (classrooms.length === 0) {
      setSelectedClassId('')
      return
    }

    const exists = classrooms.some((c) => c.id === selectedClassId)
    if ((!selectedClassId || !exists) && classrooms[0]?.id) {
      setSelectedClassId(classrooms[0].id)
    }
  }, [classrooms, selectedClassId])

  const now = useMemo(() => new Date(), [])
  const [periodType, setPeriodType] = useState<'month' | 'all'>('month')
  const [selectedMonth, setSelectedMonth] = useState<number>(
    now.getUTCMonth() + 1
  )
  const [selectedYear, setSelectedYear] = useState<number>(now.getUTCFullYear())

  const allTimeRange = useMemo(
    () => ({
      from: '1970-01-01T00:00:00.000Z',
      to: new Date().toISOString(),
    }),
    []
  )

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: `Tháng ${index + 1}`,
      })),
    []
  )

  const yearOptions = useMemo(() => {
    const current = new Date().getUTCFullYear()
    return Array.from({ length: 6 }, (_, index) => current - index)
  }, [])

  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    isError: isLeaderboardError,
  } = useClassroomLeaderboard({
    classroomId: selectedClassId,
    year: periodType === 'month' ? selectedYear : undefined,
    month: periodType === 'month' ? selectedMonth : undefined,
    from: periodType === 'all' ? allTimeRange.from : undefined,
    to: periodType === 'all' ? allTimeRange.to : undefined,
    enabled: !!selectedClassId && (isStudent || isTeacher),
  })

  const leaderboardEntries = leaderboardData?.entries ?? []

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

  const noLeaderboardMessage = !selectedClassId
    ? classrooms.length === 0
      ? isTeacher
        ? 'Bạn chưa có lớp để hiển thị bảng xếp hạng.'
        : 'Tham gia một lớp học để xem bảng xếp hạng của bạn.'
      : 'Hãy chọn một lớp để xem bảng xếp hạng.'
    : 'Chưa có dữ liệu hiển thị cho bộ lọc này.'

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

            {/* Classroom Tabs */}
            {classrooms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">Tất cả </span>
                  <span>({classroomCounts?.total || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('ongoing')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'ongoing'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="hidden sm:inline">Đang diễn ra </span>
                  <span>({classroomCounts?.ongoing || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'upcoming'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="hidden sm:inline">Sắp diễn ra </span>
                  <span>({classroomCounts?.upcoming || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'completed'
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="hidden sm:inline">Hoàn thành </span>
                  <span>({classroomCounts?.completed || 0})</span>
                </button>
                {isStudent && classroomCounts && classroomCounts.unpaid > 0 && (
                  <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'unpaid'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    <span className="hidden sm:inline">Chưa thanh toán </span>
                    <span>({classroomCounts.unpaid})</span>
                  </button>
                )}
              </div>
            )}

            {currentTabClassrooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                {activeTab === 'all'
                  ? emptyClassMessage
                  : `Không có lớp học nào ${activeTab === 'ongoing' ? 'đang diễn ra' : activeTab === 'upcoming' ? 'sắp diễn ra' : activeTab === 'completed' ? 'đã hoàn thành' : 'chưa thanh toán'}.`}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {currentTabClassrooms.map((c) => {
                  const studentCount =
                    c._count?.students ?? c.students?.length ?? 0
                  const assignmentCount = c._count?.assignments ?? 0
                  const thirdLabel = isTeacher
                    ? `Mã lớp: ${c.classCode ?? '—'}`
                    : c.teacher?.displayName || 'Giáo viên'

                  const statusInfo = getStatusDisplayInfo(c.status)
                  const paymentInfo = getPaymentStatusDisplayInfo(
                    c.needsPayment || false,
                    c.isPurchased || false
                  )

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        // Check if payment is required and handle accordingly
                        const shouldShowPaymentModal = handleClassroomClick(
                          c,
                          parentStatus?.hasParent
                        )
                        if (!shouldShowPaymentModal) {
                          navigate(`/classroom-detail/${c.id}`)
                        }
                      }}
                      className={`group relative overflow-hidden rounded-2xl p-5 text-left shadow-sm ring-1 transition hover:shadow-md ${
                        c.needsPayment && !c.isPurchased
                          ? 'bg-yellow-50 ring-yellow-200 border border-yellow-200'
                          : 'bg-white ring-black/5'
                      }`}
                    >
                      <div className="flex h-32 flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold leading-tight text-gray-900 line-clamp-2">
                            {c.name}
                          </h3>
                          <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5" />
                        </div>

                        {/* Status badges */}
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}
                          >
                            {statusInfo.label}
                          </span>
                          {isStudent && c.needsPayment && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${paymentInfo.bgColor} ${paymentInfo.textColor}`}
                            >
                              {paymentInfo.label}
                            </span>
                          )}
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
                          <div className="inline-flex items-center gap-1 truncate">
                            <BookOpen className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{thirdLabel}</span>
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
          {/* Word of the Day Widget */}
          <WordOfTheDayWidget />

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  Bảng Xếp Hạng
                </h3>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-105"
                >
                  Xem tất cả
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Filters Section */}
              <div className="flex flex-col gap-3">
                {/* Row 1: Classroom selector */}
                {classrooms.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide sm:min-w-[60px]">
                      Lớp học:
                    </span>
                    <select
                      value={selectedClassId}
                      onChange={(event) =>
                        setSelectedClassId(event.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-label="Chọn lớp"
                    >
                      {classrooms.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Row 2: Period filters */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide sm:min-w-[60px]">
                    Thời gian:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <select
                        value={periodType}
                        onChange={(event) =>
                          setPeriodType(event.target.value as 'month' | 'all')
                        }
                        className="rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 pl-9 pr-8 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none"
                        aria-label="Chọn khoảng thời gian"
                      >
                        <option value="month">Theo tháng</option>
                        <option value="all">Toàn bộ</option>
                      </select>
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {periodType === 'month' ? (
                          <Calendar className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Globe className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>

                    {periodType === 'month' && (
                      <>
                        <select
                          value={selectedMonth}
                          onChange={(event) =>
                            setSelectedMonth(Number(event.target.value))
                          }
                          className="rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          aria-label="Chọn tháng"
                        >
                          {monthOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedYear}
                          onChange={(event) =>
                            setSelectedYear(Number(event.target.value))
                          }
                          className="rounded-lg border border-gray-300 bg-gradient-to-br from-white to-gray-50 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                          aria-label="Chọn năm"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!selectedClassId ? (
              <p className="text-sm text-gray-500">{noLeaderboardMessage}</p>
            ) : isLoadingLeaderboard ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                Đang tải bảng xếp hạng...
              </div>
            ) : isLeaderboardError ? (
              <p className="text-sm text-red-500">
                Không thể tải bảng xếp hạng. Vui lòng thử lại sau.
              </p>
            ) : leaderboardEntries.length === 0 ? (
              <p className="text-sm text-gray-500">{noLeaderboardMessage}</p>
            ) : (
              <div className="space-y-4">
                {/* Top 3 Podium - Always show top performers */}
                {leaderboardEntries.length > 0 && (
                  <div
                    className={`mb-6 ${
                      leaderboardEntries.length === 1
                        ? 'flex justify-center'
                        : leaderboardEntries.length === 2
                          ? 'grid grid-cols-2 gap-4'
                          : 'grid grid-cols-3 gap-3'
                    }`}
                  >
                    {/* 2nd Place (only if exists and we have 3+ people) */}
                    {leaderboardEntries.length >= 3 &&
                      leaderboardEntries[1] && (
                        <div className="flex flex-col items-center pt-8">
                          <div className="relative mb-3">
                            <img
                              src={
                                leaderboardEntries[1].avatarUrl ||
                                '/default-avatar.png'
                              }
                              alt={leaderboardEntries[1].displayName}
                              className="h-16 w-16 rounded-full border-4 border-gray-300 shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-white shadow-lg">
                              <span className="text-lg">🥈</span>
                            </div>
                          </div>
                          <div className="w-full rounded-t-xl bg-gradient-to-t from-gray-300 to-gray-400 p-4 text-center shadow-lg">
                            <p className="text-xs font-bold text-white mb-1 truncate">
                              {leaderboardEntries[1].displayName}
                            </p>
                            <p className="text-xl font-bold text-white">
                              {Number(
                                leaderboardEntries[1].totalScore ?? 0
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/80">điểm</p>
                          </div>
                        </div>
                      )}

                    {/* 1st Place - Always show if we have any data */}
                    {leaderboardEntries[0] && (
                      <div
                        className={`flex flex-col items-center ${
                          leaderboardEntries.length === 1 ? 'w-64' : ''
                        }`}
                      >
                        <div className="relative mb-3">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                            <Crown className="h-8 w-8 text-yellow-500 drop-shadow-lg" />
                          </div>
                          <img
                            src={
                              leaderboardEntries[0].avatarUrl ||
                              '/default-avatar.png'
                            }
                            alt={leaderboardEntries[0].displayName}
                            className="h-20 w-20 rounded-full border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-200"
                          />
                          <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500 text-white shadow-xl">
                            <span className="text-xl">🥇</span>
                          </div>
                        </div>
                        <div className="w-full rounded-t-xl bg-gradient-to-t from-yellow-400 via-yellow-500 to-yellow-600 p-5 text-center shadow-2xl">
                          <p className="text-sm font-bold text-white mb-1 truncate">
                            {leaderboardEntries[0].displayName}
                          </p>
                          <p className="text-2xl font-bold text-white">
                            {Number(
                              leaderboardEntries[0].totalScore ?? 0
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-white/90">điểm</p>
                        </div>
                      </div>
                    )}

                    {/* 2nd Place (when only 2 people) */}
                    {leaderboardEntries.length === 2 &&
                      leaderboardEntries[1] && (
                        <div className="flex flex-col items-center pt-4">
                          <div className="relative mb-3">
                            <img
                              src={
                                leaderboardEntries[1].avatarUrl ||
                                '/default-avatar.png'
                              }
                              alt={leaderboardEntries[1].displayName}
                              className="h-16 w-16 rounded-full border-4 border-gray-300 shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-white shadow-lg">
                              <span className="text-lg">🥈</span>
                            </div>
                          </div>
                          <div className="w-full rounded-t-xl bg-gradient-to-t from-gray-300 to-gray-400 p-4 text-center shadow-lg">
                            <p className="text-xs font-bold text-white mb-1 truncate">
                              {leaderboardEntries[1].displayName}
                            </p>
                            <p className="text-xl font-bold text-white">
                              {Number(
                                leaderboardEntries[1].totalScore ?? 0
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/80">điểm</p>
                          </div>
                        </div>
                      )}

                    {/* 3rd Place (only when we have 3+ people) */}
                    {leaderboardEntries.length >= 3 &&
                      leaderboardEntries[2] && (
                        <div className="flex flex-col items-center pt-12">
                          <div className="relative mb-3">
                            <img
                              src={
                                leaderboardEntries[2].avatarUrl ||
                                '/default-avatar.png'
                              }
                              alt={leaderboardEntries[2].displayName}
                              className="h-14 w-14 rounded-full border-4 border-amber-600 shadow-lg"
                            />
                            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg">
                              <span className="text-base">🥉</span>
                            </div>
                          </div>
                          <div className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-amber-600 p-3 text-center shadow-lg">
                            <p className="text-xs font-bold text-white mb-1 truncate">
                              {leaderboardEntries[2].displayName}
                            </p>
                            <p className="text-lg font-bold text-white">
                              {Number(
                                leaderboardEntries[2].totalScore ?? 0
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/80">điểm</p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Remaining Rankings */}
                {leaderboardEntries.slice(3, 8).map((item) => (
                  <div
                    key={`${item.userId}-${item.rank}`}
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 font-bold text-gray-700 transition group-hover:from-blue-100 group-hover:to-blue-200">
                        #{item.rank}
                      </div>
                      <img
                        src={item.avatarUrl || '/default-avatar.png'}
                        alt={item.displayName}
                        className="h-10 w-10 rounded-full border-2 border-gray-200 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {item.displayName || 'Chưa rõ'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Hạng {item.rank}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {Number(item.totalScore ?? 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">điểm</p>
                    </div>
                  </div>
                ))}

                {/* Show remaining count if more than 8 */}
                {leaderboardEntries.length > 8 && (
                  <div className="text-center">
                    <Link
                      to="/leaderboard"
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Và {leaderboardEntries.length - 8} người khác
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
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

      {/* Payment Notification Modal (for students with parents) */}
      {paymentClassroom && (
        <PaymentNotificationModal
          isOpen={showPaymentNotification}
          onClose={closePaymentNotification}
          classroom={{
            id: paymentClassroom.id,
            name: paymentClassroom.name,
            course: paymentClassroom.course
              ? {
                  id: paymentClassroom.course.id,
                  title: paymentClassroom.course.title,
                  price: paymentClassroom.course.price || 0,
                  currency: paymentClassroom.course.currency,
                }
              : undefined,
            teacher: paymentClassroom.teacher
              ? {
                  displayName: paymentClassroom.teacher.displayName,
                }
              : undefined,
          }}
        />
      )}

      {/* Direct Payment Modal (for students without parents) */}
      {paymentClassroom && (
        <DirectPaymentModal
          isOpen={showDirectPaymentModal}
          onClose={closeDirectPaymentModal}
          classroom={{
            id: paymentClassroom.id,
            name: paymentClassroom.name,
            course: paymentClassroom.course
              ? {
                  id: paymentClassroom.course.id,
                  title: paymentClassroom.course.title,
                  price: paymentClassroom.course.price || 0,
                  currency: paymentClassroom.course.currency,
                }
              : undefined,
            teacher: paymentClassroom.teacher
              ? {
                  displayName: paymentClassroom.teacher.displayName,
                }
              : undefined,
          }}
        />
      )}
    </div>
  )
}
