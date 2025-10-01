import type { LucideIcon } from 'lucide-react'
import type { JSX } from 'react'

type StatPillProps = {
  icon: LucideIcon
  value: number | string
  label: string
  colorClass: string // ví dụ: text-blue-600
}

export default function StatPill({
  icon: Icon,
  value,
  label,
  colorClass,
}: StatPillProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <div className="leading-tight">
        <div className={`text-sm font-semibold ${colorClass}`}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}
