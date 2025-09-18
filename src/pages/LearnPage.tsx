import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Headphones,
  HelpCircle,
  Home,
  Loader2,
  MessageSquare,
  Mic,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Volume2,
  X,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useCanStartActivity,
  useCompleteActivity,
  useLessonAndActivities,
  useNextLesson,
  useStartActivity,
} from '../hooks/learn.hooks'
import type {
  Activity,
  ConversationContent,
  ConversationMessage,
  FlashcardContent,
  GrammarContent,
  LessonMeta,
  ListeningContent,
  MiniGameContent,
  ProgressState,
  PronunciationContent,
  QuizContent,
  ReadingContent,
  SpeakingContent,
  VocabContent,
  WritingContent,
} from '../types/learn.type'

/**
 * LearnPlayer – Page shown when user clicks "Tiếp tục học"
 * Route gợi ý: /learn/[classroomId]/[lessonId]/[activityId]
 *
 * Bản mở rộng: hỗ trợ đầy đủ 11 ActivityType
 *  - vocab
 *  - pronunciation
 *  - listening
 *  - speaking
 *  - mini_game
 *  - reading
 *  - writing
 *  - grammar
 *  - quiz
 *  - flashcard
 *  - conversation
 */

/** ========================
 * Utility
 * ======================== */
function classNames(...xs: Array<string | false | undefined>): string {
  return xs.filter(Boolean).join(' ')
}

/** ========================
 * Stepper
 * ======================== */
