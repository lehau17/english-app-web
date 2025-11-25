import { useQueryClient } from '@tanstack/react-query'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Headphones,
  HelpCircle,
  History,
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
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TextInteractionWrapper from '../components/common/TextInteractionWrapper'
import { ActivityAttemptHistory } from '../components/learn/ActivityAttemptHistory'
import { VocabularyPronunciationPractice } from '../components/learn/VocabularyPronunciationPractice'
import { useAuth } from '../context/AuthContext'
import {
  useCanStartActivity,
  useClassroomDetail,
  useCompleteActivity,
  useLessonAndActivities,
  useNextLesson,
  useStartActivity,
  useUnlockNextLesson,
} from '../hooks/learn.hooks'
import {
  evaluatePronunciation,
  evaluateSpeaking,
  evaluateWriting,
  type EvaluationResult,
} from '../services/evaluation.api'
import { updateProgressTimeSpent } from '../services/learn.api'
import type {
  Activity,
  ConversationContent,
  ConversationMessage,
  FlashcardContent,
  GrammarContent,
  GrammarExercise,
  LessonMeta,
  ListeningContent,
  MiniGameContent,
  ProgressState,
  PronunciationContent,
  QuizContent,
  QuizQuestion,
  ReadingContent,
  ReadingQuestion,
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

const PASSING_SCORE = 70
const MIN_AUDIO_VOLUME = 0.012 // RMS threshold to detect silence

type ActivityCompletePayload = {
  score?: number
  feedback?: string
  detail?: Record<string, unknown> | null
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      const base64 = result.includes(',')
        ? (result.split(',').pop() ?? '')
        : result
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function analyzeAudioRms(blob: Blob): Promise<number | null> {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return null

  const audioContext = new AudioCtx()
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    if (!audioBuffer.numberOfChannels || audioBuffer.length === 0) {
      return 0
    }

    const channelData = audioBuffer.getChannelData(0)
    const stride = Math.max(1, Math.floor(channelData.length / 48000))
    let total = 0
    let samples = 0
    for (let i = 0; i < channelData.length; i += stride) {
      total += Math.abs(channelData[i])
      samples++
    }
    return samples ? total / samples : 0
  } catch (err) {
    console.error('Không thể phân tích âm thanh:', err)
    return null
  } finally {
    audioContext.close().catch(() => {})
  }
}

/** ========================
 * Stepper
 * ======================== */
function Stepper({
  items,
  activeId,
  onJump,
  isPreviewMode = false,
}: {
  items: Activity[]
  activeId?: string
  onJump: (id: string) => void
  isPreviewMode?: boolean
}): JSX.Element {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3">
        <div className="text-xs sm:text-sm text-gray-500 text-center">
          Không có hoạt động nào
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        {items
          .sort((a, b) => a.orderNo - b.orderNo)
          .map((a) => {
            const isActive = a.id === activeId
            const done = a.state === 'done' || a.state === 'mastered'
            const isReviewNeeded = a.state === 'review_needed'
            // In preview mode, allow access to all activities
            const canAccess =
              isPreviewMode ||
              done ||
              a.state === 'in_progress' ||
              isReviewNeeded
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
                  'group flex items-center gap-1.5 sm:gap-2 rounded-lg border px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm transition flex-shrink-0',
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isReviewNeeded
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : canAccess
                        ? 'border-gray-200 bg-white hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={!canAccess}
              >
                <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] sm:text-xs font-medium flex-shrink-0">
                  {a.orderNo}
                </span>
                <span className="whitespace-nowrap truncate">{a.title}</span>
                {done && (
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                )}
                {isReviewNeeded && (
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
                )}
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
  onShowHistory,
}: {
  lesson?: LessonMeta
  activity?: Activity
  onBack: () => void
  onExit: () => void
  onShowHistory: () => void
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition flex-shrink-0"
          aria-label="Quay lại lớp học"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-hidden">
            <Home className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Lớp học</span>
            <span>›</span>
            <span className="hidden sm:inline truncate">
              {lesson?.title ?? 'Lesson'}
            </span>
            <span className="hidden sm:inline">›</span>
            <span className="font-medium text-gray-900 truncate">
              {activity?.title ?? 'Activity'}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] sm:text-xs text-gray-500 hidden sm:block">
            Hoàn thành để mở khóa hoạt động tiếp theo
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden sm:block"
          aria-label="Âm lượng"
        >
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden sm:block"
          aria-label="Trợ giúp"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={onShowHistory}
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 transition-colors"
          aria-label="Lịch sử học tập"
          title="Xem lịch sử học tập"
        >
          <History className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          className="rounded-lg p-1.5 sm:p-2 hover:bg-gray-100 hidden xs:block"
          aria-label="Cài đặt"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 whitespace-nowrap"
        >
          <span>Thoát</span>
          <X className="h-3.5 w-3.5" />
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
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Gợi ý</h4>
        {activity?.hints?.length ? (
          <ul className="list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-gray-700 space-y-1">
            {activity.hints!.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500">
            Không có gợi ý cho hoạt động này.
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Tài liệu</h4>
        {activity?.materials?.length ? (
          <ul className="space-y-2 text-xs sm:text-sm text-blue-700">
            {activity.materials!.map((m) => (
              <li key={m.label}>
                <a
                  className="hover:underline break-words"
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
          <p className="text-xs sm:text-sm text-gray-500">
            Chưa có tài liệu đính kèm.
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
        <h4 className="mb-2 text-sm sm:text-base font-semibold">Ghi chú</h4>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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

  const handleDrop = (e: React.DragEvent, blankIndex: number) => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleWordDragStart = (e: React.DragEvent, word: string) => {
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

  const handleRetry = () => {
    setText('')
    setChecked(false)
  }

  // Hotkeys for Dictation: Space = check (when text not empty), Ctrl+R = retry
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey && !checked && text.trim()) {
        e.preventDefault()
        handleCheck()
      } else if (e.ctrlKey && e.key === 'r' && checked) {
        e.preventDefault()
        handleRetry()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, text])

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
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            {!checked ? (
              <button
                onClick={handleCheck}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                <ShieldCheck className="h-4 w-4" /> Kiểm tra
              </button>
            ) : (
              <>
                {(() => {
                  const target = normalizeWords(data.transcript || '')
                  const got = normalizeWords(text)
                  const setT = new Set(target)
                  let matched = 0
                  for (const w of got) {
                    if (setT.has(w)) matched++
                  }
                  const ratio = target.length ? matched / target.length : 0
                  const passByLen = (data.minWords ?? 0) <= got.length
                  const passed =
                    (ratio >= 0.8 || got.join(' ') === target.join(' ')) &&
                    passByLen

                  return passed ? (
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
                  )
                })()}
              </>
            )}
          </div>

          {checked && (
            <span className="text-xs text-gray-500">
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
  const pairs = useMemo(() => data.pairs ?? [], [data.pairs])
  const rights = useMemo(() => pairs.map((p) => p.right), [pairs])
  const shuffledRights = useMemo(() => {
    const arr = [...rights]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [rights])

  // State for connections - simpler approach with click-to-connect
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [connections, setConnections] = useState<
    Array<{ leftIndex: number; rightIndex: number }>
  >([])
  const [checked, setChecked] = useState(false)

  const handleLeftClick = (leftIndex: number) => {
    if (checked) return

    // If this item is already connected, disconnect it
    const existingConnection = connections.find(
      (conn) => conn.leftIndex === leftIndex
    )
    if (existingConnection) {
      setConnections((prev) =>
        prev.filter((conn) => conn.leftIndex !== leftIndex)
      )
      return
    }

    setSelectedLeft(leftIndex)
  }

  const handleRightClick = (rightIndex: number) => {
    if (checked || selectedLeft === null) return

    // Remove any existing connection to this right item
    setConnections((prev) =>
      prev.filter((conn) => conn.rightIndex !== rightIndex)
    )

    // Add new connection
    setConnections((prev) => [...prev, { leftIndex: selectedLeft, rightIndex }])
    setSelectedLeft(null)
  }

  const handleCheck = () => {
    setChecked(true)
    const correctAll =
      connections.length === pairs.length &&
      connections.every((conn) => {
        const leftItem = pairs[conn.leftIndex]
        const rightItem = shuffledRights[conn.rightIndex]
        return leftItem.right === rightItem
      })
    if (correctAll) onPass()
  }

  const handleRetry = () => {
    setConnections([])
    setSelectedLeft(null)
    setChecked(false)
  }

  // Hotkeys for Matching: Space = check, Escape = clear selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && !checked && connections.length === pairs.length) {
        e.preventDefault()
        handleCheck()
      } else if (e.key === 'Escape' && selectedLeft !== null) {
        e.preventDefault()
        setSelectedLeft(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, connections, pairs, selectedLeft])

  const getConnectionResult = (leftIndex: number) => {
    if (!checked) return null
    const connection = connections.find((conn) => conn.leftIndex === leftIndex)
    if (!connection) return null
    const leftItem = pairs[leftIndex]
    const rightItem = shuffledRights[connection.rightIndex]
    return leftItem.right === rightItem
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold mb-4">Nhấn để ghép cặp tương ứng</h3>
        <p className="text-sm text-gray-600 mb-6">
          Nhấn vào một từ bên trái, sau đó nhấn vào nghĩa tương ứng bên phải để
          tạo kết nối.
        </p>

        <div className="relative">
          {/* Main content grid */}
          <div className="grid grid-cols-2 gap-24">
            {/* Left column */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">
                Từ/Cụm từ
              </h4>
              {pairs.map((pair, leftIndex) => {
                const isConnected = connections.some(
                  (conn) => conn.leftIndex === leftIndex
                )
                const isSelected = selectedLeft === leftIndex
                const connectionResult = getConnectionResult(leftIndex)

                return (
                  <div
                    key={leftIndex}
                    onClick={() => handleLeftClick(leftIndex)}
                    className={`relative rounded-lg border-2 px-4 py-4 text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                      checked
                        ? connectionResult === true
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : connectionResult === false
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 bg-gray-50 text-gray-500'
                        : isSelected
                          ? 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-200'
                          : isConnected
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <span>{pair.left}</span>

                    {/* Connection indicator */}
                    <div className="flex items-center gap-2">
                      {isSelected && !checked && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <span className="animate-pulse">Chọn nghĩa →</span>
                        </div>
                      )}

                      {isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            checked
                              ? connectionResult === true
                                ? 'bg-green-500'
                                : connectionResult === false
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                              : 'bg-blue-500'
                          }`}
                        />
                      )}

                      {!isConnected && !isSelected && (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    {/* Connection line endpoint */}
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                  </div>
                )
              })}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Nghĩa</h4>
              {shuffledRights.map((rightItem, rightIndex) => {
                const connection = connections.find(
                  (conn) => conn.rightIndex === rightIndex
                )
                const isConnected = !!connection
                const canConnect = selectedLeft !== null && !isConnected
                const connectionResult = connection
                  ? getConnectionResult(connection.leftIndex)
                  : null

                return (
                  <div
                    key={rightIndex}
                    onClick={() => handleRightClick(rightIndex)}
                    className={`relative rounded-lg border-2 px-4 py-4 text-sm cursor-pointer transition-all flex items-center justify-between ${
                      checked
                        ? connectionResult === true
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : connectionResult === false
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 bg-gray-50 text-gray-500'
                        : canConnect
                          ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500 hover:bg-yellow-100'
                          : isConnected
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    {/* Connection line startpoint */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />

                    <div className="flex items-center gap-2">
                      {/* Connection indicator */}
                      {isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            checked
                              ? connectionResult === true
                                ? 'bg-green-500'
                                : connectionResult === false
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                              : 'bg-blue-500'
                          }`}
                        />
                      )}

                      {!isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            canConnect
                              ? 'border-yellow-400 bg-yellow-100'
                              : 'border-gray-300'
                          }`}
                        />
                      )}
                    </div>

                    <span className="flex-1">{rightItem}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visual connection lines */}
          <div className="absolute inset-0 pointer-events-none">
            {connections.map((conn, index) => {
              const leftY = 73 + conn.leftIndex * 68 // Approximate positioning
              const rightY = 73 + conn.rightIndex * 68
              const connectionResult = getConnectionResult(conn.leftIndex)
              const lineColor = checked
                ? connectionResult === true
                  ? '#10b981'
                  : connectionResult === false
                    ? '#ef4444'
                    : '#6b7280'
                : '#3b82f6'

              return (
                <div key={index} className="absolute inset-0">
                  <svg className="w-full h-full">
                    {/* Dotted connection line */}
                    <line
                      x1="42%"
                      y1={leftY}
                      x2="58%"
                      y2={rightY}
                      stroke={lineColor}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeDasharray="4,6"
                      className="drop-shadow-sm"
                    />

                    {/* Multiple connection dots along the line */}
                    {Array.from({ length: 7 }).map((_, dotIndex) => {
                      const progress = dotIndex / 6 // 0 to 1
                      const dotX = 42 + (58 - 42) * progress // Interpolate X
                      const dotY = leftY + (rightY - leftY) * progress // Interpolate Y
                      const dotSize = dotIndex === 0 || dotIndex === 6 ? 8 : 4 // Larger dots at ends

                      return (
                        <circle
                          key={dotIndex}
                          cx={`${dotX}%`}
                          cy={dotY}
                          r={dotSize}
                          fill={lineColor}
                          className="drop-shadow-sm"
                        />
                      )
                    })}
                  </svg>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action buttons and results */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <div className="flex items-center gap-2">
            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={connections.length !== pairs.length}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition ${
                  connections.length !== pairs.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Kiểm tra
              </button>
            ) : (
              <>
                {connections.every((conn) => {
                  const leftItem = pairs[conn.leftIndex]
                  const rightItem = shuffledRights[conn.rightIndex]
                  return leftItem.right === rightItem
                }) ? (
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
              </>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Đã nối: {connections.length}/{pairs.length} cặp
          </div>
        </div>

        {/* Results */}
        {checked && (
          <div className="mt-4 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
            <div className="text-sm">
              <span className="font-semibold text-blue-800">Kết quả: </span>
              <span
                className={`font-bold ${
                  connections.every((conn) => {
                    const leftItem = pairs[conn.leftIndex]
                    const rightItem = shuffledRights[conn.rightIndex]
                    return leftItem.right === rightItem
                  })
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {
                  connections.filter((conn) => {
                    const leftItem = pairs[conn.leftIndex]
                    const rightItem = shuffledRights[conn.rightIndex]
                    return leftItem.right === rightItem
                  }).length
                }
                /{pairs.length} đúng
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
          <p>
            <strong>Hướng dẫn:</strong>
          </p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Nhấn vào một từ bên trái để chọn</li>
            <li>Sau đó nhấn vào nghĩa tương ứng bên phải để tạo kết nối</li>
            <li>Nhấn lại vào từ đã kết nối để hủy kết nối</li>
            <li>Đường nối sẽ hiển thị khi bạn ghép cặp thành công</li>
          </ul>
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
function VocabActivity({
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
  const canNext = idx < items.length - 1
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
              <button
                disabled={completed || (!canNext && !isLastItem)}
                onClick={handleNext}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition',
                  isLastItem
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700',
                  (completed || (!canNext && !isLastItem)) &&
                    'opacity-50 cursor-not-allowed'
                )}
              >
                {isLastItem ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Hoàn tất
                  </>
                ) : (
                  <>
                    Tiếp <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hotkeys */}
      <Hotkeys
        onFlip={() => setRevealed((r) => !r)}
        onPrev={() => canPrev && setIdx((i) => Math.max(0, i - 1))}
        onNext={handleNext}
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

function PronunciationActivity({
  activityId,
  data,
  onPass,
}: {
  activityId: string
  data: PronunciationContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)

  const cleanupRecorder = () => {
    const recorder = mediaRecorder.current
    if (!recorder) return
    mediaRecorder.current = null
    const stream: MediaStream | undefined = (recorder as any).stream
    stream?.getTracks().forEach((track) => track.stop())
    recorder.ondataavailable = null as any
    recorder.onstop = null as any
    recorder.onerror = null as any
  }

  const startRec = async () => {
    try {
      setError(null)
      setResult(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      chunks.current = []
      mr.ondataavailable = (event) => {
        if (event.data?.size) {
          chunks.current.push(event.data)
        }
      }
      mr.onerror = () => {
        setError('Không thể ghi âm, vui lòng thử lại.')
        setRecording(false)
      }
      mr.onstop = async () => {
        setRecording(false)
        const mimeType = mr.mimeType || 'audio/webm'
        const blob = new Blob(chunks.current, { type: mimeType })
        chunks.current = []
        cleanupRecorder()

        if (!blob.size) {
          setError('Không có dữ liệu ghi âm, hãy thử lại.')
          return
        }

        try {
          setLoading(true)
          const rms = await analyzeAudioRms(blob)
          if (rms !== null && rms < MIN_AUDIO_VOLUME) {
            setError('Âm lượng ghi âm quá nhỏ, vui lòng nói to hơn và thử lại.')
            setResult(null)
            return
          }
          const audioBase64 = await blobToBase64(blob)
          const response = await evaluatePronunciation({
            activityId,
            audioBase64,
            mimeType,
            phrase: data.phrase,
          })
          const evaluation = response.data
          setResult(evaluation)

          if (evaluation.score >= PASSING_SCORE) {
            toast.success('Bạn đã vượt qua bài phát âm!')
            onPass({
              score: evaluation.score,
              feedback: evaluation.feedback,
              detail: evaluation.detail ?? null,
            })
          } else {
            toast.error('Điểm chưa đạt yêu cầu, hãy thử lại nhé.')
          }
        } catch (err: any) {
          const message =
            err?.response?.data?.message ??
            'Không thể chấm phát âm, vui lòng thử lại.'
          setError(message)
        } finally {
          setLoading(false)
        }
      }

      mr.start()
      setRecording(true)
    } catch (err) {
      console.error(err)
      setError('Không thể truy cập microphone.')
    }
  }

  const stopRec = () => {
    const recorder = mediaRecorder.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }

  useEffect(() => {
    return () => {
      if (mediaRecorder.current) {
        const recorder = mediaRecorder.current
        if (recorder.state !== 'inactive') {
          try {
            recorder.stop()
          } catch {
            // ignore
          }
        }
        cleanupRecorder()
      }
    }
  }, [])

  // Hotkeys for Pronunciation: Space = start/stop recording
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (!recording && !result) {
          startRec()
        } else if (recording) {
          stopRec()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [recording, result])

  const mispronounced =
    result?.detail && Array.isArray((result.detail as any).mispronounced)
      ? ((result.detail as any).mispronounced as string[])
      : []

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
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            onClick={startRec}
            disabled={loading}
            className={classNames(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition',
              'bg-rose-600 hover:bg-rose-700',
              loading && 'opacity-60 hover:bg-rose-600'
            )}
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
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => window.open(data.sampleUrl, '_blank')}
          >
            <Play className="h-4 w-4" /> Nghe mẫu
          </button>
        )}
        {loading && (
          <span className="inline-flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang chấm bài...
          </span>
        )}
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <motion.div
          key={result.attemptId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <div className="text-sm text-gray-700 mb-1">Điểm phát âm</div>
            <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={classNames(
                  'h-full transition-all',
                  result.score >= 85
                    ? 'bg-green-500'
                    : result.score >= PASSING_SCORE
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="mt-1 text-sm font-medium">{result.score}/100</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">
            {result.feedback}
          </div>
          {result.categories?.length ? (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500">
                Nhận xét chi tiết
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-gray-700">
                {result.categories.map((cat, idx) => (
                  <li key={idx}>
                    <span className="font-medium text-gray-800">
                      {cat.name}:
                    </span>{' '}
                    {cat.comment}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {mispronounced.length ? (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Từ cần luyện:</span>{' '}
              {mispronounced.join(', ')}
            </div>
          ) : null}
          {result.transcript && (
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Bạn nói:</span>{' '}
              {result.transcript}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

function SpeakingActivity({
  activityId,
  data,
  onPass,
}: {
  activityId: string
  data: SpeakingContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const minSeconds = data.minSeconds ?? 15

  const cleanupRecorder = () => {
    const recorder = mediaRecorder.current
    if (!recorder) return
    mediaRecorder.current = null
    const stream: MediaStream | undefined = (recorder as any).stream
    stream?.getTracks().forEach((track) => track.stop())
    recorder.ondataavailable = null as any
    recorder.onstop = null as any
    recorder.onerror = null as any
  }

  const start = async () => {
    try {
      setError(null)
      setResult(null)
      setSeconds(0)
      setRecordedBlob(null)
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      chunks.current = []
      mr.ondataavailable = (event) => {
        if (event.data?.size) {
          chunks.current.push(event.data)
        }
      }
      mr.onerror = () => {
        setError('Ghi âm bị lỗi, vui lòng thử lại.')
        setRecording(false)
      }
      mr.onstop = () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecording(false)
        const mimeType = mr.mimeType || 'audio/webm'
        const blob = new Blob(chunks.current, { type: mimeType })
        chunks.current = []
        cleanupRecorder()

        if (!blob.size) {
          setRecordedBlob(null)
          setError('Không có dữ liệu ghi âm, hãy thử lại.')
          return
        }

        setRecordedBlob(blob)
      }

      mr.start()
      setRecording(true)
      timerRef.current = window.setInterval(
        () => setSeconds((s) => s + 1),
        1000
      )
    } catch (err) {
      console.error(err)
      setError('Không thể truy cập microphone.')
    }
  }

  const stop = () => {
    const recorder = mediaRecorder.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }

  const handleSubmit = async () => {
    if (!recordedBlob) {
      setError('Vui lòng ghi âm trước khi nộp bài.')
      return
    }

    if (seconds < minSeconds) {
      setError(`Bài nói cần tối thiểu ${minSeconds} giây.`)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const rms = await analyzeAudioRms(recordedBlob)
      if (rms !== null && rms < MIN_AUDIO_VOLUME) {
        setError('Âm lượng ghi âm quá nhỏ, vui lòng nói to hơn và thử lại.')
        setResult(null)
        return
      }
      const audioBase64 = await blobToBase64(recordedBlob)
      const response = await evaluateSpeaking({
        activityId,
        audioBase64,
        mimeType: recordedBlob.type || 'audio/webm',
        prompt: data.prompt,
        minSeconds: data.minSeconds,
      })
      const evaluation = response.data
      setResult(evaluation)

      if (evaluation.score >= PASSING_SCORE) {
        toast.success('Bạn đã vượt qua bài nói!')
        onPass({
          score: evaluation.score,
          feedback: evaluation.feedback,
          detail: evaluation.detail ?? null,
        })
      } else {
        toast.error('Điểm chưa đạt yêu cầu, hãy thử lại nhé.')
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Không thể chấm bài nói, hãy thử lại.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (mediaRecorder.current) {
        const recorder = mediaRecorder.current
        if (recorder.state !== 'inactive') {
          try {
            recorder.stop()
          } catch {
            // ignore
          }
        }
        cleanupRecorder()
      }
    }
  }, [])

  // Hotkeys for Speaking: Space = start/stop recording
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (!recording && !recordedBlob) {
          start()
        } else if (recording) {
          stop()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [recording, recordedBlob])

  const canSubmit = Boolean(recordedBlob) && seconds >= minSeconds && !loading
  const suggestedPhrases =
    result?.detail && Array.isArray((result.detail as any).suggestedPhrases)
      ? ((result.detail as any).suggestedPhrases as string[])
      : []

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
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            onClick={start}
            disabled={loading}
            className={classNames(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition',
              'bg-blue-600 hover:bg-blue-700',
              loading && 'opacity-60 hover:bg-blue-600'
            )}
          >
            <Mic className="h-4 w-4" /> Bắt đầu
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
          >
            <SquareIcon /> Dừng
          </button>
        )}
        <span className="text-sm text-gray-600">
          Thời gian: {seconds}s (yêu cầu ≥ {minSeconds}s)
        </span>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={classNames(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition',
            canSubmit
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-600 opacity-50'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Đang chấm...
            </>
          ) : (
            'Nộp bài'
          )}
        </button>
        {recordedBlob && !recording && !loading && (
          <span className="text-xs text-gray-500">
            Đã ghi âm xong, bạn có thể nghe lại trước khi nộp.
          </span>
        )}
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <motion.div
          key={result.attemptId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <div className="text-sm text-gray-700 mb-1">Điểm nói</div>
            <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={classNames(
                  'h-full transition-all',
                  result.score >= 85
                    ? 'bg-green-500'
                    : result.score >= PASSING_SCORE
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="mt-1 text-sm font-medium">{result.score}/100</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">
            {result.feedback}
          </div>
          {result.categories?.length ? (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500">
                Nhận xét chi tiết
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-gray-700">
                {result.categories.map((cat, idx) => (
                  <li key={idx}>
                    <span className="font-medium text-gray-800">
                      {cat.name}:
                    </span>{' '}
                    {cat.comment}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.transcript && (
            <div className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Phiên âm:</span>{' '}
              {result.transcript}
            </div>
          )}
          {suggestedPhrases.length ? (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Cụm từ gợi ý:</span>{' '}
              {suggestedPhrases.join(', ')}
            </div>
          ) : null}
        </motion.div>
      )}
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
  const words = useMemo(() => shuffle([...data.pool]), [data.pool])
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
  const correctCount = data.questions.filter(
    (q: ReadingQuestion, idx: number) =>
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
                  Tiếp <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Back to Passage */}
              <button
                onClick={() => setShowPassage(true)}
                className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Xem lại đoạn văn
              </button>
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
                  Hoàn thành bài đọc!
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
        </>
      )}
    </div>
  )
}

function WritingActivity({
  activityId,
  data,
  onPass,
}: {
  activityId: string
  data: WritingContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const words = text.trim() ? text.trim().split(/ +/).length : 0
  const canSubmit = words >= data.minWords && !loading

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await evaluateWriting({
        activityId,
        submission: text,
        prompt: data.prompt,
        minWords: data.minWords,
      })
      const evaluation = response.data
      setResult(evaluation)

      if (evaluation.score >= PASSING_SCORE) {
        toast.success('Bạn đã vượt qua bài viết!')
        onPass({
          score: evaluation.score,
          feedback: evaluation.feedback,
          detail: evaluation.detail ?? null,
        })
      } else {
        toast.error('Điểm chưa đạt yêu cầu, hãy chỉnh sửa và thử lại.')
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Không thể chấm bài viết, thử lại sau.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const strengths =
    result?.detail && Array.isArray((result.detail as any).strengths)
      ? ((result.detail as any).strengths as string[])
      : []
  const improvements =
    result?.detail && Array.isArray((result.detail as any).improvements)
      ? ((result.detail as any).improvements as string[])
      : []
  const evaluatedWordCount =
    result?.detail && typeof (result.detail as any).wordCount === 'number'
      ? ((result.detail as any).wordCount as number)
      : undefined

  // Hotkeys for Writing: Ctrl+Enter = submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && canSubmit) {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [canSubmit])

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
        onChange={(e) => {
          setText(e.target.value)
          setResult(null)
          setError(null)
        }}
        rows={8}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder="Viết bài của bạn ở đây..."
      />
      <div className="flex items-center justify-between text-sm">
        <span>
          Từ: <strong>{words}</strong> / yêu cầu ≥ {data.minWords}
          {evaluatedWordCount ? (
            <span className="ml-2 text-xs text-gray-500">
              (AI ghi nhận {evaluatedWordCount} từ)
            </span>
          ) : null}
        </span>
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={classNames(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition',
            canSubmit
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-emerald-600 opacity-50'
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Đang chấm...
            </>
          ) : (
            'Nộp bài'
          )}
        </button>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {result && (
        <motion.div
          key={result.attemptId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div>
            <div className="text-sm text-gray-700 mb-1">Điểm viết</div>
            <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={classNames(
                  'h-full transition-all',
                  result.score >= 85
                    ? 'bg-green-500'
                    : result.score >= PASSING_SCORE
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="mt-1 text-sm font-medium">{result.score}/100</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-line">
            {result.feedback}
          </div>
          {result.categories?.length ? (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-500">
                Nhận xét chi tiết
              </h4>
              <ul className="mt-1 space-y-1 text-sm text-gray-700">
                {result.categories.map((cat, idx) => (
                  <li key={idx}>
                    <span className="font-medium text-gray-800">
                      {cat.name}:
                    </span>{' '}
                    {cat.comment}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {strengths.length ? (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Điểm mạnh:</span>{' '}
              {strengths.join(', ')}
            </div>
          ) : null}
          {improvements.length ? (
            <div className="text-xs text-gray-600">
              <span className="font-semibold text-gray-700">
                Cần cải thiện:
              </span>{' '}
              {improvements.join(', ')}
            </div>
          ) : null}
        </motion.div>
      )}
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

  // Hotkeys for Conversation: Enter = send message
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
        e.preventDefault()
        send()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [text, turns])

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
  const canGoNext = hasNext && currentActivityCompleted
  return (
    <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 sm:gap-3 rounded-xl border border-gray-200 bg-white p-2 sm:p-3">
      <button
        disabled={!hasPrev}
        onClick={onPrev}
        className={classNames(
          'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm',
          hasPrev
            ? 'border-gray-300 hover:bg-gray-50'
            : 'border-gray-200 opacity-50'
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span>Trước</span>
      </button>

      {/* Removed: Thời gian học chất lượng / Thu thập XP / Lưu tiến độ */}
      <div className="flex-1"></div>

      {allCompleted && nextLesson ? (
        <button
          onClick={onGoToNextLesson}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white hover:bg-green-700"
        >
          <span>Bài học tiếp theo</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      ) : (
        <button
          disabled={!canGoNext}
          onClick={onNext}
          className={classNames(
            'inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm text-white',
            !canGoNext && 'opacity-50 cursor-not-allowed'
          )}
          title={
            !currentActivityCompleted
              ? 'Hoàn thành hoạt động hiện tại để tiếp tục'
              : ''
          }
        >
          <span>Tiếp theo</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<LessonMeta | undefined>()
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeId, setActiveId] = useState<string | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [nextLesson, setNextLesson] = useState<any>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const startingActivityRef = useRef<string | null>(null)
  const blockedActivitiesRef = useRef<Set<string>>(new Set())
  // Track activity start time for timeSpent calculation
  const activityStartTimeRef = useRef<number | null>(null)
  const currentActivityIdRef = useRef<string | null>(null)

  // Get activityId from query params
  const [searchParams] = useSearchParams()
  const targetActivityId = searchParams.get('activityId')

  // TanStack Query hooks
  const nextLessonQuery = useNextLesson()
  const startActivityMutation = useStartActivity()
  const completeActivityMutation = useCompleteActivity()
  const canStartActivityMutation = useCanStartActivity()
  const unlockNextLessonMutation = useUnlockNextLesson()
  const lessonAndActivitiesQuery = useLessonAndActivities(
    classroomId || '',
    lessonId || '',
    user?.id || ''
  )
  const classroomDetailQuery = useClassroomDetail(classroomId || '')

  // Get classroom status - check if in preview mode
  const classroomStatus = classroomDetailQuery.data?.status
  const isPreviewMode = classroomStatus === 'upcoming'

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
      const result = await nextLessonQuery.refetch()
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

  // Update local state when data is available
  useEffect(() => {
    if (lessonData) {
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

      setActivities(mappedActivities)

      // Set activeId based on query param or currentActivityId from API
      if (
        targetActivityId &&
        mappedActivities.some((a: any) => a.id === targetActivityId)
      ) {
        // If targetActivityId exists in query param and is valid, use it
        setActiveId(targetActivityId)
      } else {
        // Otherwise use currentActivityId from API response
        setActiveId(lessonData.currentActivityId)
      }

      setLoading(false)
    }
  }, [lessonData, targetActivityId])

  const handleStartActivity = useCallback(
    async (activityId: string) => {
      if (startingActivityRef.current === activityId) {
        return
      }

      startingActivityRef.current = activityId
      if (!user?.id) return

      try {
        // In preview mode, skip API validation and just set as in_progress
        if (isPreviewMode) {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? { ...a, state: 'in_progress' as ProgressState }
                : a
            )
          )
          setErrorMessage(null)
          setErrorDetails(null)
          return
        }

        // Don't call start API if activity is already completed
        const currentActivity = activities.find((a) => a.id === activityId)
        if (
          currentActivity?.state &&
          ['done', 'mastered', 'review_needed'].includes(currentActivity.state)
        ) {
          // Activity already completed, just clear errors and return
          setErrorMessage(null)
          setErrorDetails(null)
          return
        }

        // Kiểm tra xem có thể start activity không
        const canStartResponse = await canStartActivityMutation.mutateAsync({
          userId: user.id,
          activityId,
        })
        const canStart = canStartResponse.data

        if (!canStart.allowed) {
          blockedActivitiesRef.current.add(activityId)
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
        blockedActivitiesRef.current.delete(activityId)
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
        setErrorMessage(
          'Có lỗi xảy ra khi bắt đầu hoạt động. Vui lòng thử lại.'
        )
      } finally {
        if (startingActivityRef.current === activityId) {
          startingActivityRef.current = null
        }
      }
    },
    [
      user?.id,
      activities,
      isPreviewMode,
      canStartActivityMutation,
      startActivityMutation,
    ]
  )

  const retryStartActivity = useCallback(
    (activityId: string) => {
      blockedActivitiesRef.current.delete(activityId)
      handleStartActivity(activityId)
    },
    [handleStartActivity]
  )

  // Handle error from query
  useEffect(() => {
    if (error) {
      console.error('Failed to fetch lesson and activities:', error)
      setErrorMessage('Không thể tải bài học. Vui lòng thử lại.')
      setLoading(false)
    }
  }, [error])

  // Start activity when activeId changes (for initial load or programmatic changes)
  // Helper function to save time spent for current activity
  const saveTimeSpent = useCallback(
    async (activityId: string, startTime: number) => {
      if (!user?.id || isPreviewMode) return

      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
      if (elapsedSeconds <= 0) return

      try {
        await updateProgressTimeSpent({
          userId: user.id,
          activityId,
          timeSpentSec: elapsedSeconds,
        })
      } catch (error) {
        console.error('Failed to save time spent:', error)
        // Don't throw - this is a background operation
      }
    },
    [user?.id, isPreviewMode]
  )

  // Track activity start time when activeId changes
  useEffect(() => {
    if (!activeId || !user?.id || isPreviewMode) return

    // Save time for previous activity if exists
    if (
      currentActivityIdRef.current &&
      activityStartTimeRef.current &&
      currentActivityIdRef.current !== activeId
    ) {
      saveTimeSpent(
        currentActivityIdRef.current,
        activityStartTimeRef.current
      ).catch(console.error)
    }

    // Start tracking new activity
    currentActivityIdRef.current = activeId
    activityStartTimeRef.current = Date.now()
  }, [activeId, user?.id, isPreviewMode, saveTimeSpent])

  // Save time when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (
        currentActivityIdRef.current &&
        activityStartTimeRef.current &&
        user?.id &&
        !isPreviewMode
      ) {
        // Use synchronous-like approach for cleanup
        const elapsedSeconds = Math.floor(
          (Date.now() - activityStartTimeRef.current) / 1000
        )
        if (elapsedSeconds > 0) {
          updateProgressTimeSpent({
            userId: user.id,
            activityId: currentActivityIdRef.current,
            timeSpentSec: elapsedSeconds,
          }).catch(console.error)
        }
      }
    }
  }, [user?.id, isPreviewMode])

  useEffect(() => {
    if (
      activeId &&
      user?.id &&
      activities &&
      activities.length > 0 &&
      !blockedActivitiesRef.current.has(activeId)
    ) {
      const currentActivity = activities.find((a) => a.id === activeId)
      if (currentActivity && currentActivity.state === 'not_started') {
        setErrorMessage(null) // Clear error when starting new activity
        handleStartActivity(activeId)
      }
    }
  }, [activeId, activities, user?.id, handleStartActivity])

  const handlePass = useCallback(
    async (payload?: ActivityCompletePayload) => {
      if (!activeId || !user?.id) return

      // Block submit in preview mode
      if (isPreviewMode) {
        toast.error(
          'Không thể nộp bài trong chế độ xem trước. Lớp học chưa bắt đầu!'
        )
        return
      }

      try {
        const score = payload?.score ?? 100
        const newState: ProgressState =
          score >= 85 ? 'mastered' : score >= 70 ? 'review_needed' : 'done'

        // Calculate time spent
        let timeSpentSec = 0
        if (
          currentActivityIdRef.current === activeId &&
          activityStartTimeRef.current
        ) {
          timeSpentSec = Math.floor(
            (Date.now() - activityStartTimeRef.current) / 1000
          )
        }

        // Mark activity as completed in local state
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activeId
              ? {
                  ...a,
                  state: newState,
                  lastScore: score,
                  lastFeedback: payload?.feedback,
                }
              : a
          )
        )

        // Call API to complete activity using mutation (includes timeSpentSec)
        await completeActivityMutation.mutateAsync({
          activityId: activeId,
          userId: user.id,
          score,
          timeSpentSec: timeSpentSec > 0 ? timeSpentSec : undefined,
        })

        // Reset tracking for completed activity
        if (currentActivityIdRef.current === activeId) {
          currentActivityIdRef.current = null
          activityStartTimeRef.current = null
        }

        // Invalidate classroom detail cache to refresh progress when user goes back
        if (classroomId) {
          queryClient.invalidateQueries({
            queryKey: ['classroom-detail', classroomId],
          })
        }

        if (newState === 'review_needed') {
          toast(
            'Làm tốt lắm! Hãy thử làm lại bài này khi có thời gian để đạt điểm cao hơn nhé.',
            {
              icon: '💡',
            }
          )
        }

        // Clear any error message on successful completion
        setErrorMessage(null)
        setErrorDetails(null)

        // Check if all activities are now completed after this completion
        const updatedActivities = activities.map((a) =>
          a.id === activeId
            ? {
                ...a,
                state: newState,
                lastScore: score,
                lastFeedback: payload?.feedback,
              }
            : a
        )

        const allCompleted = updatedActivities.every(
          (activity) =>
            activity.state === 'done' ||
            activity.state === 'mastered' ||
            activity.state === 'review_needed'
        )

        // If all activities are completed, try to unlock next lesson
        if (allCompleted && lessonId) {
          try {
            const unlockResult =
              await unlockNextLessonMutation.mutateAsync(lessonId)
            // Show success message with the unlock result
            if (unlockResult.data.message) {
              // Success - lesson unlocked
            }
          } catch (unlockError) {
            // Don't fail the main flow if unlock fails
            console.error('Failed to unlock next lesson:', unlockError)
          }
        }
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
    },
    [
      activeId,
      user?.id,
      activities,
      lessonId,
      classroomId,
      isPreviewMode,
      completeActivityMutation,
      unlockNextLessonMutation,
      queryClient,
    ]
  )

  const jumpTo = (id: string) => {
    const targetActivity = activities.find((a) => a.id === id)
    if (!targetActivity) return

    // In preview mode, allow access to all activities
    if (!isPreviewMode) {
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
    }

    setActiveId(id)
    setErrorMessage(null) // Clear error when jumping to new activity
    setErrorDetails(null)
  }
  const gotoPrev = () => {
    if (activeIndex > 0 && activities) {
      const prevId = activities[activeIndex - 1].id
      setActiveId(prevId)
      setErrorMessage(null) // Clear error when navigating
      setErrorDetails(null)
    }
  }

  const gotoNext = () => {
    if (activeIndex < (activities?.length ?? 0) - 1 && activities) {
      const currentActivity = activities[activeIndex]

      // In preview mode, allow navigation without completion check
      if (!isPreviewMode) {
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
      }

      const nextId = activities[activeIndex + 1].id
      setActiveId(nextId)
      setErrorMessage(null) // Clear error when navigating
      setErrorDetails(null)
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
      <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6">
        <TopBar
          lesson={lesson}
          activity={active}
          onBack={() => navigate(-1)}
          onExit={() => (window.location.href = '/classroom')}
          onShowHistory={() => setShowHistory(true)}
        />

        {/* Preview Mode Banner */}
        {isPreviewMode && (
          <div className="rounded-xl border-2 border-blue-300 bg-blue-50 p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="rounded-full bg-blue-100 p-1.5 sm:p-2 flex-shrink-0">
                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-blue-900">
                  🔍 Chế độ xem trước
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 mt-1">
                  Lớp học chưa bắt đầu. Bạn có thể xem tất cả các hoạt động
                  nhưng không thể nộp bài hoặc lưu tiến trình.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">
                    Không thể bắt đầu hoạt động
                  </h3>
                  <p className="text-xs sm:text-sm text-red-700 mt-1">
                    {errorMessage}
                  </p>
                  {errorDetails?.unmet && errorDetails.unmet.length > 0 && (
                    <div className="mt-2">
                      <p className="text-[10px] sm:text-xs text-red-600 font-medium">
                        Điều kiện chưa đáp ứng:
                      </p>
                      <ul className="mt-1 text-[10px] sm:text-xs text-red-600 list-disc list-inside">
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
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setErrorMessage(null)
                    setErrorDetails(null)
                    if (activeId) {
                      retryStartActivity(activeId)
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
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        <Stepper
          items={activities}
          activeId={activeId}
          onJump={jumpTo}
          isPreviewMode={isPreviewMode}
        />
        <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    Hoạt động #{active?.orderNo}
                  </div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                    {active?.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                    <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span>Cố gắng trả lời rõ ràng</span>
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
                      activityId={active.id}
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
                      activityId={active.id}
                      data={active.content.data}
                      onPass={handlePass}
                    />
                  )}
                  {active.content.kind === 'speaking' && (
                    <SpeakingActivity
                      activityId={active.id}
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
                      activityId={active.id}
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
          <div className="hidden lg:block">
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

        {/* Activity Attempt History Modal */}
        {active && (
          <ActivityAttemptHistory
            activityId={active.id}
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  )
}
