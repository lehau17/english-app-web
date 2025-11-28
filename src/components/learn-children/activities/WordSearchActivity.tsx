import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Lightbulb, Search, Star, Trophy } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

// Types
interface WordSearchWord {
  id: string
  word: string
  found: boolean
  cells: [number, number][] // [row, col] positions
}

interface WordSearchActivityProps {
  words: string[]
  gridSize: number // 8, 10, or 12
  onComplete: (score: number, foundWords: number) => void
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

type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'diagonal-reverse'

interface Cell {
  letter: string
  row: number
  col: number
  isSelected: boolean
  isFound: boolean
  wordId?: string
}

const DIRECTIONS: Direction[] = [
  'horizontal',
  'vertical',
  'diagonal',
  'diagonal-reverse',
]

/**
 * WordSearchActivity - Grid-based word finding game
 * Kids drag/touch to select letters and find hidden words
 */
export function WordSearchActivity({
  words,
  gridSize,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: WordSearchActivityProps) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [wordList, setWordList] = useState<WordSearchWord[]>([])
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [foundWords, setFoundWords] = useState(0)
  const [score, setScore] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'complete'>(
    'ready'
  )
  const [showCelebration, setShowCelebration] = useState(false)

  // Generate word search grid
  const generateGrid = useCallback(() => {
    const newGrid: Cell[][] = Array(gridSize)
      .fill(null)
      .map((_, row) =>
        Array(gridSize)
          .fill(null)
          .map((_, col) => ({
            letter: '',
            row,
            col,
            isSelected: false,
            isFound: false,
          }))
      )

    const placedWords: WordSearchWord[] = []

    // Place each word in the grid
    words.forEach((word) => {
      const upperWord = word.toUpperCase()
      let placed = false
      let attempts = 0
      const maxAttempts = 100

      while (!placed && attempts < maxAttempts) {
        attempts++
        const direction =
          DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
        const startRow = Math.floor(Math.random() * gridSize)
        const startCol = Math.floor(Math.random() * gridSize)

        if (canPlaceWord(newGrid, upperWord, startRow, startCol, direction)) {
          const cells = placeWord(
            newGrid,
            upperWord,
            startRow,
            startCol,
            direction
          )
          placedWords.push({
            id: Math.random().toString(),
            word: upperWord,
            found: false,
            cells,
          })
          placed = true
        }
      }
    })

    // Fill empty cells with random letters
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (!newGrid[row][col].letter) {
          const randomLetter = String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )
          newGrid[row][col].letter = randomLetter
        }
      }
    }

