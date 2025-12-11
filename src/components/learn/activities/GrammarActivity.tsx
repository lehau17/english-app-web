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
import type { GrammarContent, GrammarExercise } from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'

export function GrammarActivity({
  data,
  onPass,
}: {
  data: GrammarContent
  onPass: () => void
}): JSX.Element {
  // Detect format: single exercise or multiple exercises
  const isMultipleFormat =
    Array.isArray(data.exercises) && data.exercises.length > 0

  // Single exercise state
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  // Multiple exercises state
  const [currentExercise, setCurrentExercise] = useState(0)
  const [answers, setAnswers] = useState<Array<string | null>>(
    isMultipleFormat && data.exercises
      ? Array(data.exercises.length).fill(null)
      : []
  )
  const [checkedExercises, setCheckedExercises] = useState<boolean[]>(
    isMultipleFormat && data.exercises
      ? Array(data.exercises.length).fill(false)
      : []
  )
  const [allCompleted, setAllCompleted] = useState(false)

  // Calculate correct answer for single format
  const correct =
    !isMultipleFormat && data.correctIndex !== undefined
      ? selected === data.correctIndex
      : false

  // useEffect must be called at top level, not conditionally
  useEffect(() => {
    if (!isMultipleFormat && checked && correct) {
      onPass()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, correct, isMultipleFormat])

  // Multiple exercises format keyboard shortcuts - must be before early returns
  useEffect(() => {
    if (!isMultipleFormat || !data.exercises || data.exercises.length === 0) {
      return
    }

    const currentEx = data.exercises[currentExercise]
    if (!currentEx) return

    const isAnswered = answers[currentExercise] !== null
    const isChecked = checkedExercises[currentExercise]
    const canNext = currentExercise < data.exercises.length - 1

    const handleCheckMultiple = () => {
      if (!isAnswered) return

      const newChecked = [...checkedExercises]
      newChecked[currentExercise] = true
      setCheckedExercises(newChecked)

      // Check if all exercises are answered and checked
      const allAnsweredNow = answers.every((a) => a !== null)
      const allCheckedNow = newChecked.every((c) => c)

      if (allAnsweredNow && allCheckedNow && !allCompleted) {
        setAllCompleted(true)
        onPass()
      }
    }

    const handleAnswerSelect = (answer: string) => {
      if (isChecked) return
      const newAnswers = [...answers]
      newAnswers[currentExercise] = answer
      setAnswers(newAnswers)
    }

    const goToExercise = (exerciseIndex: number) => {
      if (exerciseIndex >= 0 && exerciseIndex < data.exercises!.length) {
        setCurrentExercise(exerciseIndex)
      }
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && isAnswered && !isChecked) {
        e.preventDefault()
        handleCheckMultiple()
      } else if (e.key === 'Enter' && isChecked && canNext) {
        e.preventDefault()
        goToExercise(currentExercise + 1)
      } else if (['1', '2', '3', '4'].includes(e.key) && !isChecked) {
        const idx = parseInt(e.key) - 1
        if (currentEx?.options && idx < currentEx.options.length) {
          handleAnswerSelect(currentEx.options[idx])
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    isMultipleFormat,
    data.exercises,
    currentExercise,
    answers,
    checkedExercises,
    allCompleted,
    onPass,
  ])

  // Single exercise format
  if (!isMultipleFormat) {
    if (!data.question || !data.options || data.correctIndex === undefined) {
      return <div className="text-red-600">Invalid grammar data</div>
    }

    const handleRetry = () => {
      setSelected(null)
      setChecked(false)
    }

    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-indigo-900 text-sm">
          Quy tắc: {data.rule}
        </div>
        <h4 className="font-medium mb-2">{data.question}</h4>
        <div className="grid gap-2">
          {data.options.map((o: string, i: number) => {
            const isSel = selected === i
            const showCorrect = checked && i === data.correctIndex
            const showWrong = checked && isSel && !showCorrect
            return (
              <button
                key={i}
                onClick={() => !checked && setSelected(i)}
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
                <span className="text-sm">{o}</span>
                {showCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {showWrong && <XCircle className="h-5 w-5 text-red-600" />}
              </button>
            )
          })}
        </div>

        {checked && selected !== data.correctIndex && (
          <div className="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">
              <strong>Đáp án đúng:</strong> {data.options[data.correctIndex]}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          {!checked ? (
            <button
              disabled={selected === null}
              onClick={() => setChecked(true)}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
                selected === null && 'opacity-60 cursor-not-allowed'
              )}
            >
              <ShieldCheck className="h-4 w-4" /> Kiểm tra
            </button>
          ) : correct ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
              <CheckCircle2 className="h-4 w-4" /> Chính xác!
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
            >
              <RotateCcw className="h-4 w-4" /> Làm lại
            </button>
          )}
        </div>
      </div>
    )
  }

  // Multiple exercises format
  if (!data.exercises || data.exercises.length === 0) {
    return <div>Invalid format</div>
  }

  const currentEx = data.exercises[currentExercise]
  if (!currentEx) {
    return <div>Invalid exercise</div>
  }

  const isAnswered = answers[currentExercise] !== null
  const isChecked = checkedExercises[currentExercise]
  const isCorrect = answers[currentExercise] === currentEx.correctAnswer

  const totalExercises = data.exercises.length
  const answeredCount = answers.filter((a) => a !== null).length
  const correctCount = data.exercises.filter(
    (ex: GrammarExercise, idx: number) =>
      answers[idx] === ex.correctAnswer && checkedExercises[idx]
  ).length

  const canNext = currentExercise < totalExercises - 1
  const canPrev = currentExercise > 0

  const handleCheckMultiple = () => {
    if (!isAnswered) return

    const newChecked = [...checkedExercises]
    newChecked[currentExercise] = true
    setCheckedExercises(newChecked)

    // Check if all exercises are answered and checked
    const allAnsweredNow = answers.every((a) => a !== null)
    const allCheckedNow = newChecked.every((c) => c)

    if (allAnsweredNow && allCheckedNow && !allCompleted) {
      setAllCompleted(true)
      onPass()
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (isChecked) return
    const newAnswers = [...answers]
    newAnswers[currentExercise] = answer
    setAnswers(newAnswers)
  }

  const goToExercise = (exerciseIndex: number) => {
    if (exerciseIndex >= 0 && exerciseIndex < totalExercises) {
      setCurrentExercise(exerciseIndex)
    }
  }

  return (
    <div className="space-y-4">
      {/* Rule/Explanation */}
      {data?.rule && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-indigo-900 text-sm">
            Quy tắc: {data.rule}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>
            Câu {currentExercise + 1}/{totalExercises}
          </span>
          <span>
            Đã trả lời: {answeredCount}/{totalExercises}
          </span>
        </div>
        <div className="flex gap-1">
          {data.exercises.map((_: GrammarExercise, idx: number) => (
            <button
              key={idx}
              onClick={() => goToExercise(idx)}
              className={classNames(
                'flex-1 h-3 rounded transition-colors',
                idx === currentExercise
                  ? 'bg-blue-500'
                  : answers[idx] !== null
                    ? checkedExercises[idx]
                      ? answers[idx] === data.exercises?.[idx].correctAnswer
                        ? 'bg-green-400'
                        : 'bg-red-400'
                      : 'bg-yellow-400'
                    : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Current exercise */}
      {currentEx && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h4 className="font-medium mb-2">{currentEx.question}</h4>
          <div className="grid gap-2">
            {currentEx.options.map((opt: string, idx: number) => {
              const isSel = answers[currentExercise] === opt
              const showCorrect = isChecked && opt === currentEx.correctAnswer
              const showWrong = isChecked && isSel && !showCorrect
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(opt)}
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
            <div className="mt-4 rounded-lg border-l-4 border-green-500 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-800">
                <strong>Đáp án đúng:</strong> {currentEx.correctAnswer}
              </p>
            </div>
          )}

          {/* Explanation */}
          {isChecked && currentEx.explanation && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Giải thích:</span>{' '}
              {currentEx.explanation}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={!canPrev}
                onClick={() => goToExercise(currentExercise - 1)}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  canPrev
                    ? 'border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="h-4 w-4" /> Trước
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
              onClick={() => goToExercise(currentExercise + 1)}
              className={classNames(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                canNext && isChecked
                  ? 'border-gray-300 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              Tiếp <ChevronRight className="h-4 w-4" />
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
              Hoàn thành bài tập ngữ pháp!
            </span>
          </div>
          <p className="text-green-700">
            Bạn đã làm đúng{' '}
            <strong>
              {correctCount}/{totalExercises}
            </strong>{' '}
            câu. Điểm số:{' '}
            <strong>
              {Math.round((correctCount / totalExercises) * 100)}/100
            </strong>
          </p>
        </motion.div>
      )}
    </div>
  )
}
