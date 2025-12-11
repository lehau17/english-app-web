import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  Play,
  Square,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import toast from 'react-hot-toast'
import {
  evaluatePronunciation,
  type EvaluationResult,
} from '../../../services/evaluation.api'
import type {
  ActivityCompletePayload,
  PronunciationContent,
} from '../../../types/learn.type'
import {
  analyzeAudioRms,
  blobToBase64,
  classNames,
  MIN_AUDIO_VOLUME,
  PASSING_SCORE,
} from '../../../utils/learn.utils'

export function PronunciationActivity({
  activityId,
  data,
  onPass,
}: {
  activityId: string
  data: PronunciationContent
  onPass: (payload?: ActivityCompletePayload) => void
}): JSX.Element {
  // Normalize items to support both single phrase and multiple phrases
  // CMS/Backend format: phrases: [{ text: string, sampleUrl?: string }]
  // Legacy format: phrases: [{ phrase: string, sampleUrl?: string }] or phrases: string[]
  // Single format: phrase: string
  const items = useMemo(() => {
    const rawPhrases = (data as any).phrases
    if (Array.isArray(rawPhrases) && rawPhrases.length > 0) {
      return rawPhrases.map((p: any) => {
        if (typeof p === 'string') {
          return { phrase: p, tips: data.tips, sampleUrl: data.sampleUrl }
        }
        // Handle both CMS format (text) and legacy format (phrase)
        const phraseText = p.text || p.phrase || ''
        return {
          phrase: phraseText,
          tips: p.tips || data.tips,
          sampleUrl: p.sampleUrl || data.sampleUrl,
        }
      })
    }
    // Fallback to single phrase format
    return [
      { phrase: data.phrase || '', tips: data.tips, sampleUrl: data.sampleUrl },
    ]
  }, [data])

  const [idx, setIdx] = useState(0)
  const currentItem = items[idx] || { phrase: '', tips: [], sampleUrl: '' }

  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)

  // Reset result when switching item
  useEffect(() => {
    setResult(null)
    setError(null)
    setRecording(false)
  }, [idx])

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
            phrase: currentItem.phrase,
          })
          const evaluation = response.data
          setResult(evaluation)

          if (evaluation.score >= PASSING_SCORE) {
            toast.success('Bạn đã vượt qua bài phát âm!')
            // Optional: Auto advance or require all?
            // For now, if passed, we can allow passing the whole activity
            // or just stay to practice more.
            // Let's call onPass only if it's the last item or we want to allow early exit.
            // Current rule: Passing any item counts as "activity done" in terms of saving progress,
            // but user can continue.
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
  }, [recording, result, idx]) // Added idx deps

  const mispronounced =
    result?.detail && Array.isArray((result.detail as any).mispronounced)
      ? ((result.detail as any).mispronounced as string[])
      : []

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {/* Header logic for Multi-phrase */}
      {items.length > 1 && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
          <div className="text-sm font-medium text-gray-500">
            Mẫu câu {idx + 1} / {items.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIdx(Math.max(0, idx - 1))}
              disabled={idx === 0}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIdx(Math.min(items.length - 1, idx + 1))}
              disabled={idx === items.length - 1}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold">
        Nói theo: "{currentItem.phrase}"
      </h3>
      {currentItem.tips?.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-amber-900 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            {currentItem.tips.map((t: string, i: number) => (
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
            <Square fill="currentColor" className="h-4 w-4" /> Dừng ghi
          </button>
        )}
        {currentItem.sampleUrl && (
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => window.open(currentItem.sampleUrl, '_blank')}
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
                Chi tiết
              </h4>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {result.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between rounded bg-white p-2 text-sm border border-gray-100"
                  >
                    <span>{cat.name}</span>
                    {/* <span
                                            className={
                                                cat.score >= 80 ? 'text-green-600' : 'text-amber-600'
                                            }
                                        >
                                            {cat.score}
                                        </span> */}
                  </div>
                ))}
              </div>
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
