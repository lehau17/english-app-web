import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import SessionDetailModal from '../components/schedule/SessionDetailModal'
import { useAuth } from '../context/AuthContext'
import { useStudentWeeklySchedule } from '../hooks/useStudentWeeklySchedule'
import type {
  StudentScheduleSession,
  StudentWeeklyScheduleDay,
} from '../types/student-schedule.type'

const DEFAULT_TIMEZONE = 'Asia_Ho_Chi_Minh'

const stateStyles: Record<
  StudentScheduleSession['state'],
  { label: string; text: string; bg: string }
> = {
  upcoming: {
    label: 'Sắp diễn ra',
    text: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  ongoing: {
    label: 'Đang diễn ra',
    text: 'text-green-700',
    bg: 'bg-green-100',
  },
  completed: {
    label: 'Đã kết thúc',
    text: 'text-gray-600',
    bg: 'bg-gray-100',
  },
  cancelled: {
    label: 'Đã hủy',
    text: 'text-red-700',
    bg: 'bg-red-100',
  },
  postponed: {
    label: 'Hoãn lại',
    text: 'text-amber-700',
    bg: 'bg-amber-100',
  },
}

const formatTimeRange = (
  start: string,
  end: string,
  timezone: string
): string => {
  const fmt = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone.replace('_', '/'),
  })
  const startLabel = fmt.format(new Date(start))
  const endLabel = fmt.format(new Date(end))
  return `${startLabel} - ${endLabel}`
}

