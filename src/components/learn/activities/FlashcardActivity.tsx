import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import {
  BookOpen,
  CheckCircle2,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'
import type { FlashcardContent } from '../../../types/learn.type'

export function FlashcardActivity({
  data,
  onPass,
}: {
  data: FlashcardContent
  onPass: () => void
}): JSX.Element {
  const [idx, setIdx] = useState(0)
  const [flip, setFlip] = useState(false)
  const [known, setKnown] = useState(0)
  const [lastSwipe, setLastSwipe] = useState<'left' | 'right' | null>(null) // để animate exit theo hướng
  const card = data.cards[idx]

  // Motion values cho swipe
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 0, 220], [-10, 0, 10])
  const opacity = useTransform(x, [-220, 0, 220], [0.8, 1, 0.8])
  const rightHintOpacity = useTransform(x, [40, 140], [0, 1]) // “ĐÃ NHỚ”
  const leftHintOpacity = useTransform(x, [-140, -40], [1, 0]) // “CHƯA NHỚ”

  const total = data.cards.length
  const progress = Math.round((idx / total) * 100)

  function next(remembered: boolean) {
    setFlip(false)
    setKnown((k) => (remembered ? k + 1 : k))
    if (idx < total - 1) {
      setIdx((i) => i + 1)
    } else {
      onPass()
    }
    // reset swipe state
    x.set(0)
    setLastSwipe(null)
  }

  function onDragEnd(_: any, info: { offset: { x: number } }) {
    const dx = info.offset.x
    const threshold = 120
    if (dx > threshold) {
      setLastSwipe('right')
      next(true)
    } else if (dx < -threshold) {
      setLastSwipe('left')
      next(false)
    } else {
      // bounce back
      x.set(0)
    }
  }

  // Hotkeys: Space = lật, ArrowRight = Nhớ, ArrowLeft = Chưa nhớ
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!card) return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlip((f) => !f)
      } else if (e.key === 'ArrowRight') {
        setLastSwipe('right')
        next(true)
      } else if (e.key === 'ArrowLeft') {
        setLastSwipe('left')
        next(false)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [card, idx]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!card)
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        Không có thẻ.
      </div>
    )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Thẻ <strong>{idx + 1}</strong>/<strong>{total}</strong> · Đã nhớ:{' '}
          <strong>{known}</strong>
        </div>
        <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Deck/Current card (drag + flip) */}
        <div className="relative">
          {/* card “preview” tiếp theo phía sau cho sinh động */}
          {idx < total - 1 && (
            <div className="absolute inset-0 translate-y-2 scale-95 rounded-2xl border border-gray-200 bg-gray-50 opacity-70" />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${idx}-${card.front}`}
              className="relative"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x:
                  lastSwipe === 'right' ? 260 : lastSwipe === 'left' ? -260 : 0,
                rotate:
                  lastSwipe === 'right' ? 12 : lastSwipe === 'left' ? -12 : 0,
                transition: { duration: 0.22 },
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              {/* Khu vực kéo */}
              <motion.div
                drag="x"
                style={{ x, rotate, opacity }}
                dragElastic={0.2}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={onDragEnd}
                className="select-none"
              >
                {/* Card 3D flip */}
                <div
                  className="aspect-[16/10] w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden grid place-items-center"
                  style={{ perspective: 1200 }}
                >
                  <motion.div
                    animate={{ rotateY: flip ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ transformStyle: 'preserve-3d' as any }}
                    className="relative h-full w-full"
                  >
                    {/* FRONT */}
                    <div
                      className="absolute inset-0 grid place-items-center p-6"
                      style={{ backfaceVisibility: 'hidden' as any }}
                    >
                      <div className="text-3xl font-bold tracking-wide">
                        {card.front}
                      </div>
                    </div>

                    {/* BACK */}
                    <div
                      className="absolute inset-0 grid place-items-center p-6"
                      style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden' as any,
                      }}
                    >
                      <div className="text-2xl font-semibold text-emerald-800">
                        {card.back}
                      </div>
                    </div>
                  </motion.div>

                  {/* Swipe hints */}
                  <motion.div
                    className="pointer-events-none absolute left-3 top-3 rounded-md border border-emerald-600/40 bg-emerald-50/80 px-2 py-1 text-xs font-semibold text-emerald-700"
                    style={{ opacity: rightHintOpacity }}
                  >
                    ĐÃ NHỚ
                  </motion.div>
                  <motion.div
                    className="pointer-events-none absolute right-3 top-3 rounded-md border border-rose-600/40 bg-rose-50/80 px-2 py-1 text-xs font-semibold text-rose-700"
                    style={{ opacity: leftHintOpacity }}
                  >
                    CHƯA NHỚ
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Side panel: media + actions */}
        <div className="space-y-3">
          {/* Ảnh minh họa (nếu có) */}
          {card.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
            >
              <img
                src={card.imageUrl}
                alt={card.front}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )}

          {/* Audio (nếu có) */}
          {card.audioUrl && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const a = new Audio(card.audioUrl!)
                a.play().catch(() => {})
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              <Volume2 className="h-4 w-4" /> Nghe phát âm
            </motion.button>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setFlip((f) => !f)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              title="Space để lật"
            >
              <BookOpen className="h-4 w-4" /> Lật thẻ
            </motion.button>

            <div className="flex-1" />

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLastSwipe('right')
                next(true)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              title="→ hoặc kéo sang phải"
            >
              <CheckCircle2 className="h-4 w-4" /> Nhớ
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLastSwipe('left')
                next(false)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              title="← hoặc kéo sang trái"
            >
              <XCircle className="h-4 w-4" /> Chưa nhớ
            </motion.button>
          </div>

          {/* Gợi ý nhỏ */}
          <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>
                Tip: Nhấn{' '}
                <kbd className="rounded border bg-white px-1">Space</kbd> để
                lật, dùng phím{' '}
                <kbd className="rounded border bg-white px-1">←</kbd>/
                <kbd className="rounded border bg-white px-1">→</kbd> để chọn.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
