import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Grid3X3, Lightbulb, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// Types
interface CrosswordClue {
  id: string
  number: number
  direction: 'across' | 'down'
  clue: string
  answer: string
  startRow: number
  startCol: number
  solved: boolean
}

interface CrosswordCell {
  row: number
  col: number
  letter: string
  userLetter: string
  isBlack: boolean
  number?: number
  isHighlighted: boolean
  isCorrect: boolean
  clueIds: string[] // Can belong to multiple clues
}

interface CrosswordActivityProps {
  clues: { clue: string; answer: string; direction: 'across' | 'down' }[]
  gridSize: number
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

/**
 * CrosswordActivity - Interactive crossword puzzle
 * Kids type letters to fill in the crossword grid
 */
export function CrosswordActivity({
  clues: inputClues,
  gridSize,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: CrosswordActivityProps) {
  const [grid, setGrid] = useState<CrosswordCell[][]>([])
  const [clues, setClues] = useState<CrosswordClue[]>([])
  const [selectedClue, setSelectedClue] = useState<string | null>(null)
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  )
  const [hintsUsed, setHintsUsed] = useState(0)
  const [solvedClues, setSolvedClues] = useState(0)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>(
    'ready'
  )
  const [showCelebration, setShowCelebration] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalClues = clues.length

  // Generate crossword grid
  const generateGrid = useCallback(() => {
    const newGrid: CrosswordCell[][] = Array(gridSize)
      .fill(null)
      .map((_, row) =>
        Array(gridSize)
          .fill(null)
          .map((_, col) => ({
            row,
            col,
            letter: '',
            userLetter: '',
            isBlack: true,
            isHighlighted: false,
            isCorrect: false,
            clueIds: [],
          }))
      )

    const placedClues: CrosswordClue[] = []
    let clueNumber = 1

    // Simple placement algorithm (can be improved)
    inputClues.forEach((clueData, index) => {
      const answer = clueData.answer.toUpperCase().replace(/\s/g, '')
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        attempts++
        const startRow = Math.floor(Math.random() * (gridSize - 2))
        const startCol = Math.floor(Math.random() * (gridSize - 2))

        if (clueData.direction === 'across') {
          if (startCol + answer.length <= gridSize) {
            const canPlace = answer.split('').every((_, i) => {
              const cell = newGrid[startRow][startCol + i]
              return cell.isBlack || cell.letter === answer[i]
            })

            if (canPlace) {
              const clueId = `clue-${index}`
              answer.split('').forEach((letter, i) => {
                newGrid[startRow][startCol + i].letter = letter
                newGrid[startRow][startCol + i].isBlack = false
                newGrid[startRow][startCol + i].clueIds.push(clueId)
                if (i === 0) {
                  newGrid[startRow][startCol + i].number = clueNumber
                }
              })

              placedClues.push({
                id: clueId,
                number: clueNumber,
                direction: 'across',
                clue: clueData.clue,
                answer,
                startRow,
                startCol,
                solved: false,
              })

              clueNumber++
              placed = true
            }
          }
        } else {
          // down
          if (startRow + answer.length <= gridSize) {
            const canPlace = answer.split('').every((_, i) => {
              const cell = newGrid[startRow + i][startCol]
              return cell.isBlack || cell.letter === answer[i]
            })

            if (canPlace) {
              const clueId = `clue-${index}`
              answer.split('').forEach((letter, i) => {
                newGrid[startRow + i][startCol].letter = letter
                newGrid[startRow + i][startCol].isBlack = false
                newGrid[startRow + i][startCol].clueIds.push(clueId)
                if (i === 0) {
                  newGrid[startRow + i][startCol].number = clueNumber
                }
              })

              placedClues.push({
                id: clueId,
                number: clueNumber,
                direction: 'down',
                clue: clueData.clue,
                answer,
                startRow,
                startCol,
                solved: false,
              })

              clueNumber++
              placed = true
            }
          }
        }
      }
    })

    setGrid(newGrid)
    setClues(placedClues)
  }, [inputClues, gridSize])

