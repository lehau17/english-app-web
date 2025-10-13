import { motion } from 'framer-motion'
import { Coins, Star, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProgressSystemProps {
  currentXP: number
  maxXP: number
  level: number
  stars: number
  coins: number
  onLevelUp?: () => void
}

/**
 * ProgressSystem - XP bar, stars, coins với animations
 */
export function ProgressSystem({
  currentXP,
  maxXP,
  level,
  stars,
  coins,
  onLevelUp,
}: ProgressSystemProps) {
  const [displayXP, setDisplayXP] = useState(0)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const progress = (currentXP / maxXP) * 100

  useEffect(() => {
    // Animate XP increase
    const timer = setTimeout(() => {
      setDisplayXP(currentXP)
    }, 100)

    // Check for level up
    if (currentXP >= maxXP && onLevelUp) {
      setShowLevelUp(true)
      setTimeout(() => {
        onLevelUp()
        setShowLevelUp(false)
      }, 2000)
    }

    return () => clearTimeout(timer)
  }, [currentXP, maxXP, onLevelUp])

  return (
    <div className="relative">
      {/* Top Stats Bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-4 border-yellow-300">
        {/* Level Badge */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="w-6 h-6 text-yellow-300 fill-current" />
          <span className="text-2xl font-black text-white">LV {level}</span>
        </motion.div>

        {/* XP Bar */}
        <div className="flex-1 relative">
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden border-4 border-blue-300 shadow-inner">
            {/* XP Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {/* XP Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white drop-shadow-lg">
                {displayXP} / {maxXP} XP
              </span>
            </div>
          </div>
          {/* Progress ticks */}
          <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-2 rounded-full ${
                  progress >= (i + 1) * 20 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stars */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-md"
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="w-6 h-6 text-white fill-current" />
          <span className="text-2xl font-black text-white">{stars}</span>
        </motion.div>

        {/* Coins */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-md"
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Coins className="w-6 h-6 text-white" />
          <span className="text-2xl font-black text-white">{coins}</span>
        </motion.div>
      </div>

      {/* Level Up Animation */}
      {showLevelUp && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
            {/* Level Up Text */}
            <motion.div
              className="relative bg-gradient-to-br from-purple-600 to-pink-600 text-white px-12 py-8 rounded-3xl shadow-2xl border-8 border-yellow-400"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
              }}
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                  }}
                >
                  <Zap className="w-20 h-20 mx-auto mb-4 text-yellow-300 fill-current" />
                </motion.div>
                <h2 className="text-6xl font-black mb-2">LEVEL UP!</h2>
                <p className="text-3xl font-bold">Level {level + 1}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
