import { motion } from 'framer-motion'
import { Loader2, Mic, Square } from 'lucide-react'
import { useEffect, useRef, useState, type JSX } from 'react'
import toast from 'react-hot-toast'
import {
  evaluateSpeaking,
  type EvaluationResult,
} from '../../../services/evaluation.api'
import type {
  ActivityCompletePayload,
  SpeakingContent,
} from '../../../types/learn.type'
import {
  analyzeAudioRms,
  blobToBase64,
  classNames,
  MIN_AUDIO_VOLUME,
  PASSING_SCORE,
} from '../../../utils/learn.utils'

export function SpeakingActivity({
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
            <Square fill="currentColor" className="h-4 w-4" /> Dừng
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
