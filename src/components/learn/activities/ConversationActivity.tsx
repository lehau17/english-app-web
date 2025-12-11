import { useEffect, useState, type JSX } from 'react'
import type {
  ConversationContent,
  ConversationMessage,
} from '../../../types/learn.type'
import { classNames } from '../../../utils/learn.utils'

export function ConversationActivity({
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
