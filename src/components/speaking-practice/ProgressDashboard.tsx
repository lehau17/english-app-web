import React from 'react'
import type { SpeakingPracticeProgress } from '../../types/speaking-practice.types'

interface ProgressDashboardProps {
  progress: SpeakingPracticeProgress
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Tien do cua ban</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {progress.currentLevel}
          </div>
          <div className="text-sm text-gray-600">Cap do hien tai</div>
          <div className="text-xs text-blue-500">
            {progress.currentLevelName}
          </div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {progress.successRate}%
          </div>
          <div className="text-sm text-gray-600">Ti le thanh cong</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">
            {progress.streakDays}
          </div>
          <div className="text-sm text-gray-600">Ngay lien tuc</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {progress.totalLessonsCompleted}
          </div>
          <div className="text-sm text-gray-600">Bai da hoan thanh</div>
        </div>
      </div>

      {progress.weakPhonemes.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm font-medium text-yellow-800">
            Can tap trung:
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {progress.weakPhonemes.map((phoneme) => (
              <span
                key={phoneme}
                className="px-2 py-1 bg-yellow-200 rounded text-sm"
              >
                {phoneme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
