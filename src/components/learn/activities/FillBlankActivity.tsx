import { CheckCircle2, RotateCcw, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useState, type JSX, type DragEvent } from 'react'
import type {
  ActivityCompletePayload,
  FillBlankContent,
} from '../../../types/learn.type'

export function FillBlankActivity({
  data,
  onPass,
}: {
  data: FillBlankContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  // Move regex outside useMemo to avoid dependency changes
  const placeholderReGlobal = useMemo(() => /(\[_{2,}\]|_{3,})/g, [])
  const placeholderTokenRe = useMemo(() => /^(\[_{2,}\]|_{3,})$/, [])
  const tokens = useMemo(
    () => (data.passage || '').split(placeholderReGlobal),
    [data.passage, placeholderReGlobal]
  )
  const placeholderCount = useMemo(
    () => tokens.filter((t) => placeholderTokenRe.test(t)).length,
    [tokens, placeholderTokenRe]
  )

  // State for drag & drop
  const [droppedAnswers, setDroppedAnswers] = useState<(string | null)[]>(
    Array(placeholderCount).fill(null)
  )
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<boolean[]>([])

  // Initialize available words (shuffle blanks + some distractors)
  useEffect(() => {
    if (data.blanks?.length) {
      const correctAnswers = [...data.blanks]
      // Add some simple distractors if we have fewer blanks than placeholders
      const distractors = [
        'the',
        'and',
        'is',
        'are',
        'was',
        'were',
        'have',
        'has',
      ]
      const shuffledWords = [
        ...correctAnswers,
        ...distractors.slice(0, Math.max(0, 3)),
      ]
      // Shuffle the words
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledWords[i], shuffledWords[j]] = [
          shuffledWords[j],
          shuffledWords[i],
        ]
      }
      setAvailableWords(shuffledWords)
    }
  }, [data.blanks])

  useEffect(() => {
    if (placeholderCount === 0) {
      onPass({ score: 100 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderCount])

  const normalize = (s: string) => s.trim().toLowerCase()

  const handleCheck = () => {
    const expectedRaw = (data.blanks ?? []).slice(0, placeholderCount)
    const expected = expectedRaw.map(normalize)
    const got = droppedAnswers
      .slice(0, placeholderCount)
      .map((answer) => (answer ? normalize(answer) : ''))
    const per = Array.from({ length: placeholderCount }, (_, i) => {
      const expectedAnswer = expected[i] ?? ''
      const given = got[i] ?? ''
      return expectedAnswer !== '' && expectedAnswer === given
    })
    setResult(per)
    setChecked(true)
    const okAll =
      placeholderCount === 0 ||
      (expected.length === placeholderCount &&
        per.every(Boolean) &&
        got.every((ans) => ans !== ''))
    if (okAll) onPass({ score: 100 })
  }

  const handleRetry = () => {
    // Reset all dropped answers
    setDroppedAnswers(Array(placeholderCount).fill(null))
    setChecked(false)
    setResult([])

    // Restore all words to available list
    if (data.blanks?.length) {
      const correctAnswers = [...data.blanks]
      const distractors = [
        'the',
        'and',
        'is',
        'are',
        'was',
        'were',
        'have',
        'has',
      ]
      const shuffledWords = [
        ...correctAnswers,
        ...distractors.slice(0, Math.max(0, 3)),
      ]
      for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffledWords[i], shuffledWords[j]] = [
          shuffledWords[j],
          shuffledWords[i],
        ]
      }
      setAvailableWords(shuffledWords)
    }
  }

  const handleDrop = (e: DragEvent, blankIndex: number) => {
    e.preventDefault()
    const word = e.dataTransfer.getData('text/plain')

    // Update dropped answers
    const newDroppedAnswers = [...droppedAnswers]
    const oldWord = newDroppedAnswers[blankIndex]
    newDroppedAnswers[blankIndex] = word
    setDroppedAnswers(newDroppedAnswers)

    // Update available words
    setAvailableWords((prev) => {
      const updated = prev.filter((w) => w !== word)
      if (oldWord) updated.push(oldWord) // Return the old word to available list
      return updated
    })
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  const handleWordDragStart = (e: DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word)
  }

  const removeWordFromBlank = (blankIndex: number) => {
    const word = droppedAnswers[blankIndex]
    if (word) {
      const newDroppedAnswers = [...droppedAnswers]
      newDroppedAnswers[blankIndex] = null
      setDroppedAnswers(newDroppedAnswers)
      setAvailableWords((prev) => [...prev, word])
    }
  }

  // Hotkeys for FillBlank: Space = check, Ctrl+Z = retry
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === ' ' &&
        !checked &&
        droppedAnswers.every((a) => a !== null)
      ) {
        e.preventDefault()
        handleCheck()
      } else if (e.ctrlKey && e.key === 'z' && checked) {
        e.preventDefault()
        handleRetry()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, droppedAnswers])

  let blankIdx = 0
  return (
    <div className="space-y-6">
      {/* Available words to drag */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h4 className="font-semibold mb-3 text-sm text-gray-700">
          Kéo các từ vào chỗ trống:
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableWords.map((word, index) => (
            <div
              key={`${word}-${index}`}
              draggable
              onDragStart={(e) => handleWordDragStart(e, word)}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 cursor-move hover:bg-blue-100 transition-colors select-none"
            >
              {word}
            </div>
          ))}
        </div>
        {availableWords.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            Tất cả từ đã được sử dụng
          </p>
        )}
      </div>

      {/* Passage with drop zones */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 leading-8">
        <h3 className="font-semibold mb-4">
          Điền vào chỗ trống bằng cách kéo thả
        </h3>
        <div className="text-gray-800 text-lg leading-relaxed">
          {tokens.map((tk, i) => {
            if (placeholderTokenRe.test(tk)) {
              const ok = checked ? result[blankIdx] : undefined
              const idx = blankIdx
              const droppedWord = droppedAnswers[idx]
              blankIdx++
              return (
                <span
                  key={`blank-${i}`}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragOver={handleDragOver}
                  className={`inline-flex items-center mx-1 min-w-[80px] min-h-[36px] px-3 py-1 rounded-lg border-2 border-dashed transition-all ${
                    ok === undefined
                      ? droppedWord
                        ? 'border-blue-400 bg-blue-50 text-blue-800'
                        : 'border-yellow-400 bg-yellow-50 hover:border-yellow-500'
                      : ok
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                  }`}
                >
                  {droppedWord ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{droppedWord}</span>
                      {!checked && (
                        <button
                          onClick={() => removeWordFromBlank(idx)}
                          className="text-gray-500 hover:text-red-500 text-xs"
                          title="Xóa từ này"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 select-none">
                      #{idx + 1}
                    </span>
                  )}
                </span>
              )
            }
            return (
              <span key={`t-${i}`} className="whitespace-pre-wrap">
                {tk}
              </span>
            )
          })}
        </div>
        {checked && data.blanks && (
          <div className="mt-4 text-xs text-gray-500">
            Số chỗ trống: {droppedAnswers.length} • Số đáp án:{' '}
            {data.blanks.length}
          </div>
        )}
      </div>

      {/* Check button and results */}
      <div className="flex items-center justify-between">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={droppedAnswers.some((answer) => answer === null)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition ${
              droppedAnswers.some((answer) => answer === null)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Kiểm tra
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {result.every(Boolean) ? (
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
        )}

        {checked && (
          <div className="text-sm">
            <span className="text-gray-600">Kết quả: </span>
            <span
              className={`font-semibold ${
                result.every(Boolean) ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {result.filter(Boolean).length}/{result.length} đúng
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
        <p>
          <strong>Hướng dẫn:</strong> Kéo các từ từ hộp trên vào các chỗ trống
          trong đoạn văn. Nhấn nút X để xóa từ khỏi chỗ trống.
        </p>
      </div>
    </div>
  )
}
