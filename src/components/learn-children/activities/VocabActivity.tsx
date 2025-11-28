import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, Star, Trophy, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface VocabWord {
  id: string
  word: string
  meaning: string
  pronunciation?: string
  image?: string
  audioUrl?: string
}

type SoundType =
  | 'click'
  | 'correct'
  | 'wrong'
  | 'celebration'
  | 'levelUp'
  | 'coin'
  | 'star'

interface VocabActivityProps {
  words: VocabWord[]
  onComplete: (score: number, correctWords: number) => void
  onAddXP: (amount: number) => void
  onAddCoins: (amount: number) => void
  onPlaySound: (sound: SoundType) => void
}

interface FallingWord extends VocabWord {
  x: number // Horizontal position (%)
  y: number // Vertical position (%)
  rotation: number
  velocity: number // Falling speed
  caught: boolean
}

export function VocabActivity({
  words,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: VocabActivityProps) {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [missedWords, setMissedWords] = useState(0)
  const [caughtWords, setCaughtWords] = useState<VocabWord[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [gameState, setGameState] = useState<
    'ready' | 'playing' | 'paused' | 'complete'
  >('ready')
  const [basketPosition, setBasketPosition] = useState(50) // Basket position (%)
  const [showComboEffect, setShowComboEffect] = useState(false)
  const [particles, setParticles] = useState<
    { id: string; x: number; y: number }[]
  >([])

  const MAX_MISSED = 5
  const SPAWN_INTERVAL = 2000 // 2 seconds
  const FALL_SPEED = 0.5 // pixels per frame

  // Spawn new falling word
  const spawnWord = useCallback(() => {
    if (currentWordIndex >= words.length || gameState !== 'playing') return

    const newWord: FallingWord = {
      ...words[currentWordIndex],
      x: Math.random() * 80 + 10, // 10-90% from left
      y: -10,
      rotation: Math.random() * 30 - 15, // -15 to 15 degrees
      velocity: 1 + Math.random() * 0.5, // Random speed
      caught: false,
    }

    setFallingWords((prev) => [...prev, newWord])
    setCurrentWordIndex((prev) => prev + 1)
  }, [currentWordIndex, words, gameState])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = setInterval(() => {
      setFallingWords((prev) => {
        const updated = prev
          .map((word) => ({
            ...word,
            y: word.y + word.velocity * FALL_SPEED,
            rotation: word.rotation + word.velocity * 0.5,
          }))
          .filter((word) => {
            // Remove words that fell off screen
            if (word.y > 110 && !word.caught) {
              setMissedWords((m) => m + 1)
              setCombo(0) // Break combo
              onPlaySound('wrong')
              return false
            }
            return word.y <= 110 || word.caught
          })

        return updated
      })
    }, 16) // ~60fps

    return () => clearInterval(gameLoop)
  }, [gameState, onPlaySound])

  // Spawn timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const spawnTimer = setInterval(() => {
      spawnWord()
    }, SPAWN_INTERVAL)

    return () => clearInterval(spawnTimer)
  }, [gameState, spawnWord])

  // Check game over
  useEffect(() => {
    if (missedWords >= MAX_MISSED) {
      setGameState('complete')
      onComplete(score, caughtWords.length)
    }
  }, [missedWords, score, caughtWords.length, onComplete])

  // Handle catching word
  const catchWord = (wordId: string, wordX: number, wordY: number) => {
    const word = fallingWords.find((w) => w.id === wordId)
    if (!word || word.caught) return

    // Check if basket is close enough
    const distance = Math.abs(wordX - basketPosition)
    if (distance > 15) return // Too far

    // Caught!
    setFallingWords((prev) =>
      prev.map((w) => (w.id === wordId ? { ...w, caught: true, y: wordY } : w))
    )

    setCaughtWords((prev) => [...prev, word])

    // Calculate score with combo multiplier
    const newCombo = combo + 1
    const comboMultiplier = Math.floor(newCombo / 3) + 1 // 1x, 2x, 3x...
    const points = 10 * comboMultiplier

    setCombo(newCombo)
    setScore((s) => s + points)

    // Show combo effect
    if (newCombo % 3 === 0 && newCombo > 0) {
      setShowComboEffect(true)
      setTimeout(() => setShowComboEffect(false), 1000)
    }

    // Rewards
    onAddXP(points)
    onAddCoins(Math.floor(points / 2))
    onPlaySound('correct')

    // Create catch particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `${wordId}-${i}`,
      x: wordX,
      y: wordY,
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !p.id.startsWith(wordId)))
    }, 1000)

    // Remove caught word after animation
    setTimeout(() => {
      setFallingWords((prev) => prev.filter((w) => w.id !== wordId))
    }, 500)
  }

  // Mouse/touch move handler for basket
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    setBasketPosition(Math.max(10, Math.min(90, x)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    setBasketPosition(Math.max(10, Math.min(90, x)))
  }

  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setCombo(0)
    setMissedWords(0)
    setCaughtWords([])
    setCurrentWordIndex(0)
    setFallingWords([])
    onPlaySound('click')
  }

  const resetGame = () => {
    startGame()
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header Stats */}
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
              <Zap className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-lg">
                {combo}x COMBO
              </span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-white/70">Caught</div>
            <div className="font-bold text-white text-xl">
              {caughtWords.length}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/70">Missed</div>
            <div className="font-bold text-red-300 text-xl">
              {missedWords} / {MAX_MISSED}
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div
        className="relative flex-1 bg-gradient-to-b from-blue-100 to-blue-50 rounded-3xl overflow-hidden cursor-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Ready State */}
        {gameState === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/90 to-pink-600/90 z-50"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Word Catcher!
            </h2>
            <p className="text-xl text-white/90 mb-8 text-center max-w-md">
              Move your basket to catch falling words!
              <br />⭐ Build combos for bonus points!
            </p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl"
            >
              Start Game! 🚀
            </motion.button>
          </motion.div>
        )}

        {/* Complete State */}
        {gameState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-600/90 to-blue-600/90 z-50"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="w-24 h-24 text-yellow-300 mb-4" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-2">Great Job!</h2>
            <div className="text-6xl font-bold text-yellow-300 mb-6">
              {score} points
            </div>
            <div className="text-xl text-white/90 mb-8">
              You caught {caughtWords.length} words! 🎉
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetGame}
              className="flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-2xl font-bold text-xl shadow-lg"
            >
              <RefreshCw className="w-6 h-6" />
              Play Again
            </motion.button>
          </motion.div>
        )}

        {/* Falling Words */}
        <AnimatePresence>
          {fallingWords.map((word) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: word.caught ? 0 : 1,
                scale: word.caught ? 1.5 : 1,
              }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                left: `${word.x}%`,
                top: `${word.y}%`,
                transform: `rotate(${word.rotation}deg)`,
              }}
              onClick={() => catchWord(word.id, word.x, word.y)}
              className="cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 px-6 py-3 rounded-2xl shadow-xl"
              >
                <div className="font-bold text-white text-xl">{word.word}</div>
                <div className="text-sm text-white/80">{word.meaning}</div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Catch Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, scale: 1, x: particle.x, y: particle.y }}
              animate={{
                opacity: 0,
                scale: 2,
                x: particle.x + (Math.random() - 0.5) * 100,
                y: particle.y - 100,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute pointer-events-none"
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Combo Effect */}
        <AnimatePresence>
          {showComboEffect && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40"
            >
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
                {Math.floor(combo / 3)}x COMBO!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Basket */}
        {gameState === 'playing' && (
          <motion.div
            animate={{ x: `${basketPosition}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-8 -translate-x-1/2 pointer-events-none z-30"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="relative"
            >
              {/* Basket */}
              <div className="w-32 h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded-t-3xl relative">
                <div className="absolute inset-x-0 top-0 h-4 bg-amber-700 rounded-t-3xl" />
                <div className="absolute left-2 right-2 top-6 bottom-2 border-4 border-amber-900/30 rounded-2xl" />

                {/* Basket glow */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-2 bg-yellow-400/30 rounded-3xl blur-xl -z-10"
                />
              </div>

              {/* Handle */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8 border-4 border-amber-700 rounded-t-full" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Word List Preview */}
      {gameState === 'playing' && (
        <div className="mt-4 p-4 bg-white/50 rounded-2xl">
          <div className="text-sm text-gray-600 mb-2">Next words:</div>
          <div className="flex gap-2 overflow-x-auto">
            {words.slice(currentWordIndex, currentWordIndex + 5).map((word) => (
              <div
                key={word.id}
                className="flex-shrink-0 px-3 py-1 bg-purple-100 rounded-lg text-sm text-purple-700 font-medium"
              >
                {word.word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
