import {
  MessageCircle,
  Mic,
  RefreshCw,
  StopCircle,
  Volume2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { ConversationDetail } from '../components/ai-speaking/ConversationDetail'
import { ConversationList } from '../components/ai-speaking/ConversationList'
import { NewConversationModal } from '../components/ai-speaking/NewConversationModal'
import TextInteractionWrapper from '../components/common/TextInteractionWrapper'
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

interface ConversationMessage {
  id: string
  role: 'ai' | 'user'
  turnId: string
  audioUrl?: string | null
  text?: string | null
  createdAt: number
}

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
  const navigate = useNavigate()
  const [session, setSession] = useState<AiSpeakingSessionDto | null>(null)
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null)
  const [currentTurn, setCurrentTurn] = useState<AiSpeakingTurnDto | null>(null)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [ttsState, setTtsState] = useState<TtsState>('idle')
  const [ttsChunkCount, setTtsChunkCount] = useState(0)
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null)
  const [aiStatusMessage, setAiStatusMessage] = useState(
    'Chờ bạn ghi âm để AI phản hồi.'
  )
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)
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
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])

  const socketRef = useRef<Socket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number | null>(null)
  const durationRef = useRef<number>(0)
  const chunkQueueRef = useRef<Array<{ base64: string; sequence: number }>>([])
  const waitingAckRef = useRef(false)
  const sequenceRef = useRef(0)
  const audioBuffersRef = useRef<Uint8Array[]>([])
  const sessionRef = useRef<AiSpeakingSessionDto | null>(null)
  const turnPromptRef = useRef<Map<string, string>>(new Map())
  const isStoppingRef = useRef(false)

  const upsertConversationMessage = useCallback(
    (message: ConversationMessage) => {
      setConversationMessages((prev) => {
        const index = prev.findIndex((item) => item.id === message.id)
        if (index !== -1) {
          const next = [...prev]
          next[index] = {
            ...next[index],
            ...message,
            createdAt: next[index].createdAt ?? message.createdAt,
          }
          return next
        }
        return [...prev, message]
      })
    },
    []
  )

  const appendAudioToConversation = useCallback(
    (params: {
      role: 'ai' | 'user'
      turnId: string
      audioUrl?: string | null
      text?: string | null
    }) => {
      const { role, turnId, audioUrl, text } = params
      const id = `${role}-${turnId}`

      upsertConversationMessage({
        id,
        role,
        turnId,
        audioUrl: audioUrl ?? undefined,
        text: text ?? null,
        createdAt: Date.now(),
      })
    },
    [upsertConversationMessage]
  )

  const socketUrl = useMemo(() => `${resolveSocketUrl()}/ai-speaking`, [])

  useEffect(() => {
    sessionRef.current = session

    if (session?.turns?.length) {
      const nextMap = new Map<string, string>()
      session.turns.forEach((turn) => {
        if (turn.aiPrompt) {
          nextMap.set(turn.id, turn.aiPrompt)
        }
      })
      turnPromptRef.current = nextMap
    }
  }, [session])

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
    }
  }, [])

  useEffect(() => {
    if (!aiAudioUrl) return () => {}

    return () => {
      URL.revokeObjectURL(aiAudioUrl)
    }
  }, [aiAudioUrl])

  const sendNextChunk = useCallback(() => {
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
  }, [currentTurnId, session])

  const emitUserStop = useCallback(() => {
    const socket = socketRef.current
    if (!socket || !session || !currentTurnId) return false
    if (waitingAckRef.current || chunkQueueRef.current.length > 0) {
      return false
    }

    socket.emit('ai-speaking:user-stop', {
      sessionId: session.id,
      turnId: currentTurnId,
      durationSec: durationRef.current,
    })

    return true
  }, [currentTurnId, session])

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
        auth: { sessionId },
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
        setAiStatusMessage('AI đang chuẩn bị phản hồi cho bạn...')
        setAiErrorMessage(null)
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
            setAiStatusMessage('AI đang gửi âm thanh, vui lòng chờ...')
          }
        }
      )

      socket.on(
        'ai-speaking:tts-end',
        (payload: {
          turnId: string
          audioUrl?: string | null
          text?: string | null
        }) => {
          setTtsState(payload.audioUrl ? 'ready' : 'idle')
          const mergedUrl = payload.audioUrl
            ? payload.audioUrl
            : createAudioUrlFromChunks(audioBuffersRef.current)

          // ✅ Ưu tiên lấy text từ payload, nếu không có thì fallback sang turnPromptRef
          const promptText =
            payload.text ??
            turnPromptRef.current.get(payload.turnId) ??
            sessionRef.current?.turns?.find(
              (turn) => turn.id === payload.turnId
            )?.aiPrompt ??
            null

          if (mergedUrl) {
            setAiAudioUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev)
              return mergedUrl
            })
            setAiStatusMessage(
              'AI đã phản hồi, hãy nhấn phát để nghe âm thanh.'
            )
            setAiErrorMessage(null)
            appendAudioToConversation({
              role: 'ai',
              turnId: payload.turnId,
              audioUrl: mergedUrl,
              text: promptText,
            })
          } else {
            setAiStatusMessage('AI đã phản hồi nhưng không gửi được âm thanh.')
            setAiErrorMessage(
              'Không nhận được âm thanh từ AI. Vui lòng xem transcript hoặc thử lại.'
            )
            appendAudioToConversation({
              role: 'ai',
              turnId: payload.turnId,
              audioUrl: null,
              text: promptText,
            })
          }
        }
      )

      socket.on('ai-speaking:tts-error', (payload: { message: string }) => {
        setTtsState('error')
        toast.error(payload?.message ?? 'Không thể phát âm AI')
        setAiErrorMessage(payload?.message ?? 'Không thể phát âm AI.')
        setAiStatusMessage('AI gặp lỗi khi phát âm thanh.')
      })

      // ✅ Listen for profanity warnings
      socket.on(
        'ai-speaking:profanity-warning',
        (payload: {
          turnId: string
          severity: string
          violationCount: number
          maxViolations: number
          message: string
        }) => {
          console.warn('[Profanity Warning]', payload)

          if (payload.violationCount >= payload.maxViolations) {
            // Banned - show severe error
            toast.error(payload.message, {
              duration: 10000,
              icon: '🚫',
              style: {
                background: '#DC2626',
                color: '#fff',
                fontWeight: 'bold',
              },
            })
          } else {
            // Warning - show alert
            toast(payload.message, {
              duration: 6000,
              icon: '⚠️',
              style: {
                background: '#F59E0B',
                color: '#fff',
                fontWeight: 'bold',
              },
            })
          }
        }
      )

      // ✅ Listen for session ended (from profanity ban)
      socket.on(
        'ai-speaking:session-ended',
        (payload: { sessionId: string; reason: string; message: string }) => {
          console.warn('[Session Ended]', payload)

          if (payload.reason === 'profanity-ban') {
            toast.error(payload.message, {
              duration: 10000,
              icon: '🚫',
            })

            // Navigate back after delay
            setTimeout(() => {
              navigate('/ai-speaking')
            }, 3000)
          }
        }
      )

      socket.on(
        'ai-speaking:asr-partial',
        (payload: {
          turnId: string
          text: string
          confidence?: number | null
        }) => {
          console.log('[ASR Partial]', payload)
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
          appendAudioToConversation({
            role: 'user',
            turnId: payload.turnId,
            text: payload.text,
          })
        }
      )

      socket.on(
        'ai-speaking:asr-error',
        (payload: { turnId: string; message?: string }) => {
          const message =
            payload?.message ?? 'Hệ thống gặp lỗi khi xử lý giọng nói.'
          setAiErrorMessage(message)
          setAiStatusMessage(
            'Không thể xử lý âm thanh vừa ghi. Vui lòng thử lại.'
          )
          toast.error(message)
        }
      )

      socket.on(
        'ai-speaking:asr-silence',
        (_payload: {
          turnId: string
          averageEnergy?: number
          durationSec?: number
        }) => {
          setAiErrorMessage(
            'AI không nghe thấy bạn. Hãy thử nói to hơn hoặc kiểm tra micro.'
          )
          setAiStatusMessage(
            'Không nhận được nội dung giọng nói. Hãy ghi âm lại nhé.'
          )
          toast('AI không nghe thấy bạn, hãy thử ghi âm lại.', {
            icon: '🔇',
          })
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
          setAiStatusMessage('AI đã phân tích câu trả lời của bạn.')

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
          setAiStatusMessage('AI đang chuẩn bị câu hỏi mới cho bạn...')
          setAiErrorMessage(null)
          turnPromptRef.current.set(payload.turnId, payload.prompt)

          // Update turn count
          setSession((prev) =>
            prev ? { ...prev, turnCount: prev.turnCount + 1 } : prev
          )
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
            setAiStatusMessage('AI đã ghi lại câu trả lời của bạn.')
            appendAudioToConversation({
              role: 'user',
              turnId: payload.turnId,
              audioUrl: payload.audioUrl ?? null,
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
        'ai-speaking:turn-evaluated',
        (payload: {
          turnId: string
          evaluation: {
            score: number
            feedback: string
            transcript?: string
            categories?: Array<{ name: string; comment: string }>
          }
        }) => {
          console.log('📊 Turn evaluated:', payload)
          setEvaluation({
            score: payload.evaluation.score,
            feedback: payload.evaluation.feedback,
            categories: payload.evaluation.categories ?? [],
          })
          setFinalTranscript(payload.evaluation.transcript ?? '')
          setRecordingState('idle')

          // Show feedback
          if (payload.evaluation.score === 0) {
            toast(payload.evaluation.feedback, {
              duration: 6000,
              icon: 'ℹ️',
              style: {
                background: '#3b82f6',
                color: 'white',
              },
            })
          } else if (payload.evaluation.score < 50) {
            toast(payload.evaluation.feedback, {
              duration: 5000,
              icon: '⚠️',
              style: {
                background: '#f59e0b',
                color: 'white',
              },
            })
          } else {
            toast.success(payload.evaluation.feedback, { duration: 4000 })
          }
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
          setAiStatusMessage('Phiên luyện nói đã kết thúc.')
          setAiErrorMessage(null)
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
    [aiAudioUrl, appendAudioToConversation, sendNextChunk, socketUrl]
  )

  const detachRecorderStream = () => {
    const recorder = recorderRef.current
    if (!recorder) return
    const stream: MediaStream | undefined = (recorder as any).stream
    stream?.getTracks().forEach((track) => track.stop())
  }

  const startRecording = useCallback(async () => {
    if (!session || !currentTurnId || recordingState === 'recording') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128_000,
      })
      recorderRef.current = recorder
      chunkQueueRef.current = []
      waitingAckRef.current = false
      sequenceRef.current = 0
      durationRef.current = 0
      isStoppingRef.current = false // Reset stopping flag when starting
      setPartialTranscript('')
      setFinalTranscript('')
      setEvaluation(null)
      setSilenceWarnings(0)

      recorder.ondataavailable = async (event) => {
        if (!event.data || !event.data.size) return
        if (isStoppingRef.current) return // Don't send chunks if stopping
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
        const tryEmit = () => {
          if (!emitUserStop()) {
            window.setTimeout(tryEmit, 150)
          }
        }
        tryEmit()
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
  }, [currentTurnId, emitUserStop, recordingState, sendNextChunk, session])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      isStoppingRef.current = true // Set flag to prevent sending more chunks
      try {
        recorder.requestData()
      } catch (error) {
        console.warn('requestData failed before stop', error)
      }
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
      setSelectedConversationId(conversationId ?? null)
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
      setAiStatusMessage('AI đang chuẩn bị câu hỏi mở đầu...')
      setAiErrorMessage(null)
      setConversationMessages([])
      turnPromptRef.current = new Map()
      created.turns.forEach((turn) => {
        if (turn.aiPrompt) {
          turnPromptRef.current.set(turn.id, turn.aiPrompt)
        }
      })

      // Close modal if open
      setIsNewConversationModalOpen(false)

      toast.success('Đã bắt đầu phiên luyện nói với AI')
    } catch (error: any) {
      const status = error?.response?.status
      const message =
        error?.response?.data?.message ?? 'Không thể khởi tạo phiên'

      // ✅ Handle profanity ban (403 Forbidden)
      if (
        (status === 403 && message.includes('cấm')) ||
        message.includes('vi phạm')
      ) {
        toast.error(message, {
          duration: 10000,
          icon: '🚫',
          style: {
            background: '#DC2626',
            color: '#fff',
            fontWeight: 'bold',
          },
        })
      } else {
        toast.error(message)
      }
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
      setAiStatusMessage('Phiên luyện nói đã được tổng kết.')
      setAiErrorMessage(null)
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
    setAiStatusMessage('Chọn một cuộc hội thoại để bắt đầu luyện nói.')
    setAiErrorMessage(null)
  }

  const handleNewConversation = () => {
    setSelectedConversationId(null)
    setIsNewConversationModalOpen(true)
    setAiStatusMessage('Hãy điền thông tin để bắt đầu cuộc hội thoại mới.')
    setAiErrorMessage(null)
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
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dòng hội thoại
                </h2>
                <span className="text-xs text-gray-500">
                  {conversationMessages.length} lượt trao đổi
                </span>
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto space-y-3 pr-1">
                {conversationMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Bắt đầu ghi âm để thêm nội dung vào hội thoại.
                  </p>
                ) : (
                  conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg border p-3 text-sm shadow-sm ${
                        message.role === 'ai'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-emerald-200 bg-emerald-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                        <span
                          className={
                            message.role === 'ai'
                              ? 'text-blue-700'
                              : 'text-emerald-700'
                          }
                        >
                          {message.role === 'ai' ? 'Trợ giảng AI' : 'Bạn'}
                        </span>
                        <span className="text-gray-500">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      {message.audioUrl ? (
                        <audio
                          src={message.audioUrl}
                          controls
                          className="mt-2 w-full"
                        />
                      ) : null}
                      {message.text ? (
                        message.role === 'ai' ? (
                          <TextInteractionWrapper>
                            <p className="mt-2 whitespace-pre-line text-sm text-gray-800">
                              {message.text}
                            </p>
                          </TextInteractionWrapper>
                        ) : (
                          <p className="mt-2 whitespace-pre-line text-sm text-gray-800">
                            {message.text}
                          </p>
                        )
                      ) : null}
                      {!message.audioUrl && !message.text ? (
                        <p className="mt-2 text-sm text-gray-500">
                          Chưa có nội dung hiển thị cho lượt này.
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

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
                    <p className="text-xs text-blue-700">{aiStatusMessage}</p>
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
                    {aiErrorMessage && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                        {aiErrorMessage}
                      </div>
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
                    {partialTranscript ||
                      (recordingState === 'recording'
                        ? '🎤 Đang ghi âm... (hãy nói to và rõ ràng)'
                        : 'Chờ bạn bắt đầu ghi âm')}
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
                <li>Cảnh báo im lặng: {silenceWarnings}</li>
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