function Stepper({
  items,
  activeId,
  onJump,
}: {
  items: Activity[]
  activeId?: string
  onJump: (id: string) => void
}): JSX.Element {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="text-sm text-gray-500 text-center">
          Không có hoạt động nào
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {items
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((a) => {
            const isActive = a.id === activeId
            const done = a.state === 'done' || a.state === 'mastered'
            const canAccess =
              done || a.state === 'in_progress' || a.state === 'review_needed'
            return (
              <button
                key={a.id}
                onClick={() => canAccess && onJump(a.id)}
                title={
                  !canAccess
                    ? 'Hoàn thành các hoạt động trước đó để truy cập'
                    : a.title
                }
                className={classNames(
                  'group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : canAccess
                      ? 'border-gray-200 bg-white hover:bg-gray-50'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={!canAccess}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                  {a.orderNo}
                </span>
                <span className="whitespace-nowrap">{a.title}</span>
                {done && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              </button>
            )
          })}
      </div>
    </div>
  )
}

/** ========================
 * Header
 * ======================== */
function TopBar({
  lesson,
  activity,
  onBack,
  onExit,
}: {
  lesson?: LessonMeta
  activity?: Activity
  onBack: () => void
  onExit: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg p-2 hover:bg-gray-100 transition"
          aria-label="Quay lại lớp học"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Home className="h-4 w-4" /> <span>Lớp học</span> <span>›</span>{' '}
            <span>{lesson?.title ?? 'Lesson'}</span> <span>›</span>
            <span className="font-medium text-gray-900">
              {activity?.title ?? 'Activity'}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            Hoàn thành để mở khóa hoạt động tiếp theo
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Âm lượng"
        >
          <Volume2 className="h-5 w-5" />
        </button>
        <button
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Trợ giúp"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Cài đặt"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={onExit}
          className="ml-1 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Thoát
        </button>
      </div>
    </div>
  )
}

/** ========================
 * Sidebar
 * ======================== */
function RightSidebar({ activity }: { activity?: Activity }): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-2 font-semibold">Gợi ý</h4>
        {activity?.hints?.length ? (
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {activity.hints!.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            Không có gợi ý cho hoạt động này.
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-2 font-semibold">Tài liệu</h4>
        {activity?.materials?.length ? (
          <ul className="space-y-2 text-sm text-blue-700">
            {activity.materials!.map((m) => (
              <li key={m.label}>
                <a
                  className="hover:underline"
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Chưa có tài liệu đính kèm.</p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-2 font-semibold">Ghi chú</h4>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={5}
          placeholder="Ghi chú nhanh trong lúc học..."
        />
      </div>
    </div>
  )
}
function FillBlankActivity({
  data,
  onPass,
}: {
  data: import('../types/learn.type').FillBlankContent
  onPass: () => void
}): JSX.Element {
  const placeholderReGlobal = /(\[_{2,}\])/g
  const placeholderTokenRe = /^\[_{2,}\]$/
  const tokens = useMemo(
    () => (data.passage || '').split(placeholderReGlobal),
    [data.passage]
  )
  const placeholderCount = useMemo(
    () => tokens.filter((t) => placeholderTokenRe.test(t)).length,
    [tokens]
  )
  const [answers, setAnswers] = useState<string[]>(() =>
    Array.from({ length: Math.max(1, placeholderCount) }, () => '')
  )
  useEffect(() => {
    if (answers.length !== placeholderCount) {
      setAnswers((prev) => {
        const next = [...prev]
        next.length = placeholderCount
        for (let i = 0; i < placeholderCount; i++)
          if (next[i] === undefined) next[i] = ''
        return next
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholderCount])

  const [checked, setChecked] = useState(false)
  const [result, setResult] = useState<boolean[]>([])

  const normalize = (s: string) => s.trim().toLowerCase()

  const handleCheck = () => {
    const expected = (data.blanks ?? []).map(normalize)
    const got = answers.map(normalize)
    const n = Math.max(expected.length, answers.length)
    const per: boolean[] = []
    for (let i = 0; i < n; i++) {
      per[i] =
        (expected[i] ?? '') === (got[i] ?? '') && (expected[i] ?? '') !== ''
    }
    setResult(per)
    setChecked(true)
    const okAll =
      expected.length > 0 &&
      expected.length === answers.length &&
      expected.every((e, i) => e === got[i])
    if (okAll) onPass()
  }

  let blankIdx = 0
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 leading-8">
        <h3 className="font-semibold mb-2">Điền vào chỗ trống</h3>
        <div className="text-gray-800 flex flex-wrap">
          {tokens.map((tk, i) => {
            if (placeholderTokenRe.test(tk)) {
              const ok = checked ? result[blankIdx] : undefined
              const idx = blankIdx
              blankIdx++
              return (
                <input
                  key={`blank-${i}`}
                  value={answers[idx] ?? ''}
                  onChange={(e) => {
                    const arr = [...answers]
                    arr[idx] = e.target.value
                    setAnswers(arr)
                  }}
                  className={
                    'mx-1 rounded-md border-b-2 bg-yellow-50 px-2 py-0.5 text-sm focus:outline-none ' +
                    (ok === undefined
                      ? 'border-yellow-400'
                      : ok
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50')
                  }
                  placeholder={`#${idx + 1}`}
                  style={{ minWidth: 60 }}
                />
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
          <div className="mt-2 text-xs text-gray-500">
            Số chỗ trống: {answers.length} • Số đáp án: {data.blanks.length}
          </div>
        )}
      </div>
      <div>
        <button
          onClick={handleCheck}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <ShieldCheck className="h-4 w-4" /> Kiểm tra
        </button>
      </div>
    </div>
  )
}
function DictationActivity({
  data,
  onPass,
}: {
  data: import('../types/learn.type').DictationContent
  onPass: () => void
}): JSX.Element {
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const normalizeWords = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)

  const handleCheck = () => {
    const target = normalizeWords(data.transcript || '')
    const got = normalizeWords(text)
    const setT = new Set(target)
    let matched = 0
    for (const w of got) {
      if (setT.has(w)) matched++
    }
    const ratio = target.length ? matched / target.length : 0
    setChecked(true)
    const passByLen = (data.minWords ?? 0) <= got.length
    if ((ratio >= 0.8 || got.join(' ') === target.join(' ')) && passByLen) {
      onPass()
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Nghe và chép lại</h3>
          <p className="text-sm text-gray-600">
            Yêu cầu tối thiểu: {data.minWords ?? 0} từ
          </p>
        </div>
        {data.audioUrl && (
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => audioRef.current?.play()}
            >
              <Volume2 className="h-4 w-4" /> Phát audio
            </button>
            <audio ref={audioRef} src={data.audioUrl} />
          </div>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={8}
          placeholder="Nhập nội dung bạn nghe được..."
        />
        <div className="pt-3">
          <button
            onClick={handleCheck}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <ShieldCheck className="h-4 w-4" /> Kiểm tra
          </button>
          {checked && (
            <span className="ml-3 text-xs text-gray-500">
              Đáp án có thể khác đôi chút, hệ thống chấp nhận ~80% từ đúng
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
function MatchingActivity({
  data,
  onPass,
}: {
  data: import('../types/learn.type').MatchingContent
  onPass: () => void
}): JSX.Element {
  const pairs = data.pairs ?? []
  const rights = useMemo(() => pairs.map((p) => p.right), [pairs])
  const shuffled = useMemo(() => {
    const arr = [...rights]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [rights])
  const [selected, setSelected] = useState<string[]>(
    Array(pairs.length).fill('')
  )
  const [checked, setChecked] = useState(false)

  const correctAll = pairs.every((p, i) => selected[i] === p.right)
  const handleCheck = () => {
    setChecked(true)
    if (correctAll) onPass()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold mb-3">Ghép cặp tương ứng</h3>
        <div className="space-y-3">
          {pairs.map((p, i) => {
            const ok = checked ? selected[i] === p.right : undefined
            return (
              <div key={i} className="grid gap-2 md:grid-cols-3 items-center">
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm">
                  {p.left}
                </div>
                <div className="md:col-span-2">
                  <select
                    className={
                      'w-full rounded-lg border px-3 py-2 text-sm ' +
                      (ok === undefined
                        ? 'border-gray-300'
                        : ok
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50')
                    }
                    value={selected[i]}
                    onChange={(e) => {
                      const arr = [...selected]
                      arr[i] = e.target.value
                      setSelected(arr)
                    }}
                  >
                    <option value="">-- Chọn --</option>
                    {shuffled.map((r, idx) => (
                      <option key={idx} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
        </div>
        <div className="pt-3">
          <button
            onClick={handleCheck}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <ShieldCheck className="h-4 w-4" /> Kiểm tra
          </button>
        </div>
      </div>
    </div>
  )
}

/** ========================
 * Activity Renderers
 * ======================== */
function QuizActivity({
  data,
  onResult,
}: {
  data: QuizContent
  onResult: (correct: boolean) => void
}): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
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
          {data.options.map((opt, idx) => {
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
            <span className="font-medium">Giải thích:</span> {data.explanation}
          </div>
        )}
      </div>
    </div>
  )
}
function VocabActivity({
  data,
  onPass,
}: {
  data: VocabContent
  onPass: () => void
}): JSX.Element {
  const items = data.items ?? []
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setRevealed(false)
  }, [idx]) // đổi từ thì ẩn nghĩa lại

  const canPrev = idx > 0
  const canNext = idx < items.length - 1
  const it = items[idx]
  const progress = items.length
    ? Math.round(((idx + 1) / items.length) * 100)
    : 0
  const isLastItem = idx === items.length - 1

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
                      console.log('Play audio', it.audioUrl)
                      audioRef.current?.play()
                    }}
                  >
                    <Volume2 className="h-4 w-4" /> Nghe phát âm
                  </button>
                  <audio ref={audioRef} src={it.audioUrl} />
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

          {/* Card phải: nghĩa + ví dụ */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRevealed((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
              >
                <BookOpen className="h-4 w-4" />{' '}
                {revealed ? 'Ẩn nghĩa' : 'Lật nghĩa'}
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

            {it.examples?.length ? (
              <div>
                <h4 className="font-medium mb-2">Ví dụ</h4>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {it.examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Điều hướng từ */}
            <div className="pt-2 flex items-center justify-between">
              <button
                disabled={!canPrev}
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                  canPrev
                    ? 'border-gray-300 hover:bg-gray-50'
                    : 'border-gray-200 opacity-50'
                )}
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              <div className="text-xs text-gray-500">
                Dùng phím ← / → để chuyển
              </div>
              {isLastItem ? (
                <button
                  onClick={onPass}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Hoàn thành
                </button>
              ) : (
                <button
                  disabled={!canNext}
                  onClick={() =>
                    setIdx((i) => Math.min(items.length - 1, i + 1))
                  }
                  className={classNames(
                    'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
                    !canNext && 'opacity-50'
                  )}
                >
                  Tiếp <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hotkeys */}
      <Hotkeys
        onFlip={() => setRevealed((r) => !r)}
        onPrev={() => canPrev && setIdx((i) => Math.max(0, i - 1))}
        onNext={() =>
          canNext && setIdx((i) => Math.min(items.length - 1, i + 1))
        }
      />
    </div>
  )
}

// tiện ích nhỏ để bắt hotkeys cho Vocab
function Hotkeys({
  onFlip,
  onPrev,
  onNext,
}: {
  onFlip: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        onFlip()
      } else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onFlip, onPrev, onNext])
  return null
}

function ListeningActivity({
  data,
  onPass,
}: {
  data: ListeningContent
  onPass: () => void
}): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === data.correctIndex
  useEffect(() => {
    if (checked && correct) onPass()
  }, [checked, correct, onPass])
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Headphones className="h-5 w-5" /> {data.prompt}
        </h3>
        <audio controls className="w-full">
          <source src={data.audioUrl} />
        </audio>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid gap-2">
          {data.options.map((opt, idx) => {
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
                  !isSel && !checked && 'border-gray-200 hover:bg-gray-50'
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
        <div className="mt-3">
          <button
            disabled={selected === null || checked}
            onClick={() => setChecked(true)}
            className={classNames(
              'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
              (selected === null || checked) && 'opacity-60'
            )}
          >
            <ShieldCheck className="h-4 w-4" /> Kiểm tra
          </button>
          {checked && (
            <span
              className={classNames(
                'ml-3 text-sm',
                correct ? 'text-green-700' : 'text-red-700'
              )}
            >
              {correct ? 'Chính xác!' : 'Chưa đúng, thử lại nhé.'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function PronunciationActivity({
  data,
  onPass,
}: {
  data: PronunciationContent
  onPass: () => void
}): JSX.Element {
  const [recording, setRecording] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const chunks = useRef<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      chunks.current = []
      mr.ondataavailable = (e) => chunks.current.push(e.data)
      mr.onstop = () => {
        const mock = Math.floor(60 + Math.random() * 35)
        setScore(mock)
        if (mock >= 70) onPass()
      }
      mr.start()
      setRecording(true)
    } catch {
      alert('Không thể truy cập microphone')
    }
  }
  const stopRec = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="text-lg font-semibold">Nói theo: "{data.phrase}"</h3>
      {data.tips?.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-amber-900 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {data.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            onClick={startRec}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
          >
            <Mic className="h-4 w-4" /> Bắt đầu ghi
          </button>
        ) : (
          <button
            onClick={stopRec}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            <SquareIcon /> Dừng ghi
          </button>
        )}
        {data.sampleUrl && (
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
            <Play className="h-4 w-4" /> Nghe mẫu
          </button>
        )}
      </div>
      {score !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          <div className="text-sm text-gray-700 mb-1">Điểm phát âm</div>
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className={classNames(
                'h-full',
                score >= 85
                  ? 'bg-green-500'
                  : score >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              )}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="mt-1 text-sm font-medium">{score}/100</div>
        </motion.div>
      )}
    </div>
  )
}

function SpeakingActivity({
  data,
  onPass,
}: {
  data: SpeakingContent
  onPass: () => void
}): JSX.Element {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      mr.start()
      setRecording(true)
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      )
    } catch {
      alert('Không thể truy cập microphone')
    }
  }
  const stop = () => {
    mediaRecorder.current?.stop()
    setRecording(false)
    if (timerRef.current) window.clearInterval(timerRef.current)
  }
  const canSubmit = seconds >= (data.minSeconds ?? 15)
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <h3 className="text-lg font-semibold">Nhiệm vụ nói</h3>
      <p className="text-sm text-gray-700">{data.prompt}</p>
      {data.tips?.length ? (
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          {data.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex items-center gap-3">
        {!recording ? (
          <button
            onClick={start}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
          >
            <Mic className="h-4 w-4" /> Bắt đầu
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white"
          >
            <SquareIcon /> Dừng
          </button>
        )}
        <span className="text-sm text-gray-600">
          Thời gian: {seconds}s (yêu cầu ≥ {data.minSeconds ?? 15}s)
        </span>
        <button
          disabled={!canSubmit}
          onClick={onPass}
          className={classNames(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white',
            canSubmit
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-600 opacity-50'
          )}
        >
          Nộp
        </button>
      </div>
    </div>
  )
}

function MiniGameActivity({
  data,
  onPass,
}: {
  data: MiniGameContent
  onPass: () => void
}): JSX.Element {
  const [round, setRound] = useState(1)
  const [hits, setHits] = useState(0)
  const words = useMemo(() => shuffle([...data.pool]), [data.pool, round])
  function clickWord(w: string) {
    if (w === data.target) {
      const nhits = hits + 1
      setHits(nhits)
      if (nhits >= data.rounds) onPass()
      else setRound((r) => r + 1)
    }
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5" /> Tìm từ:{' '}
          <span className="text-blue-700">{data.target}</span>
        </h3>
        <div className="text-sm text-gray-600">
          Vòng {round}/{data.rounds} · Trúng: {hits}
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {words.map((w, i) => (
          <button
            key={i}
            onClick={() => clickWord(w)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm hover:bg-blue-50 hover:border-blue-300"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  )
}

function ReadingActivity({
  data,
  onPass,
}: {
  data: ReadingContent
  onPass: () => void
}): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === data.correctIndex
  useEffect(() => {
    if (checked && correct) onPass()
  }, [checked, correct, onPass])
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold mb-2">Đoạn văn</h3>
        <p className="text-sm leading-6 text-gray-800">{data.passage}</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h4 className="font-medium mb-2">{data.question}</h4>
        <div className="grid gap-2">
          {data.options.map((o, i) => (
            <button
              key={i}
              onClick={() => !checked && setSelected(i)}
              className={classNames(
                'rounded-lg border px-3 py-2 text-left',
                selected === i && !checked
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              {o}
            </button>
          ))}
        </div>
        <button
          disabled={selected === null || checked}
          onClick={() => setChecked(true)}
          className={classNames(
            'mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
            (selected === null || checked) && 'opacity-60'
          )}
        >
          <ShieldCheck className="h-4 w-4" /> Kiểm tra
        </button>
        {checked && (
          <span
            className={classNames(
              'ml-3 text-sm',
              correct ? 'text-green-700' : 'text-red-700'
            )}
          >
            {correct ? 'Chính xác!' : 'Chưa đúng.'}
          </span>
        )}
      </div>
    </div>
  )
}

function WritingActivity({
  data,
  onPass,
}: {
  data: WritingContent
  onPass: () => void
}): JSX.Element {
  const [text, setText] = useState('')
  const words = text.trim() ? text.trim().split(/ +/).length : 0
  const ok = words >= data.minWords
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <h3 className="text-lg font-semibold">Viết</h3>
      <p className="text-sm text-gray-700">{data.prompt}</p>
      {data.rubric?.length ? (
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          {data.rubric.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Viết bài của bạn ở đây..."
      />
      <div className="flex items-center justify-between text-sm">
        <span>
          Từ: <strong>{words}</strong> / yêu cầu ≥ {data.minWords}
        </span>
        <button
          disabled={!ok}
          onClick={onPass}
          className={classNames(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white',
            ok
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-600 opacity-50'
          )}
        >
          Nộp bài
        </button>
      </div>
    </div>
  )
}

function GrammarActivity({
  data,
  onPass,
}: {
  data: GrammarContent
  onPass: () => void
}): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = selected === data.correctIndex
  useEffect(() => {
    if (checked && correct) onPass()
  }, [checked, correct, onPass])
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-indigo-900 text-sm">
        Quy tắc: {data.rule}
      </div>
      <h4 className="font-medium mb-2">{data.question}</h4>
      <div className="grid gap-2">
        {data.options.map((o, i) => (
          <button
            key={i}
            onClick={() => !checked && setSelected(i)}
            className={classNames(
              'rounded-lg border px-3 py-2 text-left',
              selected === i && !checked
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <button
        disabled={selected === null || checked}
        onClick={() => setChecked(true)}
        className={classNames(
          'mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
          (selected === null || checked) && 'opacity-60'
        )}
      >
        <ShieldCheck className="h-4 w-4" /> Kiểm tra
      </button>
      {checked && (
        <span
          className={classNames(
            'ml-3 text-sm',
            correct ? 'text-green-700' : 'text-red-700'
          )}
        >
          {correct ? 'Chính xác!' : 'Chưa đúng.'}
        </span>
      )}
    </div>
  )
}
function FlashcardActivity({
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

function ConversationActivity({
  data,
  onPass,
}: {
  data: ConversationContent
  onPass: () => void
}): JSX.Element {
  const [messages, setMessages] = useState<ConversationMessage[]>(
    data.initialDialog
  )
  const [text, setText] = useState('')
  const [turns, setTurns] = useState(0)
  function send() {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'user', text }])
    setText('')
    setTurns((t) => t + 1)
    if (turns + 1 >= 3) onPass()
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
      <div className="rounded-lg bg-blue-50 p-3 text-blue-900 text-sm">
        Bối cảnh: {data.scenario}
      </div>
      <div className="max-h-72 overflow-auto space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={classNames(
              'flex',
              m.role === 'assistant' ? 'justify-start' : 'justify-end'
            )}
          >
            <div
              className={classNames(
                'rounded-2xl px-3 py-2 text-sm',
                m.role === 'assistant'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-green-600 text-white'
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      {data.suggestions?.length ? (
        <div className="flex flex-wrap gap-2">
          {data.suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setText((t) => (t ? t + ' ' : '') + s)}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Nhập câu trả lời của bạn..."
        />
        <button
          onClick={send}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
        >
          Gửi
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Gửi ít nhất 3 lượt để hoàn thành.
      </div>
    </div>
  )
}

function SquareIcon(): JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

/** ========================
 * Celebration Component
 * ======================== */
function CelebrationModal({
  onGoToNextLesson,
  nextLesson,
  onClose,
}: {
  onGoToNextLesson: () => void
  nextLesson?: any
  onClose: () => void
}): JSX.Element {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti after modal appears
    const timer = setTimeout(() => setShowConfetti(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose} // Close when clicking backdrop
    >
      <motion.div
        initial={{ scale: 0.5, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 0.5, y: 50, rotate: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative mx-4 max-w-lg rounded-3xl bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8 text-center shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-lg"
        >
          <X className="h-5 w-5 text-gray-600" />
        </motion.button>

        {/* Enhanced Fireworks Animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Main fireworks */}
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={`firework-${i}`}
              initial={{
                x: Math.random() * 500 - 250,
                y: 400,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                y: Math.random() * -400 - 100,
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4,
              }}
              className="absolute h-3 w-3 rounded-full shadow-lg"
              style={{
                backgroundColor: [
                  '#FFD700',
                  '#FF6B6B',
                  '#4ECDC4',
                  '#45B7D1',
                  '#96CEB4',
                  '#F7DC6F',
                  '#BB8FCE',
                  '#85C1E9',
                ][Math.floor(Math.random() * 8)],
                boxShadow: `0 0 10px ${['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F7DC6F', '#BB8FCE', '#85C1E9'][Math.floor(Math.random() * 8)]}`,
              }}
            />
          ))}

          {/* Sparkle effects */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              initial={{
                x: Math.random() * 400 - 200,
                y: Math.random() * 300 + 100,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3,
              }}
              className="absolute text-2xl"
              style={{
                color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Floating stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              initial={{
                x: Math.random() * 350 - 175,
                y: 350,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                y: Math.random() * -350 - 50,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5,
              }}
              className="absolute"
            >
              <Star className="h-6 w-6 text-yellow-400 drop-shadow-lg" />
            </motion.div>
          ))}
        </div>

        {/* Confetti Effect */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: -20,
                    rotate: 0,
                    opacity: 1,
                  }}
                  animate={{
                    y: 400,
                    rotate: Math.random() * 360,
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                  className="absolute w-2 h-6"
                  style={{
                    backgroundColor: [
                      '#FF6B6B',
                      '#4ECDC4',
                      '#45B7D1',
                      '#FFD700',
                      '#BB8FCE',
                      '#85C1E9',
                    ][Math.floor(Math.random() * 6)],
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10">
          {/* Main Icon with Pulse */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 relative"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="mx-auto text-6xl">🎉</div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-yellow-400"
              />
            </motion.div>
          </motion.div>

          {/* Title with Bounce */}
          <motion.h2
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="mb-3 text-3xl font-bold text-gray-900"
          >
            🎉 Chúc mừng! 🎉
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 text-lg text-gray-700 font-medium"
          >
            Bạn đã hoàn thành bài học xuất sắc!
          </motion.p>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8 flex items-center justify-center gap-4 flex-wrap"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-5 py-3 text-white shadow-lg"
            >
              <Star className="h-6 w-6" />
              <span className="font-bold">+100 XP</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-white shadow-lg"
            >
              <Trophy className="h-6 w-6" />
              <span className="font-bold">Hoàn thành</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-white shadow-lg"
            >
              <CheckCircle2 className="h-6 w-6" />
              <span className="font-bold">Xuất sắc</span>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            {nextLesson && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoToNextLesson}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white font-semibold text-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                Bài học tiếp theo
                <ChevronRight className="ml-2 inline h-6 w-6" />
              </motion.button>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = '/classroom')}
                className="flex-1 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
              >
                <Home className="inline h-5 w-5 mr-2" />
                Về trang chủ
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Tiếp tục học
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/** ========================
 * Footer navigation
 * ======================== */
function BottomNav({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  allCompleted,
  nextLesson,
  onGoToNextLesson,
  currentActivityCompleted,
}: {
  hasPrev: boolean
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  allCompleted?: boolean
  nextLesson?: any
  onGoToNextLesson?: () => void
  currentActivityCompleted?: boolean
}): JSX.Element {
  console.log('test', { hasPrev, hasNext, currentActivityCompleted })
  const canGoNext = hasNext && currentActivityCompleted
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
      <button
        disabled={!hasPrev}
        onClick={onPrev}
        className={classNames(
          'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
          hasPrev
            ? 'border-gray-300 hover:bg-gray-50'
            : 'border-gray-200 opacity-50'
        )}
      >
        <ChevronLeft className="h-4 w-4" /> Trước
      </button>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" /> Thời gian học chất lượng
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="h-4 w-4" /> Thu thập XP
        </span>
        <span className="inline-flex items-center gap-1">
          <Flag className="h-4 w-4" /> Lưu tiến độ
        </span>
      </div>
      {allCompleted && nextLesson ? (
        <button
          onClick={onGoToNextLesson}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          Bài học tiếp theo <ChevronRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          disabled={!canGoNext}
          onClick={onNext}
          className={classNames(
            'inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white',
            !canGoNext && 'opacity-50 cursor-not-allowed'
          )}
          title={
            !currentActivityCompleted
              ? 'Hoàn thành hoạt động hiện tại để tiếp tục'
              : ''
          }
        >
          Tiếp theo <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

/** ========================
 * Helpers
 * ======================== */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** ========================
 * Main Page component
 * ======================== */
export default function LearnPlayerPage(): JSX.Element {
  const { classroomId, lessonId } = useParams<{
    classroomId: string
    lessonId: string
  }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<LessonMeta | undefined>()
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeId, setActiveId] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [nextLesson, setNextLesson] = useState<any>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  // TanStack Query hooks
  const nextLessonQuery = useNextLesson()
  const startActivityMutation = useStartActivity()
  const completeActivityMutation = useCompleteActivity()
  const canStartActivityMutation = useCanStartActivity()
  const lessonAndActivitiesQuery = useLessonAndActivities(
    classroomId || '',
    lessonId || '',
    user?.id || ''
  )

  const activeIndex = useMemo(
    () => activities?.findIndex((a) => a.id === activeId) ?? -1,
    [activities, activeId]
  )
  const active = activeIndex >= 0 ? activities?.[activeIndex] : undefined

  // Check if all activities are completed
  const allActivitiesCompleted = useMemo(() => {
    return (
      activities &&
      activities.length > 0 &&
      activities.every((a) => a.state === 'done' || a.state === 'mastered')
    )
  }, [activities])

  // Show celebration when all activities are completed
  useEffect(() => {
    if (allActivitiesCompleted && activities.length > 0) {
      setShowCelebration(true)
    }
  }, [allActivitiesCompleted, activities.length])

  // Fetch next lesson only when user clicks the button
  const fetchNextLesson = async () => {
    if (!user?.id) return

    try {
      console.log('Fetching next lesson...')
      const result = await nextLessonQuery.refetch()
      console.log('Next lesson response:', result)
      if (result.data) {
        setNextLesson(result.data)
        return result.data
      }
    } catch (error) {
      console.error('Failed to fetch next lesson:', error)
    }
    return null
  }

  // Use TanStack Query for lesson and activities data
  const { data: lessonData, isLoading, error } = lessonAndActivitiesQuery

  console.log('Lesson and activities query state:', {
    isLoading,
    error,
    lessonData,
  })

  // Update local state when data is available
  useEffect(() => {
    if (lessonData) {
      console.log('Lesson data received:', lessonData)
      setLesson(lessonData.lesson)

      // Map activities to match FE expected format
      const mappedActivities = lessonData.activities.map((activity: any) => ({
        ...activity,
        state: activity.progress?.[0]?.state || 'not_started',
        content: {
          kind: activity.type,
          data: activity.content,
        },
      }))

      console.log('Mapped activities:', mappedActivities)
      setActivities(mappedActivities)
      setActiveId(lessonData.currentActivityId)
      setLoading(false)
    }
  }, [lessonData])

  // Handle error from query
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch lesson and activities:', error)
      setErrorMessage('Không thể tải bài học. Vui lòng thử lại.')
      setLoading(false)
    }
  }, [error])

  // Start activity when activeId changes (for initial load or programmatic changes)
  useEffect(() => {
    if (activeId && user?.id && activities && activities.length > 0) {
      const currentActivity = activities.find((a) => a.id === activeId)
      if (currentActivity && currentActivity.state === 'not_started') {
        setErrorMessage(null) // Clear error when starting new activity
        handleStartActivity(activeId)
      }
    }
  }, [activeId, activities, user?.id])

  const handlePass = async () => {
    if (!activeId || !user?.id) return

    try {
      // Mark activity as completed in local state
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activeId ? { ...a, state: 'done' as ProgressState } : a
        )
      )

      // Call API to complete activity using mutation
      await completeActivityMutation.mutateAsync({
        activityId: activeId,
        userId: user.id,
        score: 100, // You might want to calculate actual score based on performance
      })

      // Clear any error message on successful completion
      setErrorMessage(null)
      setErrorDetails(null)
    } catch (error) {
      console.error('Failed to complete activity:', error)
      // Revert local state on error
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activeId
            ? { ...a, state: 'in_progress' as ProgressState }
            : a
        )
      )
    }
  }

  const handleStartActivity = async (activityId: string) => {
    if (!user?.id) return

    try {
      // Kiểm tra xem có thể start activity không
      const canStartResponse = await canStartActivityMutation.mutateAsync({
        userId: user.id,
        activityId,
      })
      const canStart = canStartResponse.data

      if (!canStart.allowed) {
        // Hiển thị lý do không thể start
        let errorMessage = 'Không thể bắt đầu hoạt động này'

        if (canStart.reason === 'previous_activity_not_passed') {
          errorMessage = 'Bạn cần hoàn thành hoạt động trước đó trước'
        } else if (canStart.reason === 'unmet_prerequisites') {
          errorMessage = 'Bạn chưa đáp ứng đủ điều kiện tiên quyết'
        } else if (canStart.reason === 'activity_not_found') {
          errorMessage = 'Hoạt động không tồn tại'
        } else if (canStart.reason) {
          errorMessage = canStart.reason
        }

        setErrorMessage(errorMessage)
        setErrorDetails(canStart)

        // Quay về activity trước đó nếu có thể
        const currentIndex = activities.findIndex((a) => a.id === activityId)
        if (currentIndex > 0) {
          const prevActivity = activities[currentIndex - 1]
          setActiveId(prevActivity.id)
        }

        return
      }

      // Nếu được phép, tiến hành start activity
      await startActivityMutation.mutateAsync({
        activityId,
        userId: user.id,
      })

      // Update local state to mark as in progress
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activityId
            ? { ...a, state: 'in_progress' as ProgressState }
            : a
        )
      )

      // Clear any previous error
      setErrorMessage(null)
      setErrorDetails(null)
    } catch (error: any) {
      console.error('Failed to start activity:', error)

      // Handle API error response
      if (error.response?.status === 400) {
        const errorData = error.response.data
        const errorMessage =
          errorData?.message || 'Không thể bắt đầu hoạt động này'
        setErrorMessage(errorMessage)

        // Quay về activity trước đó nếu có thể
        const currentIndex = activities.findIndex((a) => a.id === activityId)
        if (currentIndex > 0) {
          const prevActivity = activities[currentIndex - 1]
          setActiveId(prevActivity.id)
        }

        return
      }

      // For other errors, show generic message
      setErrorMessage('Có lỗi xảy ra khi bắt đầu hoạt động. Vui lòng thử lại.')
    }
  }
  const jumpTo = (id: string) => {
    const targetActivity = activities.find((a) => a.id === id)
    if (!targetActivity) return

    // Check if the target activity can be accessed
    const canAccess =
      targetActivity.state === 'done' ||
      targetActivity.state === 'mastered' ||
      targetActivity.state === 'in_progress' ||
      targetActivity.state === 'review_needed'

    if (!canAccess) {
      setErrorMessage(
        'Bạn cần hoàn thành các hoạt động trước đó trước khi truy cập hoạt động này'
      )
      return
    }

    setActiveId(id)
    setErrorMessage(null) // Clear error when jumping to new activity
    setErrorDetails(null)
    handleStartActivity(id)
  }
  const gotoPrev = () => {
    if (activeIndex > 0 && activities) {
      const prevId = activities[activeIndex - 1].id
      setActiveId(prevId)
      setErrorMessage(null) // Clear error when navigating
      setErrorDetails(null)
      handleStartActivity(prevId)
    }
  }

  const gotoNext = () => {
    if (activeIndex < (activities?.length ?? 0) - 1 && activities) {
      const currentActivity = activities[activeIndex]
      // Check if current activity is completed before allowing navigation
      if (
        currentActivity.state !== 'done' &&
        currentActivity.state !== 'mastered'
      ) {
        setErrorMessage(
          'Bạn cần hoàn thành hoạt động hiện tại trước khi chuyển sang hoạt động tiếp theo'
        )
        return
      }

      const nextId = activities[activeIndex + 1].id
      setActiveId(nextId)
      setErrorMessage(null) // Clear error when navigating
      setErrorDetails(null)
      handleStartActivity(nextId)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải bài học...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
        <TopBar
          lesson={lesson}
          activity={active}
          onBack={() => navigate(-1)}
          onExit={() => (window.location.href = '/classroom')}
        />

        {/* Error Banner */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Không thể bắt đầu hoạt động
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  {errorDetails?.unmet && errorDetails.unmet.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600 font-medium">
                        Điều kiện chưa đáp ứng:
                      </p>
                      <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                        {errorDetails.unmet.map((item: any, index: number) => (
                          <li key={index}>
                            {item.type === 'activity_done'
                              ? `Hoàn thành hoạt động: ${item.activityId}`
                              : JSON.stringify(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setErrorMessage(null)
                    setErrorDetails(null)
                    if (activeId) {
                      handleStartActivity(activeId)
                    }
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => {
                    setErrorMessage(null)
                    setErrorDetails(null)
                  }}
                  className="rounded-lg p-1 hover:bg-red-100 transition-colors"
                  aria-label="Đóng thông báo lỗi"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        <Stepper items={activities} activeId={activeId} onJump={jumpTo} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">
                    Hoạt động #{active?.orderNo}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {active?.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    <Clock className="h-3.5 w-3.5" />{' '}
                    {active?.timeLimit
                      ? `${active.timeLimit} phút`
                      : 'Không giới hạn'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                    <MessageSquare className="h-3.5 w-3.5" /> Cố gắng trả lời rõ
                    ràng
                  </span>
                </div>
              </div>
            </div>

            {active && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {active.content.kind === 'quiz' && (
                    <QuizActivity
                      data={active.content.data}
                      onResult={(ok) => ok && handlePass()}
                    />
                  )}
                  {active.content.kind === 'vocab' && (
                    <VocabActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'listening' && (
                    <ListeningActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'pronunciation' && (
                    <PronunciationActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'speaking' && (
                    <SpeakingActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'mini_game' && (
                    <MiniGameActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'reading' && (
                    <ReadingActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'writing' && (
                    <WritingActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'grammar' && (
                    <GrammarActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'flashcard' && (
                    <FlashcardActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'conversation' && (
                    <ConversationActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'fill_blank' && (
                    <FillBlankActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'dictation' && (
                    <DictationActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'matching' && (
                    <MatchingActivity
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {!active.content.kind && (
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                      <p className="text-gray-500">
                        Activity type không được hỗ trợ: {active.type}
                      </p>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify(active.content, null, 2)}
                      </pre>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            <BottomNav
              hasPrev={activeIndex > 0}
              hasNext={
                activeIndex < (activities?.length ?? 0) - 1 ||
                (active?.content?.data as VocabContent)?.items?.length === 0
              }
              onPrev={gotoPrev}
              onNext={gotoNext}
              allCompleted={allActivitiesCompleted}
              nextLesson={nextLesson}
              onGoToNextLesson={async () => {
                if (!nextLesson) {
                  const lesson = await fetchNextLesson()
                  if (lesson) {
                    window.location.href = `/learn/${classroomId}/${lesson.id}`
                  }
                } else {
                  window.location.href = `/learn/${classroomId}/${nextLesson.id}`
                }
              }}
              currentActivityCompleted={
                active?.state === 'done' ||
                active?.state === 'mastered' ||
                (active?.content?.data as VocabContent)?.items?.length === 0
              }
            />
          </div>
          <div>
            <RightSidebar activity={active} />
          </div>
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <CelebrationModal
              onGoToNextLesson={async () => {
                setShowCelebration(false)
                if (!nextLesson) {
                  const lesson = await fetchNextLesson()
                  if (lesson) {
                    window.location.href = `/learn/${classroomId}/${lesson.id}`
                  } else {
                    window.location.href = '/classroom'
                  }
                } else {
                  window.location.href = `/learn/${classroomId}/${nextLesson.id}`
                }
              }}
              nextLesson={nextLesson}
              onClose={() => setShowCelebration(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
