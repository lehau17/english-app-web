import { CheckCircle, Clock, UserX, FileCheck } from 'lucide-react'

interface AttendanceSummaryProps {
  totalSessions: number
  present: number
  absent: number
  late: number
  excused: number
  attendanceRate: number
}

/**
 * Summary card showing overall attendance statistics
 */
export const AttendanceSummaryCard = ({
  totalSessions,
  present,
  absent,
  late,
  excused,
  attendanceRate,
}: AttendanceSummaryProps) => {
  const stats = [
    {
      label: 'Co mat',
      value: present,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Vang mat',
      value: absent,
      icon: UserX,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Di muon',
      value: late,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Co phep',
      value: excused,
      icon: FileCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Tong quan diem danh
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {attendanceRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Ty le chuyen can</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Tien do: {present + late}/{totalSessions} buoi
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          {present > 0 && (
            <div
              className="bg-green-500 h-full"
              style={{ width: `${(present / totalSessions) * 100}%` }}
            />
          )}
          {late > 0 && (
            <div
              className="bg-yellow-500 h-full"
              style={{ width: `${(late / totalSessions) * 100}%` }}
            />
          )}
          {excused > 0 && (
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${(excused / totalSessions) * 100}%` }}
            />
          )}
          {absent > 0 && (
            <div
              className="bg-red-500 h-full"
              style={{ width: `${(absent / totalSessions) * 100}%` }}
            />
          )}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Co mat
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Di muon
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Co phep
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Vang
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-lg p-4 text-center`}
            >
              <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
