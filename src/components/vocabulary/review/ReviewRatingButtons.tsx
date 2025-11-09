import { Star } from 'lucide-react'
import React from 'react'

interface ReviewRatingButtonsProps {
  onRate: (quality: number) => void
  disabled: boolean
}

const RATING_OPTIONS: Array<{
  quality: number
  label: string
  subLabel: string
  color: string
}> = [
  {
    quality: 0,
    label: 'Again',
    subLabel: 'Ôn lại ngay',
    color: 'bg-red-500 hover:bg-red-600',
  },
  {
    quality: 2,
    label: 'Hard',
    subLabel: 'Khá khó',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    quality: 4,
    label: 'Good',
    subLabel: 'Nhớ được',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    quality: 5,
    label: 'Easy',
    subLabel: 'Rất dễ',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
]

export const ReviewRatingButtons: React.FC<ReviewRatingButtonsProps> = ({
  onRate,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {RATING_OPTIONS.map((option) => (
        <button
          key={option.quality}
          onClick={() => onRate(option.quality)}
          disabled={disabled}
          className={`flex flex-col items-center gap-1 text-white font-semibold py-3 rounded-2xl shadow-md transition-all disabled:bg-gray-300 disabled:text-gray-100 ${option.color}`}
        >
          <div className="inline-flex items-center gap-1 text-base">
            <Star className="h-4 w-4" />
            {option.label}
          </div>
          <p className="text-xs opacity-80">{option.subLabel}</p>
        </button>
      ))}
    </div>
  )
}
