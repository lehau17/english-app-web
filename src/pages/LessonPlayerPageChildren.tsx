import { motion } from 'framer-motion'
import { Home, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatedBackground } from '../components/learn-children/AnimatedBackground'
import { CharacterAvatar } from '../components/learn-children/CharacterAvatar'
import { ProgressSystem } from '../components/learn-children/ProgressSystem'
import useSoundEffects from '../components/learn-children/SoundEffects'

/**
 * LessonPlayerPageChildren - Phiên bản siêu phức tạp cho trẻ em
 * Phase 1: Foundation with animations, sounds, and core components
 */
export default function LessonPlayerPageChildren() {
  const { classroomId } = useParams<{
    classroomId: string
    lessonId: string
  }>()
  const navigate = useNavigate()
  const { playSound } = useSoundEffects()

  // Demo state
  const [currentXP, setCurrentXP] = useState(45)
  const [level, setLevel] = useState(3)
  const [stars, setStars] = useState(28)
  const [coins, setCoins] = useState(156)
  const [characterMessage, setCharacterMessage] = useState(
    'Chào bạn! Sẵn sàng học tiếng Anh chưa nào? 🎉'
  )
  const [showMessage, setShowMessage] = useState(true)

  const handleLevelUp = () => {
    playSound('levelUp')
    setLevel((prev) => prev + 1)
    setCurrentXP(0)
    setCharacterMessage('Wowww! Bạn lên cấp rồi! Tuyệt vời quá! 🎊')
  }

  const handleHomeClick = () => {
    playSound('click')
    navigate(`/classroom/${classroomId}/map`)
  }

  // Demo: Add XP
  const addXP = (amount: number) => {
    playSound('correct')
    setCurrentXP((prev) => Math.min(prev + amount, 100))
    setStars((prev) => prev + 1)
    playSound('star')
  }

  // Demo: Add Coins
  const addCoins = (amount: number) => {
    playSound('coin')
    setCoins((prev) => prev + amount)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Home Button */}
            <motion.button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-3 bg-white/90 hover:bg-white rounded-2xl shadow-lg border-4 border-blue-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-blue-600">Home</span>
            </motion.button>

            {/* Sound Toggle */}
            <motion.button
              onClick={() => playSound('click')}
              className="flex items-center gap-2 px-4 py-3 bg-white/90 hover:bg-white rounded-2xl shadow-lg border-4 border-green-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Volume2 className="w-6 h-6 text-green-600" />
            </motion.button>
          </div>

          {/* Progress System */}
          <ProgressSystem
            currentXP={currentXP}
            maxXP={100}
            level={level}
            stars={stars}
            coins={coins}
            onLevelUp={handleLevelUp}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            {/* Character Avatar */}
            <div className="flex justify-center mb-12">
              <CharacterAvatar
                emotion="happy"
                message={characterMessage}
                showMessage={showMessage}
              />
            </div>

            {/* Demo Card */}
            <motion.div
              className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 border-8 border-purple-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-black text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎮 Phase 1: Foundation Complete! 🎮
              </h1>

              <p className="text-xl text-center text-gray-700 mb-8 font-semibold">
                Tất cả core components đã được tạo với animations, sounds, và
                effects! ✨
              </p>

              {/* Demo Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  onClick={() => {
                    addXP(25)
                    setCharacterMessage('Tuyệt vời! Bạn kiếm được XP! 🌟')
                    setShowMessage(true)
                  }}
                  className="py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-lg rounded-2xl shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎯 Thêm XP
                </motion.button>

                <motion.button
                  onClick={() => {
                    addCoins(10)
                    setCharacterMessage('Wow! Bạn nhận được xu! 💰')
                    setShowMessage(true)
                  }}
                  className="py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg rounded-2xl shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💰 Thêm Xu
                </motion.button>

                <motion.button
                  onClick={() => {
                    playSound('celebration')
                    setCharacterMessage('Chúc mừng bạn! Bạn thật tuyệt vời! 🎉')
                    setShowMessage(true)
                  }}
                  className="py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎉 Celebration
                </motion.button>

                <motion.button
                  onClick={() => {
                    playSound('wrong')
                    setCharacterMessage('Không sao! Cố gắng lần sau nhé! 💪')
                    setShowMessage(true)
                  }}
                  className="py-4 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg border-4 border-white"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ❌ Wrong Answer
                </motion.button>
              </div>

              {/* Next Steps */}
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border-4 border-green-300">
                <h3 className="text-2xl font-black text-green-700 mb-3">
                  🚀 Ready for Phase 2?
                </h3>
                <p className="text-gray-700 font-semibold">
                  Giờ chúng ta có thể bắt đầu implement các Activity components:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li>✅ Animated Background với particles & clouds</li>
                  <li>✅ Progress System với XP bar & rewards</li>
                  <li>✅ Character Avatar với emotions & dialogues</li>
                  <li>✅ Sound Effects system</li>
                  <li>⏭️ Vocab Activity - Word Catcher Game</li>
                  <li>⏭️ Quiz Activity - Battle Arena</li>
                  <li>⏭️ And more...</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
