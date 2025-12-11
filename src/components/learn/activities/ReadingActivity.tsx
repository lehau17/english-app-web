import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'
import TextInteractionWrapper from '../../common/TextInteractionWrapper'
import type { ReadingContent, ReadingQuestion } from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'

export function ReadingActivity({
  data,
  onPass,
}: {
  data: ReadingContent
  onPass: () => void
}): JSX.Element {
  // Detect format: single question or multiple questions
  const isMultipleFormat =
    Array.isArray(data.questions) && data.questions.length > 0

  // Single question state
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

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
  const [showPassage, setShowPassage] = useState(true)
  const [allCompleted, setAllCompleted] = useState(false)

  // Calculate correct answer for single format
  const correct =
    !isMultipleFormat && data.correctIndex !== undefined
      ? selected === data.correctIndex
      : false

  // Multiple questions format keyboard shortcuts - must be before early returns
  useEffect(() => {
    if (!isMultipleFormat || !data.questions || data.questions.length === 0) {
      return
    }

    const currentQ = data.questions[currentQuestion]
    if (!currentQ) return

    const isAnswered = answers[currentQuestion] !== null
    const isChecked = checkedQuestions[currentQuestion]
    const canNext = currentQuestion < data.questions.length - 1

    const handleCheckMultiple = () => {
      if (!isAnswered) return

      const newChecked = [...checkedQuestions]
      newChecked[currentQuestion] = true
      setCheckedQuestions(newChecked)

      // Check if all questions are answered and checked
      const allAnsweredNow = answers.every((a) => a !== null)
      const allCheckedNow = newChecked.every((c) => c)

      if (allAnsweredNow && allCheckedNow && !allCompleted) {
        setAllCompleted(true)
        onPass()
      }
    }

    const handleAnswerSelect = (optionIndex: number) => {
      if (isChecked) return
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = optionIndex
      setAnswers(newAnswers)
    }

    const goToQuestion = (questionIndex: number) => {
      if (questionIndex >= 0 && questionIndex < data.questions!.length) {
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
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault()
        setShowPassage((prev) => !prev)
      } else if (['1', '2', '3', '4'].includes(e.key) && !isChecked) {
        const idx = parseInt(e.key) - 1
        if (currentQ?.options && idx < currentQ.options.length) {
          handleAnswerSelect(idx)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    isMultipleFormat,
    data.questions,
    currentQuestion,
    answers,
    checkedQuestions,
    allCompleted,
    onPass,
    showPassage,
  ])

  // useEffect must be called at top level, not conditionally
  useEffect(() => {
    if (!isMultipleFormat && checked && correct) {
      onPass()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, correct, isMultipleFormat])

  // Single question format
  if (!isMultipleFormat) {
    if (!data.question || !data.options || data.correctIndex === undefined) {
      return <div className="text-red-600">Invalid reading data</div>
    }

    const handleRetry = () => {
      setSelected(null)
      setChecked(false)
    }

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold mb-2">Đoạn văn</h3>
          <TextInteractionWrapper>
            <p className="text-sm leading-6 text-gray-800">{data.passage}</p>
          </TextInteractionWrapper>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
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

          {/* Hiển thị đáp án đúng khi sai */}
          {checked && !correct && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Đáp án đúng:</span>
              </div>
              <p className="text-green-700">
                {data.options[data.correctIndex]}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Multiple questions format
  if (!data.questions || data.questions.length === 0) {
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
  // Removed unused correctCount

  const canNext = currentQuestion < totalQuestions - 1
  const canPrev = currentQuestion > 0

  const handleCheckMultiple = () => {
    if (!isAnswered) return

    const newChecked = [...checkedQuestions]
    newChecked[currentQuestion] = true
    setCheckedQuestions(newChecked)

    // Check if all questions are answered and checked
    const allAnsweredNow = answers.every((a) => a !== null)
    const allCheckedNow = newChecked.every((c) => c)

    if (allAnsweredNow && allCheckedNow && !allCompleted) {
      setAllCompleted(true)
      onPass()
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

  const passage = data.passage || ''

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPassage(true)}
          className={classNames(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition',
            showPassage
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Đoạn văn
        </button>
        <button
          onClick={() => setShowPassage(false)}
          className={classNames(
            'flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm transition',
            !showPassage
              ? 'border-blue-500 bg-blue-600 text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          <HelpCircle className="h-4 w-4" />
          Câu hỏi ({currentQuestion + 1}/{totalQuestions})
        </button>
      </div>

      {showPassage ? (
        /* Passage View */
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold mb-2">Đọc đoạn văn sau</h3>
          <TextInteractionWrapper>
            <p className="text-sm leading-6 text-gray-800">{passage}</p>
          </TextInteractionWrapper>
          <button
            onClick={() => setShowPassage(false)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Tiếp tục làm câu hỏi
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Questions View */
        <>
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
              {data.questions.map((_: ReadingQuestion, idx: number) => (
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
                        !isSel &&
                          !isChecked &&
                          'border-gray-200 hover:bg-gray-50',
                        isChecked && 'cursor-not-allowed'
                      )}
                    >
                      <span className="text-sm">{opt}</span>
                      {showCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {showWrong && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Hiển thị đáp án đúng khi sai */}
              {isChecked && !isCorrect && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Đáp án đúng:
                    </span>
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
        </>
      )}
    </div>
  )
}
