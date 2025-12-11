import { motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Trophy,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'
import type {
  ActivityCompletePayload,
  ListeningContent,
} from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'

export function ListeningActivity({
  data,
  onPass,
}: {
  data: ListeningContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array(data.questions.length).fill(null)
  )
  const [checkedQuestions, setCheckedQuestions] = useState<boolean[]>(
    Array(data.questions.length).fill(false)
  )
  const [allCompleted, setAllCompleted] = useState(false)

  const currentQ = data.questions[currentQuestion]
  const isAnswered = answers[currentQuestion] !== null
  const isChecked = checkedQuestions[currentQuestion]
  const isCorrect = answers[currentQuestion] === currentQ?.correctIndex

  const totalQuestions = data.questions.length
  const answeredCount = answers.filter((a) => a !== null).length
  const correctCount = data.questions.filter(
    (q, idx) => answers[idx] === q.correctIndex && checkedQuestions[idx]
  ).length

  const canNext = currentQuestion < totalQuestions - 1
  const canPrev = currentQuestion > 0

  const handleCheck = () => {
    if (!isAnswered) return

    const newChecked = [...checkedQuestions]
    newChecked[currentQuestion] = true
    setCheckedQuestions(newChecked)

    // Check if all questions are answered and checked
    const allAnswered = answers.every((a) => a !== null)
    const allCheckedNow = newChecked.every((c) => c)

    if (allAnswered && allCheckedNow && !allCompleted) {
      setAllCompleted(true)
      const finalScore = Math.round(
        ((correctCount + (isCorrect ? 1 : 0)) / totalQuestions) * 100
      )
      onPass({
        score: finalScore,
        feedback: `Bạn đã trả lời đúng ${correctCount + (isCorrect ? 1 : 0)}/${totalQuestions} câu hỏi.`,
      })
    }
  }

  const handleAnswerSelect = (optionIndex: number) => {
    if (isChecked) return
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const goToQuestion = (questionIndex: number) => {
    if (questionIndex >= 0 && questionIndex < totalQuestions) {
      setCurrentQuestion(questionIndex)
    }
  }

  // Hotkeys for Listening: 1-4 = select option, Space = check, Enter = next question
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && isAnswered && !isChecked) {
        e.preventDefault()
        handleCheck()
      } else if (e.key === 'Enter' && isChecked && canNext) {
        e.preventDefault()
        goToQuestion(currentQuestion + 1)
      } else if (['1', '2', '3', '4'].includes(e.key) && !isChecked) {
        const idx = parseInt(e.key) - 1
        if (currentQ?.options && idx < currentQ.options.length) {
          handleAnswerSelect(idx)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isAnswered, isChecked, canNext, currentQuestion, currentQ])

  useEffect(() => {
    // Auto-advance to next question after checking (if not last question)
    if (isChecked && canNext && !allCompleted) {
      const timer = setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isChecked, canNext, currentQuestion, allCompleted])

  return (
    <div className="space-y-4">
      {/* Audio và instructions */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Headphones className="h-5 w-5" /> Nghe và trả lời câu hỏi
        </h3>
        <p className="text-sm text-gray-600 mb-3">{data.instructions}</p>
        <audio controls className="w-full">
          <source src={data.audioUrl} />
        </audio>
      </div>

      {/* Progress indicator */}
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>
            Câu hỏi {currentQuestion + 1}/{totalQuestions}
          </span>
          <span>
            Đã trả lời: {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="flex gap-1">
          {data.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToQuestion(idx)}
              className={classNames(
                'flex-1 h-3 rounded transition-colors',
                idx === currentQuestion
                  ? 'bg-blue-500'
                  : answers[idx] !== null
                    ? checkedQuestions[idx]
                      ? answers[idx] === data.questions?.[idx].correctIndex
                        ? 'bg-green-400'
                        : 'bg-red-400'
                      : 'bg-yellow-400'
                    : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Current question */}
      {currentQ && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="font-semibold mb-3">{currentQ.question}</h4>
          <div className="grid gap-2">
            {currentQ.options.map((opt, idx) => {
              const isSel = answers[currentQuestion] === idx
              const showCorrect = isChecked && idx === currentQ.correctIndex
              const showWrong = isChecked && isSel && !showCorrect
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={isChecked}
                  className={classNames(
                    'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition',
                    isSel && !isChecked && 'border-blue-500 bg-blue-50',
                    showCorrect && 'border-green-500 bg-green-50',
                    showWrong && 'border-red-500 bg-red-50',
                    !isSel && !isChecked && 'border-gray-200 hover:bg-gray-50',
                    isChecked && 'cursor-not-allowed'
                  )}
                >
                  <span className="text-sm">{opt}</span>
                  {showCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {showWrong && <XCircle className="h-5 w-5 text-red-600" />}
                </button>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => goToQuestion(currentQuestion - 1)}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  canPrev
                    ? 'border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="h-4 w-4" /> Câu trước
              </button>

              {!isChecked ? (
                <button
                  disabled={!isAnswered}
                  onClick={handleCheck}
                  className={classNames(
                    'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
                    !isAnswered && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <ShieldCheck className="h-4 w-4" /> Kiểm tra
                </button>
              ) : (
                <div
                  className={classNames(
                    'inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg',
                    isCorrect
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Chính xác!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" /> Chưa đúng
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              disabled={!canNext || !isChecked}
              onClick={() => goToQuestion(currentQuestion + 1)}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                canNext && isChecked
                  ? 'border-gray-300 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Câu tiếp <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Final results */}
      {allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-200 bg-green-50 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">
              Hoàn thành bài nghe!
            </span>
          </div>
          <p className="text-green-700">
            Bạn đã trả lời đúng{' '}
            <strong>
              {correctCount}/{totalQuestions}
            </strong>{' '}
            câu hỏi. Điểm số:{' '}
            <strong>
              {Math.round((correctCount / totalQuestions) * 100)}/100
            </strong>
          </p>
        </motion.div>
      )}
    </div>
  )
}
