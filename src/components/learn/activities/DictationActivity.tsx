import { CheckCircle2, RotateCcw, ShieldCheck, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState, type JSX } from 'react'
import type { DictationContent } from '../../../types/learn.type'

export function DictationActivity({
  data,
  onPass,
}: {
  data: DictationContent
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