const formatWeekRange = (startDate: Date, timezone: string) => {
  const start = new Date(startDate)
  const end = new Date(startDate)
  end.setDate(end.getDate() + 6)

  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: timezone.replace('_', '/'),
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

const getWeekStart = (date: Date) => {
  // Create a new date to avoid mutating the original
  const result = new Date(date.getTime())
  const day = result.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  console.log('🔧 getWeekStart Debug:')
  console.log('  Input date:', date.toISOString())
  console.log('  Day of week:', day, '(0=Sun, 1=Mon, 5=Fri)')

  // Calculate days to subtract to get to Monday (day 1)
  const daysToSubtract = day === 0 ? 6 : day - 1 // If Sunday (0), go back 6 days to Monday

  console.log('  Days to subtract:', daysToSubtract)

  result.setDate(result.getDate() - daysToSubtract)
  result.setHours(0, 0, 0, 0)

  console.log('  Result Monday:', result.toISOString())
  console.log(
    '  Expected for Oct 3: Should be 2025-09-30 (Monday of current week)'
  )

  return result
}

const WEEKDAYS = [
  { key: 'monday', label: 'Thứ 2' },
  { key: 'tuesday', label: 'Thứ 3' },
  { key: 'wednesday', label: 'Thứ 4' },
  { key: 'thursday', label: 'Thứ 5' },
  { key: 'friday', label: 'Thứ 6' },
  { key: 'saturday', label: 'Thứ 7' },
  { key: 'sunday', label: 'Chủ nhật' },
]

const TIME_PERIODS = [
  { key: 'morning', label: 'Sáng', startHour: 6, endHour: 12 },
  { key: 'afternoon', label: 'Chiều', startHour: 12, endHour: 18 },
  { key: 'evening', label: 'Tối', startHour: 18, endHour: 24 },
] as const

type TimePeriodKey = (typeof TIME_PERIODS)[number]['key']

const getDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

const SchedulePage = () => {
  const { user } = useAuth()
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getWeekStart(new Date())
  )
  const [selectedSession, setSelectedSession] =
    useState<StudentScheduleSession | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timezone = user?.timezone || DEFAULT_TIMEZONE

  const {
    data: weeklyData,
    isLoading: isLoadingWeekly,
    isFetching: isFetchingWeekly,
    refetch: refetchWeekly,
  } = useStudentWeeklySchedule(weekStartDate.toISOString(), {
    timezone,
  })

  // Debug logging - detailed
  console.log('🔍 FE Debug - SchedulePage:')
  console.log('  Current date (now):', new Date().toISOString())
  console.log('  Current day of week:', new Date().getDay()) // 0=Sunday, 5=Friday (today is Oct 3)
  console.log('  weekStartDate:', weekStartDate.toISOString())
  console.log('  weekStartDate day of week:', weekStartDate.getDay())
  console.log('  Sending to API:', weekStartDate.toISOString())

  // Manual calculation check for current week
  const today = new Date()
  const todayDay = today.getDay() // Should be 5 (Friday) for Oct 3
  const daysToMonday = todayDay === 0 ? 6 : todayDay - 1 // Should be 4 days back
  const expectedMonday = new Date(today)
  expectedMonday.setDate(today.getDate() - daysToMonday)
  expectedMonday.setHours(0, 0, 0, 0)

  console.log('  🧮 Manual calculation:')
  console.log('    Today is day:', todayDay, '(5=Friday)')
  console.log('    Days back to Monday:', daysToMonday, '(should be 4)')
  console.log('    Expected Monday:', expectedMonday.toISOString())
  console.log('    Expected Monday should be: 2025-09-30 (current week)')
  console.log('  ')
  console.log(
    '  PROBLEM: If weekStartDate is 2025-09-28, it means getWeekStart is wrong!'
  )
  console.log('    2025-09-28 is LAST Sunday, not this week!')
  console.log(
    '  Match check:',
    weekStartDate.getTime() === expectedMonday.getTime()
  )

  // Add function to force refresh to current week
  const goToCurrentWeek = () => {
    const currentWeekStart = getWeekStart(new Date())
    console.log(
      'Force refresh to current week:',
      currentWeekStart.toISOString()
    )
    setWeekStartDate(currentWeekStart)
  }

  // Auto-fix if weekStartDate is too old (temporary fix)
  const now = new Date()
  const daysDiff = Math.floor(
    (now.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysDiff > 7) {
    console.log(
      'weekStartDate is too old:',
      daysDiff,
      'days. Auto-correcting to current week.'
    )
    const correctedWeekStart = getWeekStart(now)
    if (weekStartDate.getTime() !== correctedWeekStart.getTime()) {
      setWeekStartDate(correctedWeekStart)
    }
  }

  const weekDates = useMemo(() => {
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [weekStartDate])

  const periodGridData = useMemo(() => {
    const base = TIME_PERIODS.reduce(
      (acc, period) => {
        acc[period.key] = WEEKDAYS.reduce(
          (dayAcc, weekday) => {
            dayAcc[weekday.key] = []
            return dayAcc
          },
          {} as Record<string, StudentScheduleSession[]>
        )
        return acc
      },
      {} as Record<TimePeriodKey, Record<string, StudentScheduleSession[]>>
    )

    if (!weeklyData) {
      return base
    }

    weeklyData.days.forEach((day: StudentWeeklyScheduleDay) => {
      const dayIndex = getDayOfWeek(day.date)
      const weekdayKey = WEEKDAYS[dayIndex]?.key
      if (!weekdayKey) return

      day.sessions.forEach((session) => {
        const sessionStartHour = new Date(session.startTime).getHours()
        const matchedPeriod =
          TIME_PERIODS.find(
            (period) =>
              sessionStartHour >= period.startHour &&
              sessionStartHour < period.endHour
          ) ?? TIME_PERIODS[TIME_PERIODS.length - 1]
        base[matchedPeriod.key][weekdayKey].push(session)
      })
    })

    return base
  }, [weeklyData])

  const handlePrevWeek = () => {
    const prevWeek = new Date(weekStartDate)
    prevWeek.setDate(prevWeek.getDate() - 7)
    setWeekStartDate(prevWeek)
  }

  const handleNextWeek = () => {
    const nextWeek = new Date(weekStartDate)
    nextWeek.setDate(nextWeek.getDate() + 7)
    setWeekStartDate(nextWeek)
  }

  const handleSessionClick = (session: StudentScheduleSession) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-blue-600">
            Lịch học
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Lịch học, lịch thi theo tuần
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {formatWeekRange(weekStartDate, timezone)} · Múi giờ{' '}
            {timezone.replace('_', '/')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center border-r border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Tuần trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center px-2 sm:px-3 flex-1 min-w-0">
              <CalendarDays className="mr-1 sm:mr-2 h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {formatWeekRange(weekStartDate, timezone)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Tuần sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={goToCurrentWeek}
              className="inline-flex h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2 sm:px-3 text-xs sm:text-sm font-medium text-blue-600 shadow-sm hover:bg-blue-100 flex-1 sm:flex-initial whitespace-nowrap"
            >
              <CalendarDays className="h-4 w-4 flex-shrink-0" />
              <span>Tuần hiện tại</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await refetchWeekly()
                  toast.success('Đã cập nhật lịch học theo tuần')
                } catch (error) {
                  toast.error('Không thể tải lại lịch học')
                }
              }}
              className="inline-flex h-10 items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-gray-200 bg-white px-2 sm:px-3 text-xs sm:text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 flex-1 sm:flex-initial whitespace-nowrap"
            >
              {isFetchingWeekly ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 flex-shrink-0" />
              )}
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoadingWeekly ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Đang tải lịch học theo tuần...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 border-b border-gray-100 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Tuần {formatWeekRange(weekStartDate, timezone)}
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-400">
                Tổng số buổi: {weeklyData?.summary?.totalSessions ?? 0}
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-2 sm:p-3 bg-yellow-100 border-r border-gray-200 text-xs sm:text-sm font-medium text-gray-700">
                    Ca học
                  </div>
                  {WEEKDAYS.map((weekday, index) => {
                    const date = weekDates[index]
                    const dateStr = date.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                    return (
                      <div
                        key={weekday.key}
                        className="p-2 sm:p-3 bg-blue-50 border-r border-gray-200 text-center"
                      >
                        <div className="text-xs sm:text-sm font-medium text-blue-700">
                          {weekday.label}
                        </div>
                        <div className="text-[10px] sm:text-xs text-blue-600">
                          {dateStr}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {TIME_PERIODS.map((period) => (
                  <div
                    key={period.key}
                    className="grid grid-cols-8 border-b border-gray-200"
                  >
                    <div className="p-2 sm:p-3 bg-yellow-100 border-r border-gray-200 text-center text-xs sm:text-sm font-medium text-gray-700">
                      {period.label}
                    </div>
                    {WEEKDAYS.map((weekday) => {
                      const sessions = periodGridData[period.key][weekday.key]

                      return (
                        <div
                          key={`${period.key}-${weekday.key}`}
                          className="min-h-[80px] sm:min-h-[96px] border-r border-gray-200 p-1.5 sm:p-2"
                        >
                          {sessions.length > 0 ? (
                            <div className="flex flex-col gap-1.5 sm:gap-2">
                              {sessions.map((session) => {
                                const style = stateStyles[session.state]
                                const sessionTimezone =
                                  session.timezone || timezone
                                const timeLabel = formatTimeRange(
                                  session.startTime,
                                  session.endTime,
                                  sessionTimezone
                                )

                                return (
                                  <div
                                    key={session.sessionId}
                                    onClick={() => handleSessionClick(session)}
                                    className="space-y-0.5 sm:space-y-1 rounded-md sm:rounded-lg border border-gray-100 bg-gray-50 p-1.5 sm:p-2 text-[10px] sm:text-xs text-gray-600 shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <p className="font-semibold text-gray-800 text-[10px] sm:text-xs leading-tight line-clamp-2">
                                        {session.title}
                                      </p>
                                      <span
                                        className={`inline-flex shrink-0 items-center rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold ${style.bg} ${style.text}`}
                                      >
                                        {style.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-gray-500">
                                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">
                                        {timeLabel}
                                      </span>
                                    </div>
                                    <div className="text-[9px] sm:text-[11px] text-gray-500 truncate">
                                      {session.classroomName}
                                    </div>
                                    {session.course && (
                                      <div className="text-[9px] sm:text-[11px] text-gray-600 font-medium truncate">
                                        {session.course.title}
                                      </div>
                                    )}
                                    {session.sessionSchedule && (
                                      <div className="text-[9px] sm:text-[11px] text-purple-600">
                                        Buổi{' '}
                                        {session.sessionSchedule.sessionNumber}
                                      </div>
                                    )}
                                    {session.activities &&
                                      session.activities.length > 0 && (
                                        <div className="text-[9px] sm:text-[11px] text-green-600">
                                          {session.activities.length} hoạt động
                                        </div>
                                      )}
                                    {session.instructor?.displayName && (
                                      <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] text-gray-500">
                                        <UserIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">
                                          {session.instructor.displayName}
                                        </span>
                                      </div>
                                    )}
                                    {session.meetingUrl && (
                                      <a
                                        href={session.meetingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="inline-flex items-center text-[9px] sm:text-[11px] font-medium text-blue-600 hover:underline"
                                      >
                                        Tham gia
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[9px] sm:text-[11px] text-gray-300">
                                Không có lịch
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <SessionDetailModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default SchedulePage
