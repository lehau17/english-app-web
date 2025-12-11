import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Trophy,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, type JSX } from 'react'
import type { QuizContent, QuizQuestion } from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'

export function QuizActivity({
  data,
  onResult,
}: {
  data: QuizContent
  onResult: (correct: boolean) => void
}): JSX.Element {
  // Detect format: single question or multiple questions
  const isMultipleFormat =
    Array.isArray(data.questions) && data.questions.length > 0

  // Single question state
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [showRetry, setShowRetry] = useState(false)

  // Multiple questions state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Array<number | null>>(
    isMultipleFormat && data.questions
      ? Array(data.questions.length).fill(null)
      : []
  )
  const [checkedQuestions, setCheckedQuestions] = useState<boolean[]>(
    isMultipleFormat && data.questions
      ? Array(data.questions.length).fill(false)
      : []
  )
  const [allCompleted, setAllCompleted] = useState(false)

  // Hotkeys for multiple format - MUST be before early returns
  useEffect(() => {
    if (isMultipleFormat && data.questions && data.questions.length > 0) {
      const currentQ = data.questions[currentQuestion]
      if (!currentQ) return

      const isAnswered = answers[currentQuestion] !== null
      const isChecked = checkedQuestions[currentQuestion]
      const canNext = currentQuestion < data.questions.length - 1

      const handleAnswerSelect = (optionIndex: number) => {
        if (isChecked) return
        const newAnswers = [...answers]
        newAnswers[currentQuestion] = optionIndex
        setAnswers(newAnswers)
      }

      const handleCheckMultiple = () => {
        if (!isAnswered) return
        const newChecked = [...checkedQuestions]
        newChecked[currentQuestion] = true
        setCheckedQuestions(newChecked)

        const allAnswered = answers.every((a) => a !== null)
        const allCheckedNow = newChecked.every((c) => c)

        if (allAnswered && allCheckedNow && !allCompleted) {
          setAllCompleted(true)
          const finalCorrectCount =
            data.questions?.filter(
              (q: QuizQuestion, idx: number) =>
                answers[idx] === q.correctIndex && newChecked[idx]
            ).length ?? 0
          const totalQuestions = data.questions?.length || 0
          const allCorrect = finalCorrectCount === totalQuestions
          onResult(allCorrect)
        }
      }

      const goToQuestion = (questionIndex: number) => {
        if (
          questionIndex >= 0 &&
          questionIndex < (data?.questions?.length || 0)
        ) {
          setCurrentQuestion(questionIndex)
        }
      }

      const handler = (e: KeyboardEvent) => {
        if (e.key === ' ' && isAnswered && !isChecked) {
          e.preventDefault()
          handleCheckMultiple()
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
    }
  }, [
    isMultipleFormat,
    data.questions,
    currentQuestion,
    answers,
    checkedQuestions,
    allCompleted,
    onResult,
  ])

  // Single question format
  if (!isMultipleFormat) {
    if (!data.question || !data.options || data.correctIndex === undefined) {
      return <div className="text-red-600">Invalid quiz data</div>
    }

    const correct = selected === data.correctIndex

    const handleCheck = () => {
      if (selected === null) return
      setChecked(true)
      if (correct) {
        onResult(true)
      } else {
        setShowRetry(true)
      }
    }

    const handleRetry = () => {
      setSelected(null)
      setChecked(false)
      setShowRetry(false)
    }

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold mb-2">{data.question}</h3>
          <div className="grid gap-2">
            {data.options.map((opt: string, idx: number) => {
              const isSel = selected === idx
              const showCorrect = checked && idx === data.correctIndex
              const showWrong = checked && isSel && !showCorrect
              return (
                <button
                  key={idx}
                  onClick={() => !checked && setSelected(idx)}
                  className={classNames(
                    'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition',
                    isSel && !checked && 'border-blue-500 bg-blue-50',
                    showCorrect && 'border-green-500 bg-green-50',
                    showWrong && 'border-red-500 bg-red-50',
                    !isSel && !checked && 'border-gray-200 hover:bg-gray-50',
                    checked && 'cursor-not-allowed'
                  )}
                  disabled={checked}
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
        </div>

        {/* Hiển thị đáp án đúng khi sai */}
        {checked && !correct && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Đáp án đúng:</span>
            </div>
            <p className="text-green-700">{data.options[data.correctIndex]}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!checked ? (
            <button
              disabled={selected === null}
              onClick={handleCheck}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition',
                selected === null && 'opacity-60 cursor-not-allowed'
              )}
            >
              <ShieldCheck className="h-4 w-4" /> Kiểm tra
            </button>
          ) : showRetry ? (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
            >
              <RotateCcw className="h-4 w-4" /> Trả lời lại
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
              <CheckCircle2 className="h-4 w-4" /> Chính xác!
            </div>
          )}

          {checked && data.explanation && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Giải thích:</span>{' '}
              {data.explanation}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Multiple questions format
  if (!isMultipleFormat || !data.questions || data.questions.length === 0) {
    return <div>Invalid format</div>
  }

  const currentQ = data.questions[currentQuestion]
  if (!currentQ) {
    return <div>Invalid question</div>
  }

  const isAnswered = answers[currentQuestion] !== null
  const isChecked = checkedQuestions[currentQuestion]
  const isCorrect = answers[currentQuestion] === currentQ.correctIndex

  const totalQuestions = data.questions.length
  const answeredCount = answers.filter((a) => a !== null).length
  const correctCount = data.questions.filter(
    (q: QuizQuestion, idx: number) =>
      answers[idx] === q.correctIndex && checkedQuestions[idx]
  ).length

  const canNext = currentQuestion < totalQuestions - 1
  const canPrev = currentQuestion > 0

  const handleCheckMultiple = () => {
    if (!isAnswered) return

    const newChecked = [...checkedQuestions]
    newChecked[currentQuestion] = true
    setCheckedQuestions(newChecked)

    // Check if all questions are answered and checked
    const allAnswered = answers.every((a) => a !== null)
    const allCheckedNow = newChecked.every((c) => c)

    if (allAnswered && allCheckedNow && !allCompleted) {
      setAllCompleted(true)
      // Recalculate correct count with latest check
      const finalCorrectCount =
        data.questions?.filter(
          (q: QuizQuestion, idx: number) =>
            answers[idx] === q.correctIndex && newChecked[idx]
        ).length ?? 0
      const allCorrect = finalCorrectCount === totalQuestions
      onResult(allCorrect)
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

  return (
    <div className="space-y-4">
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
          {data.questions.map((_: QuizQuestion, idx: number) => (
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
            {currentQ.options.map((opt: string, idx: number) => {
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

          {/* Hiển thị đáp án đúng khi sai */}
          {isChecked && !isCorrect && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Đáp án đúng:</span>
              </div>
              <p className="text-green-700">
                {currentQ.options[currentQ.correctIndex]}
              </p>
            </div>
          )}

          {/* Explanation */}
          {isChecked && currentQ.explanation && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Giải thích:</span>{' '}
              {currentQ.explanation}
            </div>
          )}

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
                  onClick={handleCheckMultiple}
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
              Hoàn thành Quiz!
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
