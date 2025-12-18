import React from 'react'
import type { SubmitResult } from '../../types/speaking-practice.types'

interface FeedbackPanelProps {
  result: SubmitResult
  onRetry: () => void
  onNext: () => void
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  result,
  onRetry,
  onNext,
}) => {
  const getBandColor = (band: string) => {
    switch (band) {
      case 'celebrate':
        return 'bg-green-100 border-green-500 text-green-800'
      case 'acknowledge':
        return 'bg-blue-100 border-blue-500 text-blue-800'
      case 'support':
        return 'bg-orange-100 border-orange-500 text-orange-800'
      default:
        return 'bg-gray-100 border-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* Score Display */}
      <div className="text-center">
        <div
          className={`text-5xl font-bold ${result.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}
        >
          {result.score}
        </div>
        <div className="text-gray-600">diem</div>
      </div>

      {/* Feedback Message */}
      <div
        className={`p-4 rounded-lg border-2 ${getBandColor(result.feedback.band)}`}
      >
        {result.feedback.text}
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Phat am:</span>
          <span className="font-bold ml-2">
            {result.breakdown.pronunciation}
          </span>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Chinh xac:</span>
          <span className="font-bold ml-2">{result.breakdown.accuracy}</span>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Luu loat:</span>
          <span className="font-bold ml-2">{result.breakdown.fluency}</span>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <span className="text-gray-600">Day du:</span>
          <span className="font-bold ml-2">
            {result.breakdown.completeness}
          </span>
        </div>
      </div>

      {/* Transcript */}
      <div className="p-3 bg-gray-50 rounded">
        <div className="text-xs text-gray-500 mb-1">Ban da noi:</div>
        <div className="text-sm">
          {result.transcript || 'Khong phat hien giong noi'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {result.nextAction === 'retry' && (
          <button
            onClick={onRetry}
            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thu lai
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {result.nextAction === 'level_up' ? 'Len cap!' : 'Tiep tuc'}
        </button>
      </div>
    </div>
  )
}
