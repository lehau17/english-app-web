import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, BookOpen, Mic, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState, type JSX } from 'react'
import type {
  ActivityCompletePayload,
  VocabContent,
} from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'
import { VocabularyPronunciationPractice } from '../VocabularyPronunciationPractice'

export function VocabActivity({
  data,
  onPass,
  activityId,
}: {
  data: VocabContent
  onPass: (payload?: ActivityCompletePayload) => void
  activityId?: string
}): JSX.Element {
  const items = data.items ?? []
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Debug: Log activityId to check if it's being passed
  useEffect(() => {
    console.log('VocabActivity activityId:', activityId)
  }, [activityId])

  useEffect(() => {
    setRevealed(false)
  }, [idx]) // đổi từ thì ẩn nghĩa lại

  useEffect(() => {
    setCompleted(false)
  }, [idx])

  useEffect(() => {
    if (!items.length) {
      onPass({ score: 100 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const canPrev = idx > 0
  // const canNext = idx < items.length - 1
  const it = items[idx]
  const progress = items.length
    ? Math.round(((idx + 1) / items.length) * 100)
    : 0
  const isLastItem = idx === items.length - 1

  const handleNext = () => {
    if (isLastItem) {
      if (!completed) {
        setCompleted(true)
        onPass({ score: 100 })
      }
    } else {
      setIdx((i) => Math.min(items.length - 1, i + 1))
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        Không có từ vựng.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header + progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Từ <strong>{idx + 1}</strong>/<strong>{items.length}</strong>
        </div>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${idx}-${it.word}`}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="grid gap-4 md:grid-cols-2"
        >
          {/* Card trái: hình + nghe */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{it.word}</h3>
              {it.audioUrl && (
                <>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                    onClick={() => {
                      audioRef.current?.play()
                    }}
                  >
                    <Volume2 className="h-4 w-4" /> Nghe phát âm
                  </button>
                  <audio
                    ref={audioRef}
                    src={
                      typeof it.audioUrl === 'string'
                        ? it.audioUrl
                        : (it.audioUrl as any)?.url
                    }
                  />
                </>
              )}
            </div>

            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 grid place-items-center">
              {it.imageUrl ? (
                <img
                  src={it.imageUrl}
                  alt={it.word}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-sm text-gray-400">
                  Không có hình minh họa
                </div>
              )}
            </div>
          </div>

          {/* Card phải: nghĩa + ví dụ + phát âm */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
              >
                <BookOpen className="h-4 w-4" />{' '}
                {revealed ? 'Ẩn nghĩa' : 'Lật nghĩa'}
              </button>
              <button
                onClick={() => setShowPronunciation((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                title={activityId ? 'Luyện phát âm' : 'Activity ID không có'}
              >
                <Mic className="h-4 w-4" />{' '}
                {showPronunciation ? 'Ẩn phát âm' : 'Luyện phát âm'}
              </button>
              <div className="text-xs text-gray-500">
                Mẹo: nhấn{' '}
                <kbd className="rounded border bg-white px-1">Space</kbd> để lật
              </div>
            </div>

            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-lg bg-emerald-50 p-3 text-emerald-900"
                >
                  <div className="text-sm">
                    <span className="font-medium">Nghĩa: </span>
                    {it.definition}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pronunciation Practice Section */}
            <AnimatePresence>
              {showPronunciation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {activityId ? (
                    <VocabularyPronunciationPractice
                      word={it.word}
                      activityId={activityId}
                    />
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-yellow-600" />
                      <span>
                        Activity ID không có. Không thể đánh giá phát âm.
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {it.examples && it.examples.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-700 block mb-1">
                  Ví dụ:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  {it.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          Quay lại
        </button>
        <button
          onClick={handleNext}
          className={classNames(
            'rounded-lg px-6 py-2 text-sm font-medium text-white transition',
            isLastItem
              ? completed
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
              : 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          {isLastItem ? (completed ? 'Hoàn thành' : 'Kết thúc') : 'Tiếp theo'}
        </button>
      </div>

      {/* Hotkeys for Vocab: Space = flip, Left/Right = nav */}
      <div />
    </div>
  )
}
