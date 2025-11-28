import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Eye, EyeOff, Puzzle, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Types
interface PuzzlePiece {
  id: string
  row: number
  col: number
  currentRow: number
  currentCol: number
  isPlaced: boolean
  image: string
}

interface JigsawActivityProps {
  imageUrl: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' // 9, 16, 25 pieces
  onComplete: (score: number, moves: number) => void
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
 * JigsawActivity - Drag-and-drop puzzle game
 * Kids assemble puzzle pieces to reveal the complete picture
 */
export function JigsawActivity({
  imageUrl,
  title,
  difficulty,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: JigsawActivityProps) {
  const gridSize = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5
  const totalPieces = gridSize * gridSize

  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null)
  const [placedPieces, setPlacedPieces] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>(
    'ready'
  )
  const [showCelebration, setShowCelebration] = useState(false)

  // Generate puzzle pieces
  const generatePuzzle = useCallback(() => {
    const newPieces: PuzzlePiece[] = []

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newPieces.push({
          id: `piece-${row}-${col}`,
          row,
          col,
          currentRow: -1,
          currentCol: -1,
          isPlaced: false,
          image: imageUrl,
        })
      }
    }

    // Shuffle pieces
    const shuffled = newPieces.sort(() => Math.random() - 0.5)
    setPieces(shuffled)
  }, [gridSize, imageUrl])

  // Handle drag start
  const handleDragStart = (pieceId: string) => {
    setDraggedPiece(pieceId)
    onPlaySound('click')
  }

  // Handle drop on grid
  const handleDrop = (targetRow: number, targetCol: number) => {
    if (!draggedPiece) return

    const piece = pieces.find((p) => p.id === draggedPiece)
    if (!piece) return

    // Check if target position is already occupied
    const occupied = pieces.find(
      (p) =>
        p.currentRow === targetRow && p.currentCol === targetCol && !p.isPlaced
    )

    if (occupied) {
      // Swap positions
      setPieces((prev) =>
        prev.map((p) => {
          if (p.id === draggedPiece) {
            return { ...p, currentRow: targetRow, currentCol: targetCol }
          }
          if (p.id === occupied.id) {
            return {
              ...p,
              currentRow: piece.currentRow,
              currentCol: piece.currentCol,
            }
          }
          return p
        })
      )
    } else {
      // Place piece
      setPieces((prev) =>
        prev.map((p) =>
          p.id === draggedPiece
            ? { ...p, currentRow: targetRow, currentCol: targetCol }
            : p
        )
      )
    }

    setMoves((prev) => prev + 1)
    setDraggedPiece(null)

    // Check if piece is in correct position
    setTimeout(
      () => checkPiecePlacement(draggedPiece, targetRow, targetCol),
      100
    )
  }

  const checkPiecePlacement = (pieceId: string, row: number, col: number) => {
    const piece = pieces.find((p) => p.id === pieceId)
    if (!piece) return

    if (piece.row === row && piece.col === col) {
      // Correct placement!
      onPlaySound('correct')

      setPieces((prev) =>
        prev.map((p) => (p.id === pieceId ? { ...p, isPlaced: true } : p))
      )

      setPlacedPieces((prev) => prev + 1)

      // Award points
      const pieceScore = 20
      onAddXP(pieceScore)
      onAddCoins(pieceScore)

      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 500)
    }
  }

  // Handle drop on piece bank
  const handleDropOnBank = () => {
    if (!draggedPiece) return

    setPieces((prev) =>
      prev.map((p) =>
        p.id === draggedPiece ? { ...p, currentRow: -1, currentCol: -1 } : p
      )
    )

    setDraggedPiece(null)
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
      placedPieces === totalPieces &&
      totalPieces > 0
    ) {
      setGameState('complete')
      onPlaySound('celebration')

      // Final score
      const baseScore = totalPieces * 20
      const timeBonus = Math.max(0, 600 - timeElapsed) // Max 10 minutes
      const moveBonus = Math.max(0, (totalPieces - moves) * 5)
      const finalScore = baseScore + timeBonus + moveBonus

      onAddXP(150) // Completion bonus
      onComplete(finalScore, moves)
    }
  }, [
    placedPieces,
    totalPieces,
    gameState,
    moves,
    timeElapsed,
    onComplete,
    onAddXP,
    onPlaySound,
  ])

  // Start game
  const handleStart = () => {
    generatePuzzle()
    setGameState('playing')
    setPlacedPieces(0)
    setMoves(0)
    setTimeElapsed(0)
    setShowPreview(false)
    onPlaySound('click')
  }

  // Play again
  const handlePlayAgain = () => {
    setGameState('ready')
    setShowCelebration(false)
  }

  // Toggle preview
  const handleTogglePreview = () => {
    setShowPreview((prev) => !prev)
    onPlaySound('click')
  }

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get piece style for background position
  const getPieceStyle = (piece: PuzzlePiece) => {
    const pieceSize = 100 / gridSize
    return {
      backgroundImage: `url(${piece.image})`,
      backgroundSize: `${gridSize * 100}%`,
      backgroundPosition: `${piece.col * pieceSize}% ${piece.row * pieceSize}%`,
    }
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
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 shadow-2xl border-8 border-white">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex justify-center mb-6"
              >
                <Puzzle className="w-32 h-32 text-white drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white text-center mb-4 drop-shadow-lg">
                Jigsaw Puzzle
              </h1>
              <p className="text-2xl text-white/90 text-center mb-8">
                🧩 Ghép tranh hoàn chỉnh!
              </p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Cách chơi:
                </h3>
                <ul className="space-y-2 text-white text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🖱️</span>
                    <span>Kéo các mảnh ghép lên lưới</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🎯</span>
                    <span>Đặt đúng vị trí để ghép nối</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">👁️</span>
                    <span>Xem trước ảnh gốc nếu cần</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <span>Hoàn thành càng nhanh càng tốt!</span>
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
                    {totalPieces} Pieces
                  </p>
                </div>
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {gridSize}×{gridSize}
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleStart}
                className="w-full bg-white text-orange-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧩 Start Puzzle!
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
            className="max-w-7xl w-full"
          >
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-4 py-2">
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
                  {placedPieces}/{totalPieces} Pieces
                </div>

                <motion.button
                  onClick={handleTogglePreview}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="w-5 h-5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5" />
                      Preview
                    </>
                  )}
                </motion.button>
              </div>

              <div className="flex gap-6">
                {/* Puzzle Grid */}
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-6 shadow-inner">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                      {title}
                    </h3>

                    <div
                      className="grid gap-1 mx-auto"
                      style={{
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                        maxWidth: `${gridSize * 80}px`,
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {Array.from({ length: gridSize }).map((_, row) =>
                        Array.from({ length: gridSize }).map((_, col) => {
                          const piece = pieces.find(
                            (p) => p.currentRow === row && p.currentCol === col
                          )

                          return (
                            <div
                              key={`slot-${row}-${col}`}
                              className={`
                                relative aspect-square rounded-lg border-2
                                transition-all duration-200
                                ${
                                  piece?.isPlaced
                                    ? 'border-green-400 bg-green-50'
                                    : 'border-dashed border-gray-300 bg-white/50'
                                }
                              `}
                              onDrop={(e) => {
                                e.preventDefault()
                                handleDrop(row, col)
                              }}
                              onDragOver={(e) => e.preventDefault()}
                            >
                              {piece && (
                                <motion.div
                                  draggable={!piece.isPlaced}
                                  onDragStart={() => handleDragStart(piece.id)}
                                  className={`
                                    w-full h-full rounded-lg cursor-move
                                    ${piece.isPlaced ? 'cursor-default' : 'hover:scale-105'}
                                  `}
                                  style={getPieceStyle(piece)}
                                  animate={
                                    piece.isPlaced ? { scale: [1, 1.1, 1] } : {}
                                  }
                                  transition={{ duration: 0.3 }}
                                />
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Piece Bank */}
                <div className="w-80">
                  <div
                    className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 max-h-[600px] overflow-y-auto"
                    onDrop={(e) => {
                      e.preventDefault()
                      handleDropOnBank()
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                      Puzzle Pieces
                    </h3>

                    <div className="grid grid-cols-3 gap-2">
                      {pieces
                        .filter((p) => p.currentRow === -1)
                        .map((piece) => (
                          <motion.div
                            key={piece.id}
                            draggable
                            onDragStart={() => handleDragStart(piece.id)}
                            className="aspect-square rounded-lg cursor-move hover:scale-105 transition-transform border-2 border-gray-200"
                            style={getPieceStyle(piece)}
                            whileHover={{ scale: 1.1 }}
                          />
                        ))}
                    </div>

                    {pieces.filter((p) => p.currentRow === -1).length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <p className="text-lg font-medium">All pieces used!</p>
                      </div>
                    )}
                  </div>
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
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 shadow-2xl border-8 border-white text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
                className="flex justify-center mb-6"
              >
                <Trophy className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
                Puzzle Complete!
              </h1>
              <p className="text-3xl text-white/90 mb-8">Hoàn hảo! 🎉</p>

              {/* Completed Image */}
              <div className="mb-8 flex justify-center">
                <div
                  className="w-64 h-64 rounded-2xl shadow-2xl border-8 border-white"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
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
                    <p className="text-4xl font-black">{totalPieces}</p>
                    <p className="text-lg">Pieces</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">
                      {gridSize}×{gridSize}
                    </p>
                    <p className="text-lg">Grid</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handlePlayAgain}
                className="w-full bg-white text-orange-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧩 Play Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Overlay */}
      <AnimatePresence>
        {showPreview && gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleTogglePreview}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">
                Preview
              </h3>
              <div
                className="w-80 h-80 rounded-2xl shadow-lg"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-9xl">✨</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
