import {
  Image,
  Loader2,
  Maximize,
  MessageSquareText,
  Minimize,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type {
  ConversationMessage,
  ConversationParticipant,
  ConversationSummary,
} from '../../types/conversation.type'

interface ClassroomOption {
  id: string
  name: string
}

interface ConversationPanelProps {
  onClose: () => void
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  classrooms: ClassroomOption[]
  selectedClassroomId?: string
  onSelectClassroom: (id: string) => void
  conversations: ConversationSummary[]
  loadingConversations: boolean
  selectedConversation?: ConversationSummary
  onSelectConversation: (id: string) => void
  messages: ConversationMessage[]
  loadingMessages: boolean
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>
  sendingMessage: boolean
  hasMoreMessages: boolean
  onLoadMoreMessages: () => void
  loadingMoreMessages: boolean
  currentUserId?: string
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  classrooms,
  selectedClassroomId,
  onSelectClassroom,
  conversations,
  loadingConversations,
  selectedConversation,
  onSelectConversation,
  messages,
  loadingMessages,
  onSendMessage,
  sendingMessage,
  hasMoreMessages,
  onLoadMoreMessages,
  loadingMoreMessages,
  currentUserId,
}) => {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (loadingMessages) return
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages, loadingMessages, selectedConversation?.id])

  useEffect(() => {
    if (!sendingMessage) {
      setSending(false)
    }
  }, [sendingMessage])

  const handleSubmit = async () => {
    const content = draft.trim()
    if (!content && selectedFiles.length === 0) return
    setSending(true)
    try {
      await onSendMessage(content, selectedFiles)
      setDraft('')
      setSelectedFiles([])
    } finally {
      setSending(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    setSelectedFiles((prev) => [...prev, ...imageFiles])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const renderParticipantNames = (participants: ConversationParticipant[]) => {
    const names = participants
      .filter((p) => p.id !== currentUserId)
      .map(
        (p) =>
          p.displayName ||
          [p.firstName, p.lastName].filter(Boolean).join(' ') ||
          'Ẩn danh'
      )
    if (names.length === 0 && participants.length > 0) {
      return 'Bạn'
    }
    return names.join(', ')
  }

  return (
    <div
      className={`mb-4 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl ${
        isFullscreen
          ? 'fixed inset-0 z-50 m-0 h-screen w-screen rounded-none'
          : 'w-[500px]'
      }`}
    >
      <div className="flex items-center justify-between border-b border-black/5 bg-slate-900/95 px-4 py-3 text-white">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide">
            <MessageSquareText className="h-4 w-4" />
            Trò chuyện lớp học
          </div>
          {classrooms.length > 1 ? (
            <select
              value={selectedClassroomId}
              onChange={(event) => onSelectClassroom(event.target.value)}
              className="mt-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-white outline-none backdrop-blur"
            >
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id} className="text-slate-900">
                  {cls.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="mt-1 text-xs text-white/70">
              {classrooms[0]?.name ?? 'Không có lớp'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
              title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Đóng trò chuyện"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`flex ${isFullscreen ? 'h-[calc(100vh-64px)]' : 'h-[420px]'}`}
      >
        <aside
          className={`border-r border-black/5 bg-slate-50/60 ${isFullscreen ? 'w-64' : 'w-40'}`}
        >
          {loadingConversations ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-400">
              Chưa có cuộc trò chuyện nào cho lớp này.
            </div>
          ) : (
            <ul className="h-full overflow-y-auto">
              {conversations.map((conversation) => {
                const isActive = conversation.id === selectedConversation?.id
                const unread = conversation.unreadCount ?? 0
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conversation.id)}
                      className={`flex w-full flex-col gap-1 border-l-2 px-3 py-2 text-left text-xs transition ${
                        isActive
                          ? 'border-blue-500 bg-white text-slate-900 shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-white/80'
                      }`}
                    >
                      <span className="line-clamp-1 font-semibold">
                        {conversation.name ||
                          (conversation.type === 'class'
                            ? 'Chat lớp'
                            : renderParticipantNames(
                                conversation.participants
                              ))}
                      </span>
                      <span className="line-clamp-1 text-[11px] text-slate-400">
                        {conversation.lastMessagePreview || 'Chưa có tin nhắn'}
                      </span>
                      {unread > 0 && (
                        <span className="mt-0.5 inline-flex w-fit rounded-full bg-blue-500/10 px-2 py-[1px] text-[10px] font-semibold text-blue-600">
                          {unread} chưa đọc
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        <section className="flex flex-1 flex-col">
          {selectedConversation ? (
            <>
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs text-slate-500">
                <span>
                  {selectedConversation.type === 'class'
                    ? 'Cả lớp'
                    : renderParticipantNames(selectedConversation.participants)}
                </span>
                {selectedConversation.lastMessageAt && (
                  <span>
                    Cập nhật{' '}
                    {formatRelativeTime(selectedConversation.lastMessageAt)}
                  </span>
                )}
              </div>
              <div
                ref={messagesContainerRef}
                className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-3"
              >
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {hasMoreMessages && (
                      <button
                        type="button"
                        onClick={onLoadMoreMessages}
                        disabled={loadingMoreMessages}
                        className="mx-auto mb-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
                      >
                        {loadingMoreMessages && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        Xem tin nhắn cũ hơn
                      </button>
                    )}
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Hãy gửi tin nhắn đầu tiên cho cuộc trò chuyện này.
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.senderId === currentUserId
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isMine
                                ? 'justify-end pl-10'
                                : 'justify-start pr-10'
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                isMine
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-700'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                              </div>
                              <div
                                className={`mt-1 text-[10px] ${
                                  isMine ? 'text-white/70' : 'text-slate-400'
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-black/5 bg-white px-4 py-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                {selectedFiles.length > 0 && (
                  <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative flex-shrink-0">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-2xl border border-black/5 bg-slate-50/80 p-2 shadow-inner">
                  <textarea
                    className="h-16 w-full resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Nhập tin nhắn..."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSubmit()
                      }
                    }}
                    disabled={sendingMessage || sending}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-200"
                    >
                      <Image className="h-3 w-3" />
                      Hình ảnh
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={
                        sendingMessage ||
                        sending ||
                        (!draft.trim() && selectedFiles.length === 0)
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {(sendingMessage || sending) && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-sm text-slate-400">
              Chọn một cuộc trò chuyện để bắt đầu trao đổi.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function formatRelativeTime(iso: string) {
  try {
    const date = new Date(iso)
    const formatter = new Intl.RelativeTimeFormat('vi-VN', {
      numeric: 'auto',
    })
    const diffMs = date.getTime() - Date.now()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    if (Math.abs(diffMinutes) < 60) {
      return formatter.format(diffMinutes, 'minute')
    }
    const diffHours = Math.round(diffMinutes / 60)
    if (Math.abs(diffHours) < 24) {
      return formatter.format(diffHours, 'hour')
    }
    const diffDays = Math.round(diffHours / 24)
    return formatter.format(diffDays, 'day')
  } catch {
    return ''
  }
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}
