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
  const result = new Date(date)
  const day = result.getDay() || 7
  if (day !== 1) {
    result.setDate(result.getDate() - (day - 1))
  }
  result.setHours(0, 0, 0, 0)
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
  const timezone = user?.timezone || DEFAULT_TIMEZONE

  const {
    data: weeklyData,
    isLoading: isLoadingWeekly,
    isFetching: isFetchingWeekly,
    refetch: refetchWeekly,
  } = useStudentWeeklySchedule(weekStartDate.toISOString(), {
    timezone,
  })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">Lịch học</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch học, lịch thi theo tuần
          </h1>
          <p className="text-sm text-gray-500">
            {formatWeekRange(weekStartDate, timezone)} · Múi giờ{' '}
            {timezone.replace('_', '/')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="inline-flex h-10 w-10 items-center justify-center border-r border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Tuần trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center px-3">
              <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">
                {formatWeekRange(weekStartDate, timezone)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="inline-flex h-10 w-10 items-center justify-center border-l border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="Tuần sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            {isFetchingWeekly ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Làm mới
          </button>
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
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
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
                  <div className="p-3 bg-yellow-100 border-r border-gray-200 text-sm font-medium text-gray-700">
                    Ca học
                  </div>
                  {WEEKDAYS.map((weekday, index) => {
                    const date = weekDates[index]
                    const dateStr = date.toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })
                    return (
                      <div
                        key={weekday.key}
                        className="p-3 bg-blue-50 border-r border-gray-200 text-center"
                      >
                        <div className="text-sm font-medium text-blue-700">
                          {weekday.label}
                        </div>
                        <div className="text-xs text-blue-600">{dateStr}</div>
                      </div>
                    )
                  })}
                </div>

                {TIME_PERIODS.map((period) => (
                  <div
                    key={period.key}
                    className="grid grid-cols-8 border-b border-gray-200"
                  >
                    <div className="p-3 bg-yellow-100 border-r border-gray-200 text-center text-sm font-medium text-gray-700">
                      {period.label}
                    </div>
                    {WEEKDAYS.map((weekday) => {
                      const sessions = periodGridData[period.key][weekday.key]

                      return (
                        <div
                          key={`${period.key}-${weekday.key}`}
                          className="min-h-[96px] border-r border-gray-200 p-2"
                        >
                          {sessions.length > 0 ? (
                            <div className="flex flex-col gap-2">
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
                                    className="space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs text-gray-600 shadow-sm"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-semibold text-gray-800">
                                        {session.title}
                                      </p>
                                      <span
                                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}
                                      >
                                        {style.label}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                      <Clock className="h-3 w-3 text-blue-500" />
                                      <span>
                                        {timeLabel} ·{' '}
                                        {sessionTimezone.replace('_', '/')}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-gray-500">
                                      {session.classroomName}
                                    </div>
                                    {session.instructor?.displayName && (
                                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <UserIcon className="h-3 w-3 text-gray-400" />
                                        <span>
                                          {session.instructor.displayName}
                                        </span>
                                      </div>
                                    )}
                                    {session.meetingUrl && (
                                      <a
                                        href={session.meetingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-[11px] font-medium text-blue-600 hover:underline"
                                      >
                                        Tham gia học
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[11px] text-gray-300">
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
    </div>
  )
}

export default SchedulePage
