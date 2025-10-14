import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Clock, RotateCcw, Star, Trophy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Types
interface MemoryCard {
  id: string
  word: string
  meaning: string
  pairId: string
  type: 'word' | 'meaning'
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryCardActivityProps {
  words: { word: string; meaning: string }[]
  difficulty: 'easy' | 'medium' | 'hard' // 12, 16, 20 cards
  onComplete: (score: number, stars: number) => void
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

/**
 * MemoryCardActivity - Flip card matching game
 * Kids flip cards to match vocab words with their meanings
 */
export function MemoryCardActivity({
  words,
  difficulty,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: MemoryCardActivityProps) {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>(
    'ready'
  )
  const [stars, setStars] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const totalPairs = words.length
  const gridCols = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5

  // Generate cards
  const generateCards = useCallback(() => {
    const cardPairs: MemoryCard[] = []

    words.forEach((wordPair, index) => {
      const pairId = `pair-${index}`

      // Word card
      cardPairs.push({
        id: `${pairId}-word`,
        word: wordPair.word,
        meaning: wordPair.meaning,
        pairId,
        type: 'word',
        isFlipped: false,
        isMatched: false,
      })

      // Meaning card
      cardPairs.push({
        id: `${pairId}-meaning`,
        word: wordPair.word,
        meaning: wordPair.meaning,
        pairId,
        type: 'meaning',
        isFlipped: false,
        isMatched: false,
      })
    })

    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [words])

  // Handle card click
  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2) return
    if (flippedCards.includes(cardId)) return

    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched) return

    onPlaySound('click')

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    // Flip card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    )

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1)
      checkMatch(newFlipped)
    }
  }

  const checkMatch = (flippedIds: string[]) => {
    const [id1, id2] = flippedIds
    const card1 = cards.find((c) => c.id === id1)
    const card2 = cards.find((c) => c.id === id2)

    if (!card1 || !card2) return

    setTimeout(() => {
      if (card1.pairId === card2.pairId) {
        // Match found!
        onPlaySound('correct')
        setCards((prev) =>
          prev.map((c) =>
            c.pairId === card1.pairId ? { ...c, isMatched: true } : c
          )
        )
        setMatchedPairs((prev) => prev + 1)

        // Award points
        const pairScore = 50
        onAddXP(pairScore)
        onAddCoins(pairScore)

        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 500)
      } else {
        // No match
        onPlaySound('wrong')
        setCards((prev) =>
          prev.map((c) =>
            flippedIds.includes(c.id) ? { ...c, isFlipped: false } : c
          )
        )
      }

      setFlippedCards([])
    }, 1000)
  }

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Check completion
  useEffect(() => {
    if (
      gameState === 'playing' &&
      matchedPairs === totalPairs &&
      totalPairs > 0
    ) {
      setGameState('complete')
      onPlaySound('celebration')

      // Calculate stars (3-star rating)
      const perfectMoves = totalPairs // Minimum moves needed
      const moveRatio = perfectMoves / moves
      let earnedStars = 1

      if (moveRatio >= 0.9) earnedStars = 3
      else if (moveRatio >= 0.7) earnedStars = 2

      setStars(earnedStars)

      // Final score calculation
      const baseScore = totalPairs * 50
      const timeBonus = Math.max(0, 300 - timeElapsed)
      const moveBonus = Math.max(0, (perfectMoves - moves) * 10)
      const finalScore = baseScore + timeBonus + moveBonus

      onAddXP(100) // Completion bonus
      onComplete(finalScore, earnedStars)
    }
  }, [
    matchedPairs,
    totalPairs,
    gameState,
    moves,
    timeElapsed,
    onComplete,
    onAddXP,
    onPlaySound,
  ])

  // Start game
  const handleStart = () => {
    generateCards()
    setGameState('playing')
    setMatchedPairs(0)
    setMoves(0)
    setTimeElapsed(0)
    setFlippedCards([])
    onPlaySound('click')
  }

  // Play again
  const handlePlayAgain = () => {
    setGameState('ready')
    setShowConfetti(false)
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Ready Screen */}
        {gameState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-8 shadow-2xl border-8 border-white">
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: 'easeInOut',
                }}
                className="flex justify-center mb-6"
              >
                <Brain className="w-32 h-32 text-white drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white text-center mb-4 drop-shadow-lg">
                Memory Cards
              </h1>
              <p className="text-2xl text-white/90 text-center mb-8">
                🧠 Lật thẻ và ghép cặp!
              </p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Cách chơi:
                </h3>
                <ul className="space-y-2 text-white text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🎴</span>
                    <span>Lật 2 thẻ mỗi lượt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🔤</span>
                    <span>Ghép từ vựng với nghĩa tiếng Việt</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">⭐</span>
                    <span>Càng ít lượt, càng nhiều sao!</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🧠</span>
                    <span>Nhớ vị trí thẻ để thắng!</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center capitalize">
                    {difficulty}
                  </p>
                </div>
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {totalPairs} Pairs
                  </p>
                </div>
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {totalPairs * 2} Cards
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleStart}
                className="w-full bg-white text-pink-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧠 Start Matching!
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl w-full"
          >
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">
                        {formatTime(timeElapsed)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">
                        {moves} Moves
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-700">
                  {matchedPairs}/{totalPairs} Pairs
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">
                      Goal: {totalPairs} moves
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Grid */}
              <div className="flex justify-center">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                  }}
                >
                  {cards.map((card) => (
                    <motion.button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className="relative w-28 h-28 perspective-1000"
                      whileHover={
                        !card.isFlipped && !card.isMatched
                          ? { scale: 1.05 }
                          : {}
                      }
                      whileTap={
                        !card.isFlipped && !card.isMatched
                          ? { scale: 0.95 }
                          : {}
                      }
                      disabled={card.isFlipped || card.isMatched}
                    >
                      <motion.div
                        className="w-full h-full relative preserve-3d"
                        animate={{
                          rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                        }}
                        transition={{ duration: 0.6, type: 'spring' }}
                      >
                        {/* Card Back */}
                        <div
                          className="absolute inset-0 backface-hidden rounded-2xl
                          bg-gradient-to-br from-purple-500 to-pink-500
                          flex items-center justify-center shadow-lg border-4 border-white"
                        >
                          <Brain className="w-12 h-12 text-white" />
                        </div>

                        {/* Card Front */}
                        <div
                          className={`
                            absolute inset-0 backface-hidden rounded-2xl
                            flex items-center justify-center p-3 shadow-lg border-4
                            ${
                              card.isMatched
                                ? 'bg-gradient-to-br from-green-400 to-teal-400 border-green-300'
                                : 'bg-white border-gray-200'
                            }
                          `}
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <p
                            className={`
                              text-center font-bold leading-tight
                              ${card.type === 'word' ? 'text-xl' : 'text-base'}
                              ${card.isMatched ? 'text-white' : 'text-gray-700'}
                            `}
                          >
                            {card.type === 'word' ? card.word : card.meaning}
                          </p>
                        </div>
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Complete Screen */}
        {gameState === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl p-8 shadow-2xl border-8 border-white text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex justify-center mb-6"
              >
                <Trophy className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
                All Matched!
              </h1>
              <p className="text-3xl text-white/90 mb-8">
                🎉 Trí nhớ siêu đỉnh! 🎉
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: 'spring' }}
                  >
                    <Star
                      className={`w-16 h-16 ${
                        i <= stars
                          ? 'text-yellow-300 fill-yellow-300'
                          : 'text-white/30'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-4xl font-black">{moves}</p>
                    <p className="text-lg">Moves</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">
                      {formatTime(timeElapsed)}
                    </p>
                    <p className="text-lg">Time</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{matchedPairs}</p>
                    <p className="text-lg">Pairs Matched</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{stars}</p>
                    <p className="text-lg">Stars Earned</p>
                  </div>
                </div>

                {/* Performance Message */}
                <div className="mt-4 text-white text-xl font-bold">
                  {stars === 3 && '🌟 Perfect! Amazing memory!'}
                  {stars === 2 && '⭐ Great job! Keep practicing!'}
                  {stars === 1 && '💪 Good effort! Try again!'}
                </div>
              </div>

              <motion.button
                onClick={handlePlayAgain}
                className="w-full bg-white text-pink-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧠 Play Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti on Match */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 100}%`,
                  y: `${50 + (Math.random() - 0.5) * 100}%`,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8 }}
                className="absolute text-4xl pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                {['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}
