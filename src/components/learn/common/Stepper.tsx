import { CheckCircle2, RotateCcw } from 'lucide-react'
import type { Activity } from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'
import type { JSX } from 'react'

export function Stepper({
  items,
  activeId,
  onJump,
  isPreviewMode = false,
}: {
  items: Activity[]
  activeId?: string
  onJump: (id: string) => void
  isPreviewMode?: boolean
}): JSX.Element {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3">
        <div className="text-xs sm:text-sm text-gray-500 text-center">
          Không có hoạt động nào
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        {items
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((a) => {
            const isActive = a.id === activeId
            const done = a.state === 'done' || a.state === 'mastered'
            const isReviewNeeded = a.state === 'review_needed'
            // In preview mode, allow access to all activities
            const canAccess =
              isPreviewMode ||
              done ||
              a.state === 'in_progress' ||
              isReviewNeeded
            return (
              <button
                key={a.id}
                onClick={() => canAccess && onJump(a.id)}
                title={
                  !canAccess
                    ? 'Hoàn thành các hoạt động trước đó để truy cập'
                    : a.title
                }
                className={classNames(
                  'group flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition flex-shrink-0',
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isReviewNeeded
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : canAccess
                        ? 'border-gray-200 bg-white hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={!canAccess}
              >
                <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] sm:text-xs font-medium flex-shrink-0">
                  {a.orderNo}
                </span>
                <span className="whitespace-nowrap truncate">{a.title}</span>
                {done && (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                )}
                {isReviewNeeded && (
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                )}
              </button>
            )
          })}
      </div>
    </div>
  )
}
