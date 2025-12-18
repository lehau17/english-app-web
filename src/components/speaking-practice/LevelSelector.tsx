import React from 'react'

interface LevelSelectorProps {
  currentLevel: number
  onSelectLevel: (level: number) => void
  unlockedLevels?: number[]
}

const LEVELS = [
  { level: 1, name: 'Words', description: 'Tu don' },
  { level: 2, name: 'Phrases', description: 'Cum tu' },
  { level: 3, name: 'Sentences', description: 'Cau hoan chinh' },
  { level: 4, name: 'Dialogues', description: 'Hoi thoai' },
  { level: 5, name: 'Free Talk', description: 'Noi tu do' },
]

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  unlockedLevels,
}) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {LEVELS.map(({ level, name, description }) => {
        const isUnlocked = (unlockedLevels ?? []).includes(level)
        const isCurrent = level === currentLevel

        return (
          <button
            key={level}
            onClick={() => isUnlocked && onSelectLevel(level)}
            disabled={!isUnlocked}
            className={`
              p-4 rounded-lg border-2 text-center transition-all
              ${isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              ${isUnlocked ? 'hover:border-blue-300 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
            `}
          >
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-gray-500">{description}</div>
            {!isUnlocked && (
              <div className="text-xs text-red-500 mt-1">Khoa</div>
            )}
          </button>
        )
      })}
    </div>
  )
}
