import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ListeningQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  timestamp?: number // Time in audio when question is relevant
}

interface AudioChapter {
  id: string
  title: string
  audioUrl: string
  transcript?: string
  illustration?: string
  questions: ListeningQuestion[]
  duration: number // seconds
}

interface ListeningActivityProps {
  chapters: AudioChapter[]
  onComplete: (score: number, correctAnswers: number) => void
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

export function ListeningActivity({
  chapters,
  onComplete,
  onAddXP,
  onAddCoins,
  onPlaySound,
}: ListeningActivityProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [gameState, setGameState] = useState<
    'ready' | 'listening' | 'quiz' | 'complete'
  >('ready')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showFeedback, setShowFeedback] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const progressInterval = useRef<number | null>(null)

  const currentChapter = chapters[currentChapterIndex]
  const totalQuestions = chapters.reduce(
    (sum, ch) => sum + ch.questions.length,
    0
  )

  const handleAudioEnd = useCallback(() => {
    setIsPlaying(false)
    setGameState('quiz')
    onPlaySound('click')
  }, [onPlaySound])

  // Mock audio simulation (replace with real audio)
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1
          if (next >= currentChapter.duration) {
            handleAudioEnd()
            return prev
          }
          return next
        })
      }, 100)
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, currentChapter.duration, handleAudioEnd])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    onPlaySound('click')
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    onPlaySound('click')
  }

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript)
    onPlaySound('click')
  }

  const handleSeek = (time: number) => {
    setCurrentTime(time)
  }

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    onPlaySound('click')
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (answers[questionId] !== undefined) return // Already answered

    const question = currentChapter.questions.find((q) => q.id === questionId)
    if (!question) return

    const isCorrect = answerIndex === question.correctAnswer
    setAnswers({ ...answers, [questionId]: answerIndex })

    if (isCorrect) {
      const points = 20
      setScore((s) => s + points)
      setCorrectCount((c) => c + 1)
      onAddXP(points)
      onAddCoins(10)
      onPlaySound('correct')
      setShowFeedback(questionId)
      setTimeout(() => setShowFeedback(null), 2000)
    } else {
      onPlaySound('wrong')
      setShowFeedback(questionId)
      setTimeout(() => setShowFeedback(null), 2000)
    }
  }

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((i) => i + 1)
      setCurrentTime(0)
      setGameState('listening')
      setShowTranscript(false)
      onPlaySound('click')
    } else {
      setGameState('complete')
      onComplete(score, correctCount)
      onPlaySound('celebration')
    }
  }

  const handleReplay = () => {
    setCurrentTime(0)
    setGameState('listening')
    setShowTranscript(false)
    onPlaySound('click')
  }

  const startGame = () => {
    setGameState('listening')
    onPlaySound('click')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white text-lg">{score}</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-white/70">Progress</div>
          <div className="font-bold text-white text-xl">
            {currentChapterIndex + 1} / {chapters.length}
          </div>
        </div>
      </div>

      {/* Ready State */}
      {gameState === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-600/90 to-blue-600/90 rounded-3xl p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Volume2 className="w-24 h-24 text-white mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Audio Adventure!
          </h2>
          <p className="text-xl text-white/90 mb-8 text-center max-w-md">
            🎧 Listen to the story
            <br />
            📝 Answer questions to earn points!
          </p>
          <div className="mb-8 text-center">
            <div className="text-lg text-white/80 mb-2">
              Story Chapters: {chapters.length}
            </div>
            <div className="text-lg text-white/80">
              Total Questions: {totalQuestions}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-cyan-600 rounded-2xl font-bold text-xl shadow-lg"
          >
            Start Adventure! 🚀
          </motion.button>
        </motion.div>
      )}

      {/* Listening State */}
      {gameState === 'listening' && currentChapter && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8">
          {/* Chapter Info */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold text-lg mb-4"
            >
              Chapter {currentChapterIndex + 1}: {currentChapter.title}
            </motion.div>
          </div>

          {/* Illustration */}
          {currentChapter.illustration && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-center"
            >
              <div className="w-full max-w-md h-48 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl flex items-center justify-center text-6xl">
                🎨
              </div>
            </motion.div>
          )}

          {/* Audio Player */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 mb-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentChapter.duration)}</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{
                    width: `${(currentTime / currentChapter.duration) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={currentChapter.duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                <RotateCcw className="w-5 h-5 text-gray-700" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlay}
                className="p-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMute}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-700" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeedChange}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-gray-700"
              >
                {playbackSpeed}x
              </motion.button>
            </div>
          </div>

          {/* Transcript Toggle */}
          <div className="flex justify-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTranscript}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold"
            >
              {showTranscript ? '🙈 Hide' : '📖 Show'} Transcript
            </motion.button>
          </div>

          {/* Transcript */}
          <AnimatePresence>
            {showTranscript && currentChapter.transcript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/60 backdrop-blur rounded-2xl p-6 mb-4"
              >
                <p className="text-lg text-gray-700 leading-relaxed">
                  {currentChapter.transcript}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Button */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAudioEnd}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg"
            >
              Continue to Quiz →
            </motion.button>
          </div>
        </div>
      )}

      {/* Quiz State */}
      {gameState === 'quiz' && currentChapter && (
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 overflow-y-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Answer the Questions!
          </h2>

          <div className="space-y-6">
            {currentChapter.questions.map((question, qIndex) => {
              const userAnswer = answers[question.id]
              const isAnswered = userAnswer !== undefined
              const isCorrect =
                isAnswered && userAnswer === question.correctAnswer

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: qIndex * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {qIndex + 1}
                    </div>
                    <p className="text-lg font-semibold text-gray-800 flex-1">
                      {question.question}
                    </p>
                    {isAnswered && (
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => {
                      const isSelected = userAnswer === optIndex
                      const isCorrectOption =
                        optIndex === question.correctAnswer
                      const showCorrect = isAnswered && isCorrectOption

                      return (
                        <motion.button
                          key={optIndex}
                          whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                          whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                          onClick={() =>
                            handleAnswerSelect(question.id, optIndex)
                          }
                          disabled={isAnswered}
                          className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                            isSelected && isCorrect
                              ? 'bg-green-100 border-2 border-green-500 text-green-700'
                              : isSelected && !isCorrect
                                ? 'bg-red-100 border-2 border-red-500 text-red-700'
                                : showCorrect
                                  ? 'bg-green-50 border-2 border-green-300 text-green-700'
                                  : isAnswered
                                    ? 'bg-gray-100 border-2 border-gray-200 text-gray-500'
                                    : 'bg-gray-50 hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-300 text-gray-700'
                          } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {option}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Feedback */}
                  <AnimatePresence>
                    {showFeedback === question.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`mt-4 p-3 rounded-xl ${
                          isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isCorrect
                          ? '✅ Correct! Great job!'
                          : '❌ Not quite. Try again next time!'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="flex-1 px-6 py-4 bg-gray-500 text-white rounded-2xl font-bold"
            >
              <RotateCcw className="w-5 h-5 inline mr-2" />
              Replay Audio
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextChapter}
              disabled={
                Object.keys(answers).length < currentChapter.questions.length
              }
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentChapterIndex < chapters.length - 1
                ? 'Next Chapter →'
                : 'Complete! 🎉'}
            </motion.button>
          </div>
        </div>
      )}

      {/* Complete State */}
      {gameState === 'complete' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          >
            <Trophy className="w-32 h-32 text-white mb-6" />
          </motion.div>
          <h2 className="text-5xl font-bold text-white mb-4">
            Adventure Complete!
          </h2>
          <div className="text-7xl font-black text-white mb-4">{score}</div>
          <div className="text-2xl text-white/90 mb-2">
            Correct: {correctCount} / {totalQuestions}
          </div>
          <div className="text-xl text-white/80">
            Accuracy: {Math.round((correctCount / totalQuestions) * 100)}%
          </div>
        </motion.div>
      )}
    </div>
  )
}
