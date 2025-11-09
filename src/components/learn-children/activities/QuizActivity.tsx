import { AnimatePresence, motion } from 'framer-motion'
import {
  Clock,
  Flame,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number // seconds
  points: number
}

interface PowerUp {
  id: string
  type: 'freeze' | 'hint' | 'double' | 'skip'
  icon: string
  name: string
  active: boolean
}

interface QuizActivityProps {
  questions: QuizQuestion[]
  onComplete: (score: number, accuracy: number) => void
  onAddXP: (amount: number) => void
  onAddCoins: (amount: number) => void
  onPlaySound: (
    sound:
      | 'click'
      | 'correct'
      | 'wrong'
      | 'celebration'
      | 'levelUp'
      | 'coin'
      | 'star'
  ) => void
}

export function QuizActivity({
  questions,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: QuizActivityProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>(
    'ready'
  )
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { id: '1', type: 'freeze', icon: '⏸️', name: 'Freeze Time', active: true },
    { id: '2', type: 'hint', icon: '💡', name: 'Remove 2', active: true },
    { id: '3', type: 'double', icon: '✨', name: '2x Points', active: true },
    { id: '4', type: 'skip', icon: '⏭️', name: 'Skip', active: true },
  ])
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null)
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([])
  const [isTimeFreezed, setIsTimeFreezed] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [particles, setParticles] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([])

  const timerRef = useRef<number | null>(null)
  const currentQuestion = questions[currentQuestionIndex]

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setActivePowerUp(null)
      setEliminatedOptions([])
      setIsTimeFreezed(false)
    } else {
      setGameState('complete')
      const accuracy = (correctCount / questions.length) * 100
      onComplete(score, accuracy)
      onPlaySound('celebration')
    }
  }, [
    correctCount,
    currentQuestionIndex,
    onComplete,
    onPlaySound,
    questions.length,
    score,
  ])

  const handleTimeUp = useCallback(() => {
    onPlaySound('wrong')
    setCombo(0)
    setShowExplosion(true)
    setTimeout(() => {
      setShowExplosion(false)
      nextQuestion()
    }, 1500)
  }, [nextQuestion, onPlaySound])

  // Timer
  useEffect(() => {
    if (
      gameState !== 'playing' ||
      !currentQuestion ||
      isAnswered ||
      isTimeFreezed
    )
      return

    setTimeLeft(currentQuestion.timeLimit)

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [
    currentQuestion,
    currentQuestionIndex,
    gameState,
    isAnswered,
    isTimeFreezed,
    handleTimeUp,
  ])

  const activatePowerUp = useCallback(
    (powerUpId: string, type: PowerUp['type']) => {
      if (isAnswered) return

      const powerUp = powerUps.find((p) => p.id === powerUpId)
      if (!powerUp || !powerUp.active) return

      onPlaySound('click')
      setActivePowerUp(type)
      setPowerUps((prev) =>
        prev.map((p) => (p.id === powerUpId ? { ...p, active: false } : p))
      )

      switch (type) {
        case 'freeze':
          setIsTimeFreezed(true)
          setTimeout(() => setIsTimeFreezed(false), 10000) // 10 seconds freeze
          break

        case 'hint':
          // Eliminate 2 wrong answers
          const wrongOptions = currentQuestion.options
            .map((_, index) => index)
            .filter((index) => index !== currentQuestion.correctAnswer)
          const toEliminate = wrongOptions.slice(0, 2)
          setEliminatedOptions(toEliminate)
          break

        case 'double':
          // Will be applied when answering
          break

        case 'skip':
          nextQuestion()
          setActivePowerUp(null)
          break
      }
    },
    [isAnswered, currentQuestion, powerUps, onPlaySound, nextQuestion]
  )

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered || eliminatedOptions.includes(answerIndex)) return

    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    const isCorrect = answerIndex === currentQuestion.correctAnswer

    if (isCorrect) {
      // Calculate points
      const basePoints = currentQuestion.points
      const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * 50)
      const comboMultiplier = Math.floor(combo / 3) + 1
      const doubleBonus = activePowerUp === 'double' ? 2 : 1
      const totalPoints =
        (basePoints + timeBonus) * comboMultiplier * doubleBonus

      setScore((s) => s + totalPoints)
      setCorrectCount((c) => c + 1)
      setCombo((c) => c + 1)
      onAddXP(totalPoints)
      onAddCoins(Math.floor(totalPoints / 2))
      onPlaySound('correct')

      // Create particles
      createParticles('#10b981') // Green
    } else {
      setCombo(0)
      onPlaySound('wrong')
      setShowExplosion(true)
      setTimeout(() => setShowExplosion(false), 1000)

      // Create particles
      createParticles('#ef4444') // Red
    }

    setTimeout(() => {
      nextQuestion()
    }, 2000)
  }

  const createParticles = (color: string) => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x: 50, // Center
      y: 50,
      color,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1000)
  }

  const startGame = () => {
    setGameState('playing')
    onPlaySound('click')
  }

  const getDifficultyColor = (difficulty: QuizQuestion['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'hard':
        return 'text-red-400'
    }
  }

  const getTimerColor = () => {
    const percentage = (timeLeft / currentQuestion.timeLimit) * 100
    if (percentage > 50) return 'from-green-500 to-emerald-500'
    if (percentage > 25) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-lg">{score}</span>
          </div>

          {combo > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-xl"
            >
              <Flame className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">
                {combo}x COMBO!
              </span>
            </motion.div>
          )}

          {isTimeFreezed && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-xl"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="font-bold text-white">FROZEN</span>
            </motion.div>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm text-white/70">Progress</div>
          <div className="font-bold text-white text-xl">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Ready State */}
      {gameState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/90 to-pink-600/90 rounded-3xl p-8"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Swords className="w-24 h-24 text-yellow-300 mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">Battle Arena!</h2>
          <p className="text-xl text-white/90 mb-8 text-center max-w-md">
            ⚔️ Answer quickly to earn combo bonuses!
            <br />
            🎯 Use power-ups strategically!
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Total Questions', value: questions.length },
              { label: 'Power-Ups', value: powerUps.length },
              { label: 'Max Combo', value: 'Unlimited' },
              { label: 'Time Bonus', value: 'Yes' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/20 rounded-xl p-4 text-center"
              >
                <div className="text-sm text-white/70">{stat.label}</div>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-xl shadow-lg"
          >
            Start Battle! ⚔️
          </motion.button>
        </motion.div>
      )}

      {/* Playing State */}
      {gameState === 'playing' && currentQuestion && (
        <div className="flex-1 flex flex-col">
          {/* Timer Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-lg">
                  {timeLeft}s {isTimeFreezed && '(Frozen)'}
                </span>
              </div>
              <div
                className={`text-sm font-bold ${getDifficultyColor(currentQuestion.difficulty)}`}
              >
                {currentQuestion.difficulty.toUpperCase()}
              </div>
            </div>
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                animate={{
                  width: `${(timeLeft / currentQuestion.timeLimit) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getTimerColor()} rounded-full`}
              />
            </div>
          </div>

          {/* Power-Ups */}
          <div className="flex gap-3 mb-6">
            {powerUps.map((powerUp) => (
              <motion.button
                key={powerUp.id}
                whileHover={{ scale: powerUp.active ? 1.1 : 1 }}
                whileTap={{ scale: powerUp.active ? 0.95 : 1 }}
                onClick={() => activatePowerUp(powerUp.id, powerUp.type)}
                disabled={!powerUp.active || isAnswered}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl font-bold transition-all ${
                  powerUp.active && !isAnswered
                    ? activePowerUp === powerUp.type
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white scale-105'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-3xl">{powerUp.icon}</div>
                <div className="text-xs text-center">{powerUp.name}</div>
              </motion.button>
            ))}
          </div>

          {/* Question */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 flex flex-col">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="text-3xl font-bold text-gray-800 text-center leading-relaxed">
                {currentQuestion.question}
              </div>
            </motion.div>

            {/* Options */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const isEliminated = eliminatedOptions.includes(index)
                const showCorrect = isAnswered && isCorrect
                const showWrong = isAnswered && isSelected && !isCorrect

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isEliminated ? 0.3 : 1,
                      scale: isEliminated ? 0.9 : 1,
                    }}
                    whileHover={{
                      scale: isAnswered || isEliminated ? 1 : 1.05,
                    }}
                    whileTap={{ scale: isAnswered || isEliminated ? 1 : 0.95 }}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered || isEliminated}
                    className={`relative p-6 rounded-2xl font-bold text-xl transition-all overflow-hidden ${
                      showCorrect
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white scale-105 shadow-2xl'
                        : showWrong
                          ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
                          : isEliminated
                            ? 'bg-gray-300 text-gray-500 line-through cursor-not-allowed'
                            : isAnswered
                              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-white text-gray-800 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {/* Option letter badge */}
                    <div
                      className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        showCorrect
                          ? 'bg-white/30 text-white'
                          : showWrong
                            ? 'bg-white/30 text-white'
                            : 'bg-purple-500 text-white'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>

                    {/* Option text */}
                    <div className="text-center">{option}</div>

                    {/* Correct/Wrong icon */}
                    {showCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-3 right-3"
                      >
                        <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                    )}
                    {showWrong && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 text-4xl"
                      >
                        ❌
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Explosion Effect */}
          <AnimatePresence>
            {showExplosion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="text-9xl"
                >
                  💥
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  opacity: 1,
                  scale: 1,
                  x: `${particle.x}%`,
                  y: `${particle.y}%`,
                }}
                animate={{
                  opacity: 0,
                  scale: 2,
                  x: `${particle.x + (Math.random() - 0.5) * 100}%`,
                  y: `${particle.y - Math.random() * 100}%`,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute pointer-events-none"
              >
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: particle.color }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Complete State */}
      {gameState === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 3, ease: 'linear' },
              scale: { repeat: Infinity, duration: 2 },
            }}
          >
            <Trophy className="w-32 h-32 text-white mb-6" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-4">Victory!</h2>
          <div className="text-7xl font-black text-white mb-6">{score}</div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white/20 rounded-2xl p-6 text-center">
              <div className="text-sm text-white/70 mb-2">Correct</div>
              <div className="text-4xl font-bold text-white">
                {correctCount}/{questions.length}
              </div>
            </div>
            <div className="bg-white/20 rounded-2xl p-6 text-center">
              <div className="text-sm text-white/70 mb-2">Accuracy</div>
              <div className="text-4xl font-bold text-white">
                {Math.round((correctCount / questions.length) * 100)}%
              </div>
            </div>
          </div>
          <div className="text-2xl text-white/90 mb-4">
            Max Combo: {combo > 0 ? combo : 'None'} 🔥
          </div>
        </motion.div>
      )}
    </div>
  )
}