    setGrid(newGrid)
    setWordList(placedWords)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, gridSize])

  const canPlaceWord = (
    grid: Cell[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: Direction
  ): boolean => {
    const deltas = getDirectionDeltas(direction)

    for (let i = 0; i < word.length; i++) {
      const row = startRow + deltas.rowDelta * i
      const col = startCol + deltas.colDelta * i

      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return false
      }

      if (grid[row][col].letter && grid[row][col].letter !== word[i]) {
        return false
      }
    }

    return true
  }

  const placeWord = (
    grid: Cell[][],
    word: string,
    startRow: number,
    startCol: number,
    direction: Direction
  ): [number, number][] => {
    const deltas = getDirectionDeltas(direction)
    const cells: [number, number][] = []

    for (let i = 0; i < word.length; i++) {
      const row = startRow + deltas.rowDelta * i
      const col = startCol + deltas.colDelta * i
      grid[row][col].letter = word[i]
      cells.push([row, col])
    }

    return cells
  }

  const getDirectionDeltas = (direction: Direction) => {
    switch (direction) {
      case 'horizontal':
        return { rowDelta: 0, colDelta: 1 }
      case 'vertical':
        return { rowDelta: 1, colDelta: 0 }
      case 'diagonal':
        return { rowDelta: 1, colDelta: 1 }
      case 'diagonal-reverse':
        return { rowDelta: 1, colDelta: -1 }
    }
  }

  // Handle cell selection
  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setSelectedCells([[row, col]])
    updateGridSelection([[row, col]])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isDragging) return

    const lastCell = selectedCells[selectedCells.length - 1]
    if (!lastCell) return

    // Check if cells are adjacent
    const isAdjacent =
      Math.abs(lastCell[0] - row) <= 1 && Math.abs(lastCell[1] - col) <= 1

    if (isAdjacent) {
      const newSelection = [...selectedCells, [row, col] as [number, number]]
      setSelectedCells(newSelection)
      updateGridSelection(newSelection)
    }
  }

  const handleCellMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    checkSelectedWord()
  }

  const updateGridSelection = (selected: [number, number][]) => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          isSelected: selected.some(
            ([r, c]) => r === cell.row && c === cell.col
          ),
        }))
      )
    )
  }

  const checkSelectedWord = () => {
    if (selectedCells.length === 0) return

    const selectedWord = selectedCells
      .map(([row, col]) => grid[row][col].letter)
      .join('')

    // Check if selected word matches any word in the list
    const matchedWord = wordList.find(
      (w) =>
        !w.found &&
        (w.word === selectedWord ||
          w.word === selectedWord.split('').reverse().join(''))
    )

    if (matchedWord) {
      // Word found!
      onPlaySound('correct')
      markWordAsFound(matchedWord)
      setFoundWords((prev) => prev + 1)

      const wordScore = matchedWord.word.length * 10
      setScore((prev) => prev + wordScore)
      onAddXP(wordScore)
      onAddCoins(wordScore)

      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 1000)
    } else {
      onPlaySound('wrong')
    }

    // Clear selection
    setSelectedCells([])
    updateGridSelection([])
  }

  const markWordAsFound = (word: WordSearchWord) => {
    setWordList((prev) =>
      prev.map((w) => (w.id === word.id ? { ...w, found: true } : w))
    )

    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          isFound:
            cell.isFound ||
            word.cells.some(([r, c]) => r === cell.row && c === cell.col),
          wordId: word.cells.some(([r, c]) => r === cell.row && c === cell.col)
            ? word.id
            : cell.wordId,
        }))
      )
    )
  }

  // Hint system
  const handleHint = () => {
    const unfoundWords = wordList.filter((w) => !w.found)
    if (unfoundWords.length === 0) return

    const randomWord =
      unfoundWords[Math.floor(Math.random() * unfoundWords.length)]
    const firstCell = randomWord.cells[0]

    // Highlight first letter for 2 seconds
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          isSelected: cell.row === firstCell[0] && cell.col === firstCell[1],
        }))
      )
    )

    setTimeout(() => {
      setGrid((prev) =>
        prev.map((row) =>
          row.map((cell) => ({
            ...cell,
            isSelected: false,
          }))
        )
      )
    }, 2000)

    setHintsUsed((prev) => prev + 1)
    onPlaySound('click')
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
      foundWords === wordList.length &&
      wordList.length > 0
    ) {
      setGameState('complete')
      onPlaySound('celebration')

      // Time bonus
      const timeBonus = Math.max(0, 300 - timeElapsed) // Max 5 minutes
      const finalScore = score + timeBonus - hintsUsed * 10

      onAddXP(100) // Completion bonus
      onComplete(finalScore, foundWords)
    }
  }, [
    foundWords,
    wordList.length,
    gameState,
    score,
    timeElapsed,
    hintsUsed,
    onComplete,
    onAddXP,
    onPlaySound,
  ])

  // Start game
  const handleStart = () => {
    generateGrid()
    setGameState('playing')
    setFoundWords(0)
    setScore(0)
    setHintsUsed(0)
    setTimeElapsed(0)
    onPlaySound('click')
  }

  // Play again
  const handlePlayAgain = () => {
    setGameState('ready')
    setShowCelebration(false)
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
            <div className="bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 rounded-3xl p-8 shadow-2xl border-8 border-white">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex justify-center mb-6"
              >
                <Search className="w-32 h-32 text-white drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white text-center mb-4 drop-shadow-lg">
                Word Search
              </h1>
              <p className="text-2xl text-white/90 text-center mb-8">
                🔍 Tìm từ ẩn trong lưới!
              </p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Cách chơi:
                </h3>
                <ul className="space-y-2 text-white text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">👆</span>
                    <span>Kéo ngón tay qua các chữ cái</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">🔤</span>
                    <span>Tìm {words.length} từ vựng ẩn trong lưới</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">💡</span>
                    <span>Dùng gợi ý nếu khó quá!</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <span>Càng nhanh, càng nhiều điểm!</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    Grid: {gridSize}×{gridSize}
                  </p>
                </div>
                <div className="bg-white/30 rounded-xl px-6 py-3">
                  <p className="text-white font-bold text-center">
                    {words.length} Words
                  </p>
                </div>
              </div>

              <motion.button
                onClick={handleStart}
                className="w-full bg-white text-teal-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔍 Start Searching!
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
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">
                        {formatTime(timeElapsed)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">{score} pts</span>
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-bold text-gray-700">
                  {foundWords}/{wordList.length} Found
                </div>

                <motion.button
                  onClick={handleHint}
                  className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl px-6 py-3 font-bold flex items-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={foundWords === wordList.length}
                >
                  <Lightbulb className="w-5 h-5" />
                  Hint ({hintsUsed})
                </motion.button>
              </div>

              <div className="flex gap-6">
                {/* Grid */}
                <div className="flex-1">
                  <div
                    className="inline-block bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-4 shadow-inner"
                    onMouseUp={handleCellMouseUp}
                    onMouseLeave={() => {
                      setIsDragging(false)
                      setSelectedCells([])
                      updateGridSelection([])
                    }}
                  >
                    <div
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      }}
                    >
                      {grid.map((row) =>
                        row.map((cell) => (
                          <motion.button
                            key={`${cell.row}-${cell.col}`}
                            className={`
                              w-10 h-10 rounded-lg font-bold text-lg
                              transition-all duration-150 select-none
                              ${
                                cell.isFound
                                  ? 'bg-green-400 text-white shadow-lg'
                                  : cell.isSelected
                                    ? 'bg-blue-400 text-white shadow-lg scale-110'
                                    : 'bg-white text-gray-700 hover:bg-blue-50'
                              }
                            `}
                            onMouseDown={() =>
                              handleCellMouseDown(cell.row, cell.col)
                            }
                            onMouseEnter={() =>
                              handleCellMouseEnter(cell.row, cell.col)
                            }
                            animate={cell.isFound ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {cell.letter}
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Word List */}
                <div className="w-64">
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                      Words to Find
                    </h3>
                    <div className="space-y-2">
                      {wordList.map((word) => (
                        <motion.div
                          key={word.id}
                          className={`
                            px-4 py-3 rounded-xl font-bold text-center
                            transition-all duration-300
                            ${
                              word.found
                                ? 'bg-green-400 text-white line-through'
                                : 'bg-white text-gray-700'
                            }
                          `}
                          animate={word.found ? { scale: [1, 1.1, 1] } : {}}
                        >
                          {word.word}
                        </motion.div>
                      ))}
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
            <div className="bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 rounded-3xl p-8 shadow-2xl border-8 border-white text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1 }}
                className="flex justify-center mb-6"
              >
                <Trophy className="w-32 h-32 text-yellow-300 drop-shadow-lg" />
              </motion.div>

              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
                All Words Found!
              </h1>
              <p className="text-3xl text-white/90 mb-8">Tuyệt vời! 🎉</p>

              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-4xl font-black">{score}</p>
                    <p className="text-lg">Final Score</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">
                      {formatTime(timeElapsed)}
                    </p>
                    <p className="text-lg">Time</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{foundWords}</p>
                    <p className="text-lg">Words Found</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black">{hintsUsed}</p>
                    <p className="text-lg">Hints Used</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handlePlayAgain}
                className="w-full bg-white text-teal-600 rounded-2xl py-6 text-3xl font-black shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔍 Play Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Overlay */}
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