  // Handle clue selection
  const handleClueClick = (clueId: string) => {
    setSelectedClue(clueId)
    onPlaySound('click')

    const clue = clues.find((c) => c.id === clueId)
    if (!clue) return

    // Highlight cells for this clue
    highlightClue(clueId)

    // Select first cell of clue
    setSelectedCell([clue.startRow, clue.startCol])
  }

  const highlightClue = (clueId: string) => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          isHighlighted: cell.clueIds.includes(clueId),
        }))
      )
    )
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row][col]
    if (cell.isBlack) return

    setSelectedCell([row, col])
    onPlaySound('click')

    // Auto-select clue if cell belongs to one
    if (cell.clueIds.length > 0) {
      const newClueId = cell.clueIds[0]
      setSelectedClue(newClueId)
      highlightClue(newClueId)
    }

    // Focus input
    inputRef.current?.focus()
  }

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell || !selectedClue) return

    const [row, col] = selectedCell
    const clue = clues.find((c) => c.id === selectedClue)
    if (!clue) return

    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      // Letter input
      const letter = e.key.toUpperCase()

      setGrid((prev) =>
        prev.map((r) =>
          r.map((c) =>
            c.row === row && c.col === col ? { ...c, userLetter: letter } : c
          )
        )
      )

      onPlaySound('click')

      // Move to next cell
      moveToNextCell(clue, row, col)

      // Check if clue is complete
      setTimeout(() => checkClueCompletion(clue.id), 100)
    } else if (e.key === 'Backspace') {
      // Clear current cell
      setGrid((prev) =>
        prev.map((r) =>
          r.map((c) =>
            c.row === row && c.col === col ? { ...c, userLetter: '' } : c
          )
        )
      )

      // Move to previous cell
      moveToPreviousCell(clue, row, col)
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      e.preventDefault()
      handleArrowKey(e.key)
    }
  }

  const moveToNextCell = (
    clue: CrosswordClue,
    currentRow: number,
    currentCol: number
  ) => {
    if (clue.direction === 'across') {
      const nextCol = currentCol + 1
      if (nextCol < clue.startCol + clue.answer.length) {
        setSelectedCell([currentRow, nextCol])
      }
    } else {
      const nextRow = currentRow + 1
      if (nextRow < clue.startRow + clue.answer.length) {
        setSelectedCell([nextRow, currentCol])
      }
    }
  }

  const moveToPreviousCell = (
    clue: CrosswordClue,
    currentRow: number,
    currentCol: number
  ) => {
    if (clue.direction === 'across') {
      const prevCol = currentCol - 1
      if (prevCol >= clue.startCol) {
        setSelectedCell([currentRow, prevCol])
      }
    } else {
      const prevRow = currentRow - 1
      if (prevRow >= clue.startRow) {
        setSelectedCell([prevRow, currentCol])
      }
    }
  }

  const handleArrowKey = (key: string) => {
    if (!selectedCell) return
    const [row, col] = selectedCell

    let newRow = row
    let newCol = col

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1)
        break
      case 'ArrowDown':
        newRow = Math.min(gridSize - 1, row + 1)
        break
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1)
        break
      case 'ArrowRight':
        newCol = Math.min(gridSize - 1, col + 1)
        break
    }

    if (!grid[newRow][newCol].isBlack) {
      setSelectedCell([newRow, newCol])
    }
  }

  const checkClueCompletion = (clueId: string) => {
    const clue = clues.find((c) => c.id === clueId)
    if (!clue || clue.solved) return

    let userAnswer = ''
    for (let i = 0; i < clue.answer.length; i++) {
      const row =
        clue.direction === 'across' ? clue.startRow : clue.startRow + i
      const col =
        clue.direction === 'across' ? clue.startCol + i : clue.startCol
      userAnswer += grid[row][col].userLetter
    }

    if (userAnswer === clue.answer) {
      // Clue solved!
      onPlaySound('correct')

      setClues((prev) =>
        prev.map((c) => (c.id === clueId ? { ...c, solved: true } : c))
      )

      // Mark cells as correct
      for (let i = 0; i < clue.answer.length; i++) {
        const row =
          clue.direction === 'across' ? clue.startRow : clue.startRow + i
        const col =
          clue.direction === 'across' ? clue.startCol + i : clue.startCol

        setGrid((prev) =>
          prev.map((r) =>
            r.map((c) =>
              c.row === row && c.col === col ? { ...c, isCorrect: true } : c
            )
          )
        )
      }

      setSolvedClues((prev) => prev + 1)

      // Award points
      const clueScore = clue.answer.length * 10
      onAddXP(clueScore)
      onAddCoins(clueScore)

      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1000)
    }
  }

  // Hint system
  const handleHint = () => {
    if (!selectedClue) return

    const clue = clues.find((c) => c.id === selectedClue)
    if (!clue || clue.solved) return

    // Fill in next empty letter
    for (let i = 0; i < clue.answer.length; i++) {
      const row =
        clue.direction === 'across' ? clue.startRow : clue.startRow + i
      const col =
        clue.direction === 'across' ? clue.startCol + i : clue.startCol

      if (!grid[row][col].userLetter) {
        setGrid((prev) =>
          prev.map((r) =>
            r.map((c) =>
              c.row === row && c.col === col
                ? { ...c, userLetter: c.letter }
                : c
            )
          )
        )

        setHintsUsed((prev) => prev + 1)
        onPlaySound('click')

        // Move to next cell
        moveToNextCell(clue, row, col)
        break
      }
    }

    // Check completion
    setTimeout(() => checkClueCompletion(clue.id), 100)
  }

  // Check game completion
  useEffect(() => {
    if (
      gameState === 'playing' &&
      solvedClues === totalClues &&
      totalClues > 0
    ) {
      setGameState('complete')
      onPlaySound('celebration')

      const accuracy = 100 - hintsUsed * 5
      const finalScore = solvedClues * 100 - hintsUsed * 20

      onAddXP(100) // Completion bonus
      onComplete(finalScore, accuracy)
    }
  }, [
    solvedClues,
    totalClues,
    gameState,
    hintsUsed,
    onComplete,
    onAddXP,
    onPlaySound,
  ])

  // Start game
  const handleStart = () => {
    generateGrid()
    setGameState('playing')
    setSolvedClues(0)
    setHintsUsed(0)
    setSelectedClue(null)
    setSelectedCell(null)
    onPlaySound('click')
  }

  // Play again
  const handlePlayAgain = () => {
    setGameState('ready')
    setShowCelebration(false)
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
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 shadow-2xl border-8 border-white">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex justify-center mb-6"
              >
                <Grid3X3 className="w-32 h-32 text-white drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white text-center mb-4 drop-shadow-lg">
                Crossword
              </h1>
              <p className="text-2xl text-white/90 text-center mb-8">
                🧩 Giải ô chữ thông minh!
              </p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Cách chơi:
                </h3>
                <ul className="space-y-2 text-white text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">📝</span>
                    <span>Chọn gợi ý và điền chữ vào ô</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">⌨️</span>
                    <span>Dùng bàn phím để gõ</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">💡</span>
                    <span>Nhấn Hint nếu cần giúp đỡ</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">✅</span>
                    <span>Hoàn thành tất cả các ô!</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {gridSize}×{gridSize} Grid
                  </p>
                </div>
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {inputClues.length} Clues
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleStart}
                className="w-full bg-white text-indigo-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
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
                <div className="text-2xl font-bold text-gray-700">
                  {solvedClues}/{totalClues} Clues Solved
                </div>

                <motion.button
                  onClick={handleHint}
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!selectedClue || solvedClues === totalClues}
                >
                  <Lightbulb className="w-5 h-5" />
                  Hint ({hintsUsed})
                </motion.button>
              </div>

              <div className="flex gap-6">
                {/* Grid */}
                <div className="flex-1">
                  <div className="inline-block bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4 shadow-inner">
                    <div
                      className="grid gap-0.5"
                      style={{
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {grid.map((row) =>
                        row.map((cell) => (
                          <button
                            key={`${cell.row}-${cell.col}`}
                            onClick={() => handleCellClick(cell.row, cell.col)}
                            className={`
                              relative w-10 h-10 font-bold text-lg
                              transition-all duration-150
                              ${
                                cell.isBlack
                                  ? 'bg-gray-800'
                                  : cell.isCorrect
                                    ? 'bg-green-400 text-white'
                                    : cell.isHighlighted
                                      ? 'bg-blue-200'
                                      : selectedCell &&
                                          selectedCell[0] === cell.row &&
                                          selectedCell[1] === cell.col
                                        ? 'bg-blue-400 text-white'
                                        : 'bg-white text-gray-700'
                              }
                            `}
                          >
                            {cell.number && (
                              <span className="absolute top-0 left-0.5 text-xs font-normal">
                                {cell.number}
                              </span>
                            )}
                            {!cell.isBlack && (
                              <span className="pt-2">{cell.userLetter}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Hidden input for keyboard */}
                  <input
                    ref={inputRef}
                    type="text"
                    className="opacity-0 absolute pointer-events-none"
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>

                {/* Clues List */}
                <div className="w-80">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 max-h-[600px] overflow-y-auto">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                      Clues
                    </h3>

                    {/* Across */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-indigo-600 mb-2">
                        Across →
                      </h4>
                      <div className="space-y-2">
                        {clues
                          .filter((c) => c.direction === 'across')
                          .map((clue) => (
                            <button
                              key={clue.id}
                              onClick={() => handleClueClick(clue.id)}
                              className={`
                                w-full text-left px-4 py-3 rounded-xl font-medium
                                transition-all duration-200
                                ${
                                  clue.solved
                                    ? 'bg-green-400 text-white'
                                    : selectedClue === clue.id
                                      ? 'bg-blue-400 text-white'
                                      : 'bg-white text-gray-700 hover:bg-blue-50'
                                }
                              `}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold">
                                  {clue.number}.
                                </span>
                                <span className="flex-1">{clue.clue}</span>
                                {clue.solved && (
                                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* Down */}
                    <div>
                      <h4 className="text-lg font-bold text-purple-600 mb-2">
                        Down ↓
                      </h4>
                      <div className="space-y-2">
                        {clues
                          .filter((c) => c.direction === 'down')
                          .map((clue) => (
                            <button
                              key={clue.id}
                              onClick={() => handleClueClick(clue.id)}
                              className={`
                                w-full text-left px-4 py-3 rounded-xl font-medium
                                transition-all duration-200
                                ${
                                  clue.solved
                                    ? 'bg-green-400 text-white'
                                    : selectedClue === clue.id
                                      ? 'bg-purple-400 text-white'
                                      : 'bg-white text-gray-700 hover:bg-purple-50'
                                }
                              `}
                            >
                              <div className="flex items-start gap-2">
                                <span className="font-bold">
                                  {clue.number}.
                                </span>
                                <span className="flex-1">{clue.clue}</span>
                                {clue.solved && (
                                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
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
            <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-8 shadow-2xl border-8 border-white text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
                className="flex justify-center mb-6"
              >
                <Trophy className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
                Puzzle Solved!
              </h1>
              <p className="text-3xl text-white/90 mb-8">
                🎉 Thật thông minh! 🎉
              </p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-4xl font-black">{solvedClues}</p>
                    <p className="text-lg">Clues Solved</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{hintsUsed}</p>
                    <p className="text-lg">Hints Used</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handlePlayAgain}
                className="w-full bg-white text-indigo-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🧩 Play Again
              </motion.button>
            </div>
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
            <div className="text-9xl">✅</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
