import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, type JSX } from 'react'
import toast from 'react-hot-toast'
import {
  evaluateWriting,
  type EvaluationResult,
} from '../../../services/evaluation.api'
import type {
  ActivityCompletePayload,
  WritingContent,
} from '../../../types/learn.type'
import { classNames, PASSING_SCORE } from '../../../utils/learn.utils'

export function WritingActivity({
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
