import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronRight, Home, Star, Trophy, X } from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'

/** ========================
 * Celebration Component
 * ======================== */
export function CelebrationModal({
  onGoToNextLesson,
  nextLesson,
  onClose,
}: {
  onGoToNextLesson: () => void
  nextLesson?: any
  onClose: () => void
}): JSX.Element {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti after modal appears
    const timer = setTimeout(() => setShowConfetti(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose} // Close when clicking backdrop
    >
      <motion.div
        initial={{ scale: 0.5, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.5, y: 50, rotate: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative mx-4 max-w-lg rounded-3xl bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8 text-center shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-lg"
        >
          <X className="h-5 w-5 text-gray-600" />
        </motion.button>

        {/* Enhanced Fireworks Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Main fireworks */}
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={`firework-${i}`}
              initial={{
                x: Math.random() * 500 - 250,
                y: 400,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                y: Math.random() * -400 - 100,
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4,
              }}
              className="absolute h-3 w-3 rounded-full shadow-lg"
              style={{
                backgroundColor: [
                  '#FFD700',
                  '#FF6B6B',
                  '#4ECDC4',
                  '#45B7D1',
                  '#96CEB4',
                  '#F7DC6F',
                  '#BB8FCE',
                  '#85C1E9',
                ][Math.floor(Math.random() * 8)],
                boxShadow: `0 0 10px ${['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F7DC6F', '#BB8FCE', '#85C1E9'][Math.floor(Math.random() * 8)]}`,
              }}
            />
          ))}

          {/* Sparkle effects */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 300 + 100,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
              className="absolute text-2xl"
              style={{
                color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Floating stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{
                x: Math.random() * 350 - 175,
                y: 350,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                y: Math.random() * -350 - 50,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5,
              }}
              className="absolute"
            >
              <Star className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: -20,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    y: 400,
                    rotate: Math.random() * 360,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2 h-6"
                  style={{
                    backgroundColor: [
                      '#FF6B6B',
                      '#4ECDC4',
                      '#45B7D1',
                      '#FFD700',
                      '#BB8FCE',
                      '#85C1E9',
                    ][Math.floor(Math.random() * 6)],
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10">
          {/* Main Icon with Pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="mx-auto text-6xl">🎉</div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-yellow-400"
              />
            </motion.div>
          </motion.div>

          {/* Title with Bounce */}
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="mb-3 text-3xl font-bold text-gray-900"
          >
            Chúc mừng! 🎉
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 text-lg text-gray-700 font-medium"
          >
            Bạn đã hoàn thành bài học xuất sắc!
          </motion.p>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8 flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-3 text-white shadow-lg"
            >
              <Star className="h-6 w-6" />
              <span className="font-bold">+100 XP</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-white shadow-lg"
            >
              <Trophy className="h-6 w-6" />
              <span className="font-bold">Hoàn thành</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-white shadow-lg"
            >
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-bold">Xuất sắc</span>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            {nextLesson && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoToNextLesson}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white font-semibold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                Bài học tiếp theo
                <ChevronRight className="ml-2 inline h-6 w-6" />
              </motion.button>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = '/classroom')}
                className="flex-1 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
              >
                <Home className="inline h-5 w-5 mr-2" />
                Về trang chủ
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Đóng
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
