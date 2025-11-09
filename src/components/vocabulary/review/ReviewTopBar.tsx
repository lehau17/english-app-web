import { ArrowLeft } from 'lucide-react'
import React from 'react'

interface ReviewTopBarProps {
  onBack: () => void
  currentIndex: number
  totalCards: number
  progress: number
}

export const ReviewTopBar: React.FC<ReviewTopBarProps> = ({
  onBack,
  currentIndex,
  totalCards,
  progress,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Quay lại</span>
          </button>

          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">
              Đang ôn tập
            </p>
            <p className="text-sm sm:text-base text-gray-700 font-semibold">
              {currentIndex + 1}/{totalCards} thẻ
            </p>
          </div>
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
