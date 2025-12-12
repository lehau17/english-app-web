// Milestone Badges - Phase 5 Student UX
import React from 'react'

interface Milestone {
  percentage: number
  achieved: boolean
  unlockedAt?: string
}

interface MilestoneBadgesProps {
  milestones: Milestone[]
}

export const MilestoneBadges: React.FC<MilestoneBadgesProps> = ({
  milestones,
}) => {
  const getBadgeInfo = (percentage: number) => {
    switch (percentage) {
      case 25:
        return { name: 'Bronze', color: 'bg-amber-700', icon: '🥉' }
      case 50:
        return { name: 'Silver', color: 'bg-gray-400', icon: '🥈' }
      case 75:
        return { name: 'Gold', color: 'bg-yellow-500', icon: '🥇' }
      case 100:
        return { name: 'Platinum', color: 'bg-cyan-500', icon: '💎' }
      default:
        return { name: 'Unknown', color: 'bg-gray-500', icon: '?' }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Milestones
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {milestones.map((milestone) => {
          const badge = getBadgeInfo(milestone.percentage)
          return (
            <div
              key={milestone.percentage}
              className={`p-4 rounded-lg text-center transition-all duration-300 ${
                milestone.achieved
                  ? `${badge.color} text-white scale-105 shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{badge.icon}</div>
              <div className="font-semibold">{badge.name}</div>
              <div className="text-sm">{milestone.percentage}%</div>
              {milestone.achieved && milestone.unlockedAt && (
                <div className="text-xs mt-1 opacity-80">
                  {new Date(milestone.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MilestoneBadges
