import {
  ArrowLeft,
  HelpCircle,
  History,
  Home,
  Settings,
  Volume2,
  X,
} from 'lucide-react'
import type { Activity, LessonMeta } from '../../../types/learn.type'
import type { JSX } from 'react'

export function TopBar({
  lesson,
  activity,
  onBack,
  onExit,
  onShowHistory,
}: {
  lesson?: LessonMeta
  activity?: Activity
  onBack: () => void
  onExit: () => void
  onShowHistory: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition flex-shrink-0"
          aria-label="Quay lại lớp học"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-hidden">
            <Home className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Lớp học</span>
            <span>›</span>
            <span className="hidden sm:inline truncate">
              {lesson?.title ?? 'Lesson'}
            </span>
            <span className="hidden sm:inline">›</span>
            <span className="font-medium text-gray-900 truncate">
              {activity?.title ?? 'Activity'}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] sm:text-xs text-gray-500 hidden sm:block">
            Hoàn thành để mở khóa hoạt động tiếp theo
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden sm:block"
          aria-label="Âm lượng"
        >
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden sm:block"
          aria-label="Trợ giúp"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={onShowHistory}
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
          aria-label="Lịch sử học tập"
          title="Xem lịch sử học tập"
        >
          <History className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden xs:block"
          aria-label="Cài đặt"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 whitespace-nowrap"
        >
          <span>Thoát</span>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
