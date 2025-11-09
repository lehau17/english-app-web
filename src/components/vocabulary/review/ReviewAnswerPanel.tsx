import { Eye, Lightbulb, RotateCcw } from 'lucide-react'
import React from 'react'

interface ReviewAnswerPanelProps {
  userInput: string
  onInputChange: (value: string) => void
  onCheckAnswer: () => void
  onDontKnow: () => void
  onReset?: () => void
  disabled: boolean
  showResult: boolean
  isCorrect: boolean
}

export const ReviewAnswerPanel: React.FC<ReviewAnswerPanelProps> = ({
  userInput,
  onInputChange,
  onCheckAnswer,
  onDontKnow,
  onReset,
  disabled,
  showResult,
  isCorrect,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <p className="text-sm font-semibold">
            Gợi ý: Điền đáp án tiếng Anh vào ô bên dưới
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Đặt lại
          </button>
        )}
      </div>

      <input
        value={userInput}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && userInput.trim() && !disabled) {
            event.preventDefault()
            onCheckAnswer()
          }
        }}
        placeholder="Nhập đáp án của bạn (tiếng Anh)"
        className="w-full text-center text-base sm:text-lg font-semibold px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors disabled:bg-gray-100"
        disabled={disabled}
      />

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={onDontKnow}
          disabled={disabled}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-2xl shadow-md transition-colors"
        >
          <Eye className="h-4 w-4" />
          Không nhớ
        </button>

        <button
          onClick={onCheckAnswer}
          disabled={disabled || !userInput.trim()}
          className="flex-1 inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-2xl shadow-md transition-colors"
        >
          Kiểm tra đáp án
        </button>
      </div>

      {showResult && (
        <div
          className={`mt-4 rounded-2xl border-2 py-3 px-4 text-center font-semibold ${
            isCorrect
              ? 'border-green-200 bg-green-50 text-green-600'
              : 'border-red-200 bg-red-50 text-red-600'
          }`}
        >
          {isCorrect
            ? 'Tuyệt vời! Bạn đã trả lời đúng 👏'
            : 'Chưa đúng rồi, thử lại nhé!'}
        </div>
      )}
    </div>
  )
}
