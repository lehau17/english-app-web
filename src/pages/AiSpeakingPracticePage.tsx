import {
  MessageCircle,
  Mic,
  RefreshCw,
  StopCircle,
  Volume2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'
import { ConversationDetail } from '../components/ai-speaking/ConversationDetail'
import { ConversationList } from '../components/ai-speaking/ConversationList'
import { NewConversationModal } from '../components/ai-speaking/NewConversationModal'
import { useAuth } from '../context/AuthContext'
import { useGenerateConversationId } from '../hooks/useAiSpeakingConversations'
import { resolveSocketUrl } from '../lib/socket'
import type {
  AiSpeakingSessionDto,
  AiSpeakingTurnDto,
} from '../services/aiSpeaking.api'
import {
  finalizeAiSpeakingSession,
  startAiSpeakingSession,
} from '../services/aiSpeaking.api'

type RecordingState = 'idle' | 'recording' | 'processing'
type TtsState = 'idle' | 'streaming' | 'ready' | 'error'

interface EvaluationState {
  score?: number
  feedback?: string
  transcript?: string
  categories?: Array<{ name: string; comment: string }>
}

type ViewMode = 'session' | 'conversations' | 'conversation-detail'

const blobToBase64 = (blob: Blob): Promise<string> => {
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

const createAudioUrlFromChunks = (chunks: Uint8Array[]): string | null => {
  if (!chunks.length) return null
  const blob = new Blob(chunks as BlobPart[], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

const AiSpeakingPracticePage: React.FC = () => {
  const { user } = useAuth()
  const [session, setSession] = useState<AiSpeakingSessionDto | null>(null)
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null)
  const [currentTurn, setCurrentTurn] = useState<AiSpeakingTurnDto | null>(null)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [ttsState, setTtsState] = useState<TtsState>('idle')
  const [ttsChunkCount, setTtsChunkCount] = useState(0)
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null)
  const [partialTranscript, setPartialTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationState | null>(null)
  const [silenceWarnings, setSilenceWarnings] = useState(0)

  // Conversation-based states
  const [viewMode, setViewMode] = useState<ViewMode>('conversations')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] =
    useState(false)
  const generateConversationId = useGenerateConversationId()
  const [sessionSummary, setSessionSummary] = useState<string | null>(null)
  const [sessionAnalytics, setSessionAnalytics] = useState<Record<
    string,
    unknown
  > | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef<number>(0)
  const chunkQueueRef = useRef<Array<{ base64: string; sequence: number }>>([])
  const waitingAckRef = useRef(false)
  const sequenceRef = useRef(0)
  const audioBuffersRef = useRef<Uint8Array[]>([])

  const socketUrl = useMemo(() => `${resolveSocketUrl()}/ai-speaking`, [])

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (aiAudioUrl) {
        URL.revokeObjectURL(aiAudioUrl)
      }
    }
  }, [aiAudioUrl])

  const connectSocket = useCallback(
    (sessionId: string) => {
      console.log('🔌 Connecting to WebSocket:', { sessionId, socketUrl })

      if (!sessionId) {
        console.error('❌ No sessionId provided to connectSocket')
        return
      }

      if (socketRef.current) {
        console.log('🔄 Disconnecting existing socket')
        socketRef.current.disconnect()
      }

      const socket = io(socketUrl, {
        transports: ['websocket'],
        query: { sessionId },
      })

      console.log('📡 Socket connection initiated with query:', { sessionId })

      socket.on('connect', () => {
        console.log(
          '✅ WebSocket connected successfully with sessionId:',
          sessionId
        )
        setSilenceWarnings(0)
      })

      socket.on('disconnect', () => {
        setRecordingState('idle')
      })

      socket.on('ai-speaking:tts-start', (payload: { turnId: string }) => {
        setTtsState('streaming')
        setTtsChunkCount(0)
        setEvaluation(null)
        setPartialTranscript('')
        setFinalTranscript('')
        if (aiAudioUrl) {
          URL.revokeObjectURL(aiAudioUrl)
          setAiAudioUrl(null)
        }
        audioBuffersRef.current = []
        setCurrentTurnId(payload.turnId)
      })

      socket.on(
        'ai-speaking:tts-chunk',
        (payload: { turnId: string; audio: string; sequence: number }) => {
          if (payload.audio) {
            const binary = atob(payload.audio)
            const view = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i += 1) {
              view[i] = binary.charCodeAt(i)
            }
            audioBuffersRef.current.push(view)
            setTtsChunkCount((count) => count + 1)
          }
        }
      )

      socket.on(
        'ai-speaking:tts-end',
        (payload: { turnId: string; audioUrl?: string | null }) => {
          setTtsState(payload.audioUrl ? 'ready' : 'idle')
          const mergedUrl = payload.audioUrl
            ? payload.audioUrl
            : createAudioUrlFromChunks(audioBuffersRef.current)
          if (mergedUrl) {
            setAiAudioUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev)
              return mergedUrl
            })
          }
        }
      )

      socket.on('ai-speaking:tts-error', (payload: { message: string }) => {
        setTtsState('error')
        toast.error(payload?.message ?? 'Không thể phát âm AI')
      })

      socket.on(
        'ai-speaking:asr-partial',
        (payload: {
          turnId: string
          text: string
          confidence?: number | null
        }) => {
          setPartialTranscript(payload.text)
        }
      )

      socket.on(
        'ai-speaking:asr-final',
        (payload: {
          turnId: string
          text: string
          confidence?: number | null
        }) => {
          setFinalTranscript(payload.text)
        }
      )

      socket.on(
        'ai-speaking:turn-evaluated',
        (payload: { turnId: string; evaluation: Record<string, any> }) => {
          setEvaluation({
            score: payload.evaluation?.score,
            feedback: payload.evaluation?.feedback,
            transcript: payload.evaluation?.transcript,
            categories: Array.isArray(payload.evaluation?.categories)
              ? (payload.evaluation.categories as Array<{
                  name: string
                  comment: string
                }>)
              : undefined,
          })

          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  turns: prev.turns.map((turn) =>
                    turn.id === payload.turnId
                      ? {
                          ...turn,
                          score: payload.evaluation?.score,
                          evaluation: payload.evaluation,
                        }
                      : turn
                  ),
                }
              : prev
          )
        }
      )

      socket.on(
        'ai-speaking:next-turn',
        (payload: { turnId: string; prompt: string; difficulty?: string }) => {
          setCurrentTurnId(payload.turnId)
          setCurrentTurn(null)
          setTtsState('streaming')
          setTtsChunkCount(0)
          audioBuffersRef.current = []
          setPartialTranscript('')
          setFinalTranscript('')
          setEvaluation(null)
          toast.success('AI đã gửi câu hỏi tiếp theo')
        }
      )

      socket.on(
        'ai-speaking:user-ended',
        (payload: { turnId: string; audioUrl?: string | null }) => {
          if (payload.audioUrl) {
            setAiAudioUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev)
              return payload.audioUrl ?? null
            })
          }
        }
      )

      socket.on(
        'ai-speaking:silence-warning',
        (payload: { turnId: string; level: number }) => {
          setSilenceWarnings(payload.level)
          toast.error(
            payload.level >= 2
              ? 'Không nghe thấy phản hồi, AI sẽ gợi ý câu hỏi dễ hơn.'
              : 'Không nghe thấy bạn, hãy thử nói to hơn nhé.'
          )
        }
      )

      socket.on(
        'ai-speaking:session-finished',
        (payload: {
          summary?: string
          analytics?: Record<string, unknown>
        }) => {
          toast.success('Phiên luyện nói đã kết thúc')
          setSessionSummary(payload.summary ?? null)
          setSessionAnalytics(payload.analytics ?? null)
        }
      )

      socket.on(
        'ai-speaking:ack',
        (payload: { type: string; sequence?: number | null }) => {
          if (payload.type === 'audio-chunk') {
            waitingAckRef.current = false
            sendNextChunk()
          }
        }
      )

      socketRef.current = socket
    },
    [aiAudioUrl, socketUrl]
  )

  const detachRecorderStream = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    const stream: MediaStream | undefined = (recorder as any).stream
    stream?.getTracks().forEach((track) => track.stop())
  }

  const sendNextChunk = () => {
    if (!session || !currentTurnId) return
    if (waitingAckRef.current) return
    const socket = socketRef.current
    if (!socket) return

    const next = chunkQueueRef.current.shift()
    if (!next) return
    waitingAckRef.current = true
    socket.emit('ai-speaking:user-audio-chunk', {
      sessionId: session.id,
      turnId: currentTurnId,
      chunk: next.base64,
      sequence: next.sequence,
      mimeType: recorderRef.current?.mimeType || 'audio/webm',
    })
  }

  const startRecording = useCallback(async () => {
    if (!session || !currentTurnId || recordingState === 'recording') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunkQueueRef.current = []
      waitingAckRef.current = false
      sequenceRef.current = 0
      durationRef.current = 0
      setPartialTranscript('')
      setFinalTranscript('')
      setEvaluation(null)
      setSilenceWarnings(0)

      recorder.ondataavailable = async (event) => {
        if (!event.data || !event.data.size) return
        const base64 = await blobToBase64(event.data)
        chunkQueueRef.current.push({
          base64,
          sequence: sequenceRef.current++,
        })
        sendNextChunk()
      }

      recorder.onerror = () => {
        toast.error('Ghi âm gặp lỗi, hãy thử lại.')
        setRecordingState('idle')
        detachRecorderStream()
      }

      recorder.onstop = () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingState('processing')
        detachRecorderStream()
        const socket = socketRef.current
        if (socket && session && currentTurnId) {
          socket.emit('ai-speaking:user-stop', {
            sessionId: session.id,
            turnId: currentTurnId,
            durationSec: durationRef.current,
          })
        }
      }

      recorder.start(1000)
      setRecordingState('recording')
      timerRef.current = window.setInterval(() => {
        durationRef.current += 1
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập.')
    }
  }, [currentTurnId, recordingState, session])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const handleStartSession = async (params: {
    conversationId?: string
    topic: string
    goal?: string
    targetDifficulty: string
    maxTurns: number
  }) => {
    if (!user?.id) {
      toast.error('Bạn cần đăng nhập để luyện nói')
      return
    }

    try {
      const conversationId = params.conversationId || generateConversationId()

      const created = await startAiSpeakingSession({
        conversationId,
        topic: params.topic,
        goal: params.goal,
        targetDifficulty: params.targetDifficulty,
        maxTurns: params.maxTurns,
      })

      console.log('🎯 Session created successfully:', created)

      setSession(created)
      setSelectedConversationId(conversationId)
      setViewMode('session')

      const initialTurn = [...created.turns].sort(
        (a, b) => a.turnIndex - b.turnIndex
      )[0]
      if (initialTurn) {
        setCurrentTurnId(initialTurn.id)
        setCurrentTurn(initialTurn)
        console.log('📋 Initial turn set:', initialTurn)
      }

      console.log('🔌 About to connect socket with session ID:', created.id)
      connectSocket(created.id)
      setSessionSummary(null)
      setSessionAnalytics(null)

      // Close modal if open
      setIsNewConversationModalOpen(false)

      toast.success('Đã bắt đầu phiên luyện nói với AI')
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Không thể khởi tạo phiên'
      toast.error(message)
    }
  }

  const handleFinalizeSession = async () => {
    if (!session) return
    try {
      const finalized = await finalizeAiSpeakingSession(session.id, {
        reason: 'User requested summary',
      })
      setSession(finalized)
      setSessionSummary(finalized.summary ?? null)
      setSessionAnalytics(finalized.analytics ?? null)
      toast.success('Đã tổng kết phiên luyện nói')
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Không thể kết thúc phiên'
      toast.error(message)
    }
  }

  const handleShowConversationDetail = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setViewMode('conversation-detail')
  }

  const handleContinueConversation = (conversationId: string) => {
    setIsNewConversationModalOpen(true)
    setSelectedConversationId(conversationId)
  }

  const handleBackToConversations = () => {
    setViewMode('conversations')
    setSelectedConversationId(null)
  }

  const handleNewConversation = () => {
    setSelectedConversationId(null)
    setIsNewConversationModalOpen(true)
  }

  const canRecord = Boolean(session) && Boolean(currentTurnId)
  const hasEvaluation = Boolean(evaluation?.score)

  // Render based on view mode
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Luyện nói cùng AI
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Chọn cuộc hội thoại hiện có hoặc tạo mới để tiếp tục luyện nói với
              trợ giảng AI.
            </p>
          </div>

          <div className="flex gap-3">
            {viewMode !== 'conversations' && (
              <button
                onClick={handleBackToConversations}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại danh sách
              </button>
            )}

            <button
              onClick={handleNewConversation}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4" /> Tạo hội thoại mới
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'conversations' && (
        <ConversationList
          onSelectConversation={handleShowConversationDetail}
          onStartNewConversation={handleNewConversation}
        />
      )}

      {viewMode === 'conversation-detail' && selectedConversationId && (
        <ConversationDetail
          conversationId={selectedConversationId}
          onStartNewSession={handleContinueConversation}
        />
      )}

      {viewMode === 'session' && session && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Lượt hiện tại
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentTurn?.aiPrompt ?? 'Đang chờ trợ giảng...'}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    Độ khó:{' '}
                    {session.currentDifficulty ?? session.targetDifficulty}
                  </span>
                  <span>|</span>
                  <span>
                    Lượt {session.turnCount}/{session.maxTurns}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-start gap-3">
                  <Volume2 className="mt-1 h-5 w-5 text-blue-600" />
                  <div className="space-y-2 text-sm text-blue-900">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-blue-600">
                      {ttsState === 'streaming' && (
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                      )}
                      AI response
                    </div>
                    {aiAudioUrl ? (
                      <audio src={aiAudioUrl} controls className="w-full" />
                    ) : (
                      <p className="text-sm">
                        {ttsState === 'streaming'
                          ? 'AI đang chuẩn bị câu trả lời...'
                          : 'Bấm ghi âm để trả lời và chờ phản hồi từ AI.'}
                      </p>
                    )}
                    {ttsChunkCount > 0 && (
                      <p className="text-xs text-blue-700">
                        Đã nhận {ttsChunkCount} đoạn âm thanh từ AI.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  {recordingState !== 'recording' ? (
                    <button
                      onClick={startRecording}
                      disabled={!canRecord}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Mic className="h-4 w-4" /> Bắt đầu trả lời
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      <StopCircle className="h-4 w-4" /> Dừng ghi âm
                    </button>
                  )}
                  <span className="text-sm text-gray-600">
                    Thời lượng: {durationRef.current}s
                  </span>
                  {silenceWarnings > 0 && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                      AI chưa nghe thấy bạn ({silenceWarnings})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Mẹo: hãy trả lời tối thiểu 8-10 giây để AI có đủ dữ liệu đánh
                  giá. Bạn có thể dừng bất cứ lúc nào và AI sẽ đưa ra phản hồi.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Phiên âm tạm thời
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 min-h-[48px] whitespace-pre-line">
                    {partialTranscript || 'AI đang nghe và phân tích...'}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Phiên âm cuối cùng
                  </h3>
                  <p className="mt-2 text-sm text-gray-700 min-h-[48px] whitespace-pre-line">
                    {finalTranscript || 'Sẽ hiển thị sau khi bạn dừng ghi âm.'}
                  </p>
                </div>
              </div>

              {hasEvaluation ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-emerald-900">
                      Kết quả đánh giá
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700">
                      {evaluation?.score ?? 0}/100
                    </span>
                  </div>
                  {evaluation?.feedback && (
                    <p className="mt-2 text-sm text-emerald-900 whitespace-pre-line">
                      {evaluation.feedback}
                    </p>
                  )}
                  {evaluation?.categories && (
                    <ul className="mt-3 space-y-1 text-sm text-emerald-800">
                      {evaluation.categories.map((cat) => (
                        <li key={cat.name}>
                          <span className="font-medium">{cat.name}: </span>
                          {cat.comment}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>

            {sessionSummary && (
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tổng kết phiên
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                  {sessionSummary}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800">
                Tiến trình
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>
                  Lượt hiện tại: {session.turnCount}/{session.maxTurns}
                </li>
                <li>Cảnh báo im lặng: {session.silenceWarnings}</li>
                <li>Chủ đề: {session.topic ?? 'Tự do'}</li>
              </ul>
              <button
                onClick={handleFinalizeSession}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
              >
                <RefreshCw className="h-4 w-4" /> Tổng kết phiên
              </button>
            </div>

            {sessionAnalytics && (
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-800">
                  Thống kê
                </h3>
                <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-600">
                  {JSON.stringify(sessionAnalytics, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        onStartConversation={handleStartSession}
        existingConversationId={selectedConversationId || undefined}
      />
    </div>
  )
}

export default AiSpeakingPracticePage
