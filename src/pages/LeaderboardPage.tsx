import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  Crown,
  Medal,
  Search,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClassroomsGroupedByStatus } from '../hooks/useClassroomStatus'
import {
  useClassroomLeaderboard,
  useMonthlyLeaderboard,
  useYearlyLeaderboard,
} from '../hooks/useLeaderboard'

type LeaderboardTab = 'classroom' | 'monthly' | 'yearly'

const LeaderboardPage = () => {
  const { user } = useAuth()
  const role = user?.role

  // State
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('classroom')
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  )

  // Fetch classrooms
  const { groupedData, isLoading: isLoadingClassrooms } =
    useClassroomsGroupedByStatus(role, !!role)
  const classrooms = [
    ...(groupedData?.ongoing ?? []),
    ...(groupedData?.upcoming ?? []),
    ...(groupedData?.completed ?? []),
  ]

  // Set initial classroom
  useMemo(() => {
    if (!selectedClassId && classrooms.length > 0) {
      setSelectedClassId(classrooms[0].id)
    }
  }, [classrooms, selectedClassId])

  // Fetch leaderboard data based on active tab
  const {
    data: classroomLeaderboardData,
    isLoading: isLoadingClassroom,
    isError: isClassroomError,
  } = useClassroomLeaderboard({
    classroomId: selectedClassId,
    enabled: activeTab === 'classroom' && !!selectedClassId,
  })

  const {
    data: monthlyLeaderboardData,
    isLoading: isLoadingMonthly,
    isError: isMonthlyError,
  } = useMonthlyLeaderboard({
    year: selectedYear,
    month: selectedMonth,
    classroomId: selectedClassId,
    enabled: activeTab === 'monthly',
  })

  const {
    data: yearlyLeaderboardData,
    isLoading: isLoadingYearly,
    isError: isYearlyError,
  } = useYearlyLeaderboard({
    year: selectedYear,
    classroomId: selectedClassId,
    enabled: activeTab === 'yearly',
  })

  // Get current leaderboard data
  const currentData =
    activeTab === 'classroom'
      ? classroomLeaderboardData
      : activeTab === 'monthly'
        ? monthlyLeaderboardData
        : yearlyLeaderboardData

  const isLoading =
    activeTab === 'classroom'
      ? isLoadingClassroom
      : activeTab === 'monthly'
        ? isLoadingMonthly
        : isLoadingYearly

  const isError =
    activeTab === 'classroom'
      ? isClassroomError
      : activeTab === 'monthly'
        ? isMonthlyError
        : isYearlyError

  // Filter entries by search query
  const filteredEntries = useMemo(() => {
    const entries = currentData?.entries ?? []
    if (!searchQuery.trim()) return entries

    return entries.filter((entry) =>
      entry.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentData?.entries, searchQuery])

  // Find current user's rank
  const currentUserEntry = useMemo(() => {
    return filteredEntries.find((entry) => entry.userId === user?.id)
  }, [filteredEntries, user?.id])

  // Get medal for top 3
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500'
      case 2:
        return 'text-gray-400'
      case 3:
        return 'text-amber-600'
      default:
        return 'text-gray-400'
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6" />
      case 2:
        return <Medal className="h-6 w-6" />
      case 3:
        return <Medal className="h-6 w-6" />
      default:
        return null
    }
  }

  // Generate years for dropdown
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  }, [])

  // Generate months for dropdown
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Bảng Xếp Hạng</h1>
          </div>
          <p className="text-gray-600">
            Theo dõi thành tích và xếp hạng của bạn trong hệ thống
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'classroom'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5" />
            Theo Lớp
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            Theo Tháng
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition whitespace-nowrap ${
              activeTab === 'yearly'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Theo Năm
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Classroom Selector */}
          {classrooms.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lớp học
              </label>
              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  {classrooms.map((classroom: any) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Year Selector */}
          {(activeTab === 'monthly' || activeTab === 'yearly') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Month Selector */}
          {activeTab === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tháng
              </label>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên học viên..."
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
          </div>
        </div>

        {/* Current User Stats Card */}
        {currentUserEntry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUserEntry.avatarUrl || '/default-avatar.png'}
                    alt={currentUserEntry.displayName}
                    className="h-16 w-16 rounded-full border-4 border-white shadow-lg"
                  />
                  {currentUserEntry.rank <= 3 && (
                    <div className="absolute -top-2 -right-2">
                      {getMedalIcon(currentUserEntry.rank)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm opacity-90">Xếp hạng của bạn</p>
                  <p className="text-2xl font-bold">
                    {currentUserEntry.displayName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Hạng</p>
                <p className="text-4xl font-bold">#{currentUserEntry.rank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Điểm</p>
                <p className="text-4xl font-bold">
                  {currentUserEntry.totalScore}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="rounded-2xl bg-white shadow-lg p-6">
          {isLoadingClassrooms || isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Đang tải bảng xếp hạng...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-red-100 p-4 mb-4">
                <Trophy className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-gray-900 font-medium">
                Không thể tải bảng xếp hạng
              </p>
              <p className="text-sm text-gray-600 mt-1">Vui lòng thử lại sau</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">
                {searchQuery
                  ? 'Không tìm thấy kết quả'
                  : 'Chưa có dữ liệu xếp hạng'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Hãy hoàn thành bài tập để được xếp hạng'}
              </p>
            </div>
          ) : (
            <>
              {/* Top 1 Winner - Special Highlight */}
              {filteredEntries[0] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 p-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        {/* Crown Icon */}
                        <div className="relative">
                          <div className="absolute -top-8 -left-2 animate-bounce">
                            <Crown className="h-10 w-10 text-white drop-shadow-lg" />
                          </div>
                          <img
                            src={
                              filteredEntries[0].avatarUrl ||
                              '/default-avatar.png'
                            }
                            alt={filteredEntries[0].displayName}
                            className="h-24 w-24 rounded-full border-4 border-white shadow-2xl"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white/90 mb-1">
                            🏆 QUÁN QUÂN
                          </p>
                          <p className="text-3xl font-bold text-white mb-1">
                            {filteredEntries[0].displayName}
                            {filteredEntries[0].userId === user?.id && (
                              <span className="ml-3 text-sm bg-white/20 text-white px-3 py-1 rounded-full">
                                Bạn
                              </span>
                            )}
                          </p>
                          <p className="text-white/80 text-sm">
                            Xuất sắc nhất kỳ này
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/90 text-sm mb-1">Tổng điểm</p>
                        <p className="text-5xl font-bold text-white drop-shadow-lg">
                          {filteredEntries[0].totalScore}
                        </p>
                        <p className="text-white/80 text-sm mt-1">điểm</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Remaining Rankings */}
              {filteredEntries.length > 1 && (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredEntries.slice(1).map((entry, index) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between rounded-xl p-4 transition ${
                          entry.userId === user?.id
                            ? 'bg-blue-50 border-2 border-blue-500 shadow-md'
                            : entry.rank === 2
                              ? 'bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300'
                              : entry.rank === 3
                                ? 'bg-gradient-to-r from-orange-50 to-amber-100 border border-orange-200'
                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Rank */}
                          <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full font-bold ${
                              entry.rank === 2
                                ? 'bg-gray-400 text-white'
                                : entry.rank === 3
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {entry.rank === 2 || entry.rank === 3 ? (
                              <div className={getMedalColor(entry.rank)}>
                                {getMedalIcon(entry.rank)}
                              </div>
                            ) : (
                              `#${entry.rank}`
                            )}
                          </div>

                          {/* Avatar & Name */}
                          <div className="flex items-center gap-3 flex-1">
                            <img
                              src={entry.avatarUrl || '/default-avatar.png'}
                              alt={entry.displayName}
                              className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {entry.displayName}
                                {entry.userId === user?.id && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    Bạn
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                {entry.rank === 2
                                  ? 'Á quân 🥈'
                                  : entry.rank === 3
                                    ? 'Hạng Ba 🥉'
                                    : `Hạng ${entry.rank}`}
                              </p>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {entry.totalScore}
                            </p>
                            <p className="text-xs text-gray-500">điểm</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardPage
