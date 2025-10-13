import { motion } from 'framer-motion'
import { Check, Lock, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

// Types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond'
  category: 'vocab' | 'quiz' | 'games' | 'streak' | 'mastery'
  requirement: number
  progress: number
  unlocked: boolean
  unlockedAt?: Date
}

interface AchievementSystemProps {
  achievements: Achievement[]
  onClose: () => void
  onPlaySound: (sound: 'click' | 'correct' | 'celebration' | 'star') => void
}

interface AchievementNotificationProps {
  achievement: Achievement
  onClose: () => void
  onPlaySound: (sound: 'celebration' | 'star') => void
}

const RARITY_CONFIG = {
  bronze: {
    color: 'from-orange-400 to-amber-600',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '🥉',
  },
  silver: {
    color: 'from-gray-300 to-gray-500',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    icon: '🥈',
  },
  gold: {
    color: 'from-yellow-400 to-yellow-600',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: '🥇',
  },
  diamond: {
    color: 'from-cyan-400 via-blue-500 to-purple-600',
    borderColor: 'border-cyan-400',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    icon: '💎',
  },
}

const CATEGORY_CONFIG = {
  vocab: { name: 'Vocabulary', icon: '📚', color: 'text-purple-600' },
  quiz: { name: 'Quiz Master', icon: '⚔️', color: 'text-red-600' },
  games: { name: 'Game Pro', icon: '🎮', color: 'text-blue-600' },
  streak: { name: 'Dedication', icon: '🔥', color: 'text-orange-600' },
  mastery: { name: 'Mastery', icon: '⭐', color: 'text-yellow-600' },
}

/**
 * AchievementBadge - Individual achievement card
 */
function AchievementBadge({
  achievement,
  onClick,
}: {
  achievement: Achievement
  onClick: () => void
}) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity]
  const categoryConfig = CATEGORY_CONFIG[achievement.category]
  const progress = Math.min(
    100,
    (achievement.progress / achievement.requirement) * 100
  )

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl border-4 transition-all
        ${achievement.unlocked ? `${rarityConfig.borderColor} ${rarityConfig.bgColor}` : 'border-gray-200 bg-gray-50'}
        ${achievement.unlocked ? 'hover:scale-105' : 'opacity-60'}
      `}
      whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Locked Overlay */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl z-10">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Rarity Badge */}
      <div className="absolute -top-3 -right-3 text-3xl">
        {rarityConfig.icon}
      </div>

      {/* Achievement Icon */}
      <div className="text-6xl mb-2 text-center">{achievement.icon}</div>

      {/* Achievement Info */}
      <h3
        className={`font-bold text-lg text-center mb-1 ${achievement.unlocked ? rarityConfig.textColor : 'text-gray-500'}`}
      >
        {achievement.title}
      </h3>
      <p className="text-sm text-gray-600 text-center mb-3">
        {achievement.description}
      </p>

      {/* Category */}
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="text-lg">{categoryConfig.icon}</span>
        <span className={`text-xs font-bold ${categoryConfig.color}`}>
          {categoryConfig.name}
        </span>
      </div>

      {/* Progress Bar */}
      {!achievement.unlocked && (
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${rarityConfig.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Progress Text */}
      <p className="text-xs text-gray-500 text-center mt-2">
        {achievement.unlocked ? (
          <span className="flex items-center justify-center gap-1 text-green-600 font-bold">
            <Check className="w-4 h-4" />
            Unlocked!
          </span>
        ) : (
          `${achievement.progress} / ${achievement.requirement}`
        )}
      </p>
    </motion.button>
  )
}

/**
 * AchievementNotification - Toast notification for new achievement
 */
export function AchievementNotification({
  achievement,
  onClose,
  onPlaySound,
}: AchievementNotificationProps) {
  const rarityConfig = RARITY_CONFIG[achievement.rarity]

  useEffect(() => {
    onPlaySound('celebration')
    setTimeout(() => {
      onPlaySound('star')
    }, 500)

    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose, onPlaySound])

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div
        className={`bg-gradient-to-r ${rarityConfig.color} rounded-2xl p-1 shadow-2xl`}
      >
        <div className="bg-white rounded-xl p-6 max-w-sm">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{achievement.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className={`w-5 h-5 ${rarityConfig.textColor}`} />
                <h3 className={`font-black text-lg ${rarityConfig.textColor}`}>
                  Achievement Unlocked!
                </h3>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">
                {achievement.title}
              </h4>
              <p className="text-sm text-gray-600">{achievement.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{rarityConfig.icon}</span>
                <span
                  className={`text-sm font-bold ${rarityConfig.textColor} capitalize`}
                >
                  {achievement.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Effect */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none"
          initial={{
            x: 150,
            y: 50,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: 150 + (Math.random() - 0.5) * 300,
            y: 50 + Math.random() * 200,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 2, delay: i * 0.1 }}
        >
          {['✨', '⭐', '🎉', '💫'][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * AchievementSystem - Achievement collection panel
 */
export function AchievementSystem({
  achievements,
  onClose,
  onPlaySound,
}: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory && a.category !== selectedCategory) return false
    if (selectedRarity && a.rarity !== selectedRarity) return false
    return true
  })

  // Group by category
  const categories = Object.keys(CATEGORY_CONFIG) as Array<
    keyof typeof CATEGORY_CONFIG
  >

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-black text-white">Achievements</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-xl px-6 py-2 text-white font-bold transition-colors"
            >
              Close
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-3">
              <p className="text-white/80 text-sm">Unlocked</p>
              <p className="text-3xl font-black text-white">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <div className="flex-1 bg-white/20 backdrop-blur rounded-xl px-6 py-3">
              <p className="text-white/80 text-sm mb-2">Progress</p>
              <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  onPlaySound('click')
                }}
                className={`
                  px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all
                  ${!selectedCategory ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const config = CATEGORY_CONFIG[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat)
                      onPlaySound('click')
                    }}
                    className={`
                      px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2
                      ${selectedCategory === cat ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRarity(null)
                  onPlaySound('click')
                }}
                className={`
                  px-4 py-2 rounded-xl font-bold transition-all
                  ${!selectedRarity ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                All Rarities
              </button>
              {Object.entries(RARITY_CONFIG).map(([rarity, config]) => (
                <button
                  key={rarity}
                  onClick={() => {
                    setSelectedRarity(rarity)
                    onPlaySound('click')
                  }}
                  className={`
                    px-4 py-2 rounded-xl font-bold transition-all capitalize flex items-center gap-1
                    ${selectedRarity === rarity ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  <span>{config.icon}</span>
                  <span>{rarity}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Achievement Grid */}
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAchievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => onPlaySound('click')}
                />
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-xl font-bold text-gray-500">
                  No achievements found
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
