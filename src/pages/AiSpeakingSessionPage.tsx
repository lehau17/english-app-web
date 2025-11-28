import {
  ArrowLeft,
  MessageCircle,
  Mic,
  RefreshCw,
  StopCircle,
  User,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import TextInteractionWrapper from '../components/common/TextInteractionWrapper'
import { useAuth } from '../context/AuthContext'
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

const AiSpeakingSessionPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [session, setSession] = useState<AiSpeakingSessionDto | null>(null)
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null)
  const [_currentTurn, setCurrentTurn] = useState<AiSpeakingTurnDto | null>(
    null
  )
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [_ttsState, setTtsState] = useState<TtsState>('idle')
  const [_ttsChunkCount, setTtsChunkCount] = useState(0)
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null)
  const [_aiStatusMessage, setAiStatusMessage] = useState(
    'Đang khởi tạo phiên luyện nói...'
  )
  const [_aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)
  const [partialTranscript, setPartialTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationState | null>(null)
  const [pronunciationFeedback, setPronunciationFeedback] = useState<
    any | null
  >(null)
  const [silenceWarnings, setSilenceWarnings] = useState(0)
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
          // Chỉ update các field được cung cấp (không undefined)
          next[index] = {
            ...next[index],
            ...(message.role !== undefined && { role: message.role }),
            ...(message.turnId !== undefined && { turnId: message.turnId }),
            ...(message.text !== undefined && { text: message.text }),
            ...(message.audioUrl !== undefined && {
              audioUrl: message.audioUrl,
            }),
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

      // Chỉ include các field được cung cấp
      const messageUpdate: Partial<ConversationMessage> & {
        id: string
        role: 'ai' | 'user'
        turnId: string
      } = {
        id,
        role,
        turnId,
        createdAt: Date.now(),
      }

      // Chỉ thêm text nếu có giá trị
      if (text !== undefined) {
        messageUpdate.text = text
      }

      // Chỉ thêm audioUrl nếu có giá trị
      if (audioUrl !== undefined) {
        messageUpdate.audioUrl = audioUrl
      }

      upsertConversationMessage(messageUpdate as ConversationMessage)
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
        console.error('No sessionId provided to connectSocket')
        return
      }

      if (socketRef.current) {
        console.log('Disconnecting existing socket')
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
          'WebSocket connected successfully with sessionId:',
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
        setAiStatusMessage('AI đang trả lời...')
        setAiErrorMessage(null)
        // Thêm loading message cho AI
        appendAudioToConversation({
          role: 'ai',
          turnId: payload.turnId,
          audioUrl: null,
          text: '⏳ Đang trả lời...',
        })
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

          // Ưu tiên lấy text từ payload, nếu không có thì fallback sang turnPromptRef
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

      // Listen for profanity warnings
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

      // Listen for session ended (from profanity ban)
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
          isFinal?: boolean
        }) => {
          console.log('[ASR Partial]', payload)

          // Smart accumulation: check both directions to avoid duplication
          setPartialTranscript((prev) => {
            const newText = payload.text.trim()
            const prevText = prev.trim()

            if (!newText) return prev

            // If texts are identical → no update needed
            if (newText === prevText) {
              return prev
            }

            // If new text starts with previous → backend is accumulating, just update
            if (newText.startsWith(prevText)) {
              return newText
            }

            // If previous contains new text → backend is repeating, ignore
            if (prevText.includes(newText)) {
              return prev
            }

            // If completely different → append with space
            // (This handles when backend sends sentence-by-sentence after punctuation)
            if (prev) {
              return `${prev} ${newText}`
            }

            return newText
          })
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
          // Cập nhật tin nhắn user với transcript thật (thay vì tạo mới)
          const messageId = `user-${payload.turnId}`
          upsertConversationMessage({
            id: messageId,
            role: 'user',
            turnId: payload.turnId,
            text: payload.text,
            createdAt: Date.now(),
          })
          // Hiện loading cho AI ngay sau khi user xong
          setAiStatusMessage('AI đang suy nghĩ và chuẩn bị câu trả lời...')
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
          setPronunciationFeedback(null)
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
            detail?: {
              duration?: number
              suggestedPhrases?: string[]
            }
          }
        }) => {
          console.log('Turn evaluated:', payload)
          setEvaluation({
            score: payload.evaluation.score,
            feedback: payload.evaluation.feedback,
            categories: payload.evaluation.categories ?? [],
          })
          setFinalTranscript(payload.evaluation.transcript ?? '')
          setRecordingState('idle')

          // Show feedback toast
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

      // Listen for pronunciation feedback
      socket.on(
        'ai-speaking:pronunciation-feedback',
        (payload: { turnId: string; pronunciationFeedback: any }) => {
          console.log(
            '🎤 Pronunciation feedback received:',
            payload.pronunciationFeedback
          )
          setPronunciationFeedback(payload.pronunciationFeedback)

          // Show toast with overall score
          const score = payload.pronunciationFeedback.pronunciationScore
          if (score >= 80) {
            toast.success(`Phát âm xuất sắc! ${score}/100`, {
              icon: '🌟',
              duration: 3000,
            })
          } else if (score >= 60) {
            toast.success(`Phát âm tốt! ${score}/100`, {
              icon: '👍',
              duration: 3000,
            })
          } else if (score >= 40) {
            toast(`Phát âm cần cải thiện: ${score}/100`, {
              icon: '📚',
              duration: 4000,
              style: { background: '#f59e0b', color: 'white' },
            })
          } else {
            toast(`Hãy luyện tập thêm: ${score}/100`, {
              icon: '💪',
              duration: 4000,
              style: { background: '#ef4444', color: 'white' },
            })
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
      isStoppingRef.current = false
      setPartialTranscript('')
      setFinalTranscript('')
      setEvaluation(null)
      setSilenceWarnings(0)

      recorder.ondataavailable = async (event) => {
        if (!event.data || !event.data.size) return
        if (isStoppingRef.current) return
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

      // Hiển thị tin nhắn user ngay lập tức khi bắt đầu ghi âm
      appendAudioToConversation({
        role: 'user',
        turnId: currentTurnId,
        audioUrl: null,
        text: 'Đang ghi âm...',
      })
    } catch (error) {
      console.error(error)
      toast.error('Không thể truy cập microphone. Hãy kiểm tra quyền truy cập.')
    }
  }, [
    currentTurnId,
    emitUserStop,
    recordingState,
    sendNextChunk,
    session,
    appendAudioToConversation,
  ])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      isStoppingRef.current = true
      try {
        recorder.requestData()
      } catch (error) {
        console.warn('requestData failed before stop', error)
      }
      recorder.stop()

      // User stopped recording
      // KHÔNG xóa message text ở đây - ASR final event sẽ update transcript sau
    }
  }, [currentTurnId])

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

  const handleBackToConversations = () => {
    navigate('/ai-speaking')
  }

  // Auto-start session on mount if params provided
  useEffect(() => {
    if (!user?.id) {
      toast.error('Bạn cần đăng nhập để luyện nói')
      navigate('/ai-speaking')
      return
    }

    // Chỉ lấy conversationId từ URL nếu nó là UUID hợp lệ (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    // Nếu không phải UUID, để backend tự tạo mới
    const conversationIdParam = searchParams.get('conversationId')
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const conversationId =
      conversationIdParam && uuidRegex.test(conversationIdParam)
        ? conversationIdParam
        : undefined

    const topic = searchParams.get('topic') || ''
    const goal = searchParams.get('goal') || undefined
    const targetDifficulty = searchParams.get('targetDifficulty') || 'medium'
    const maxTurns = parseInt(searchParams.get('maxTurns') || '5', 10)

    if (!topic) {
      toast.error('Thiếu thông tin chủ đề. Vui lòng tạo lại cuộc hội thoại.')
      navigate('/ai-speaking')
      return
    }

    const startSession = async () => {
      try {
        const created = await startAiSpeakingSession({
          conversationId,
          topic,
          goal,
          targetDifficulty,
          maxTurns,
        })

        console.log('Session created successfully:', created)

        setSession(created)

        const initialTurn = [...created.turns].sort(
          (a, b) => a.turnIndex - b.turnIndex
        )[0]
        if (initialTurn) {
          setCurrentTurnId(initialTurn.id)
          setCurrentTurn(initialTurn)
          console.log('Initial turn set:', initialTurn)
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

        toast.success('Đã bắt đầu phiên luyện nói với AI')
      } catch (error: any) {
        const status = error?.response?.status
        const message =
          error?.response?.data?.message ?? 'Không thể khởi tạo phiên'

        // Handle profanity ban (403 Forbidden)
        if (
          status === 403 &&
          (message.includes('cấm') || message.includes('vi phạm'))
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
        navigate('/ai-speaking')
      }
    }

    startSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canRecord = Boolean(session) && Boolean(currentTurnId)
  const hasEvaluation = Boolean(evaluation?.score)

  if (!session) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">
            Đang khởi tạo phiên luyện nói...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToConversations}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Phiên luyện nói
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Chủ đề: {session.topic ?? 'Tự do'} • Lượt {session.turnCount}/
                {session.maxTurns}
              </p>
            </div>
          </div>
        </div>
      </div>

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
            <div className="mt-4 max-h-96 overflow-y-auto space-y-4 rounded-lg bg-gray-50 p-4">
              {conversationMessages.length === 0 ? (
                <p className="text-center text-sm text-gray-500">
                  Bắt đầu ghi âm để thêm nội dung vào hội thoại.
                </p>
              ) : (
                conversationMessages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'ai' ? (
                      /* AI Message - Left side */
                      <div className="flex items-start gap-2">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {message.text && (
                            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 shadow-sm max-w-[85%]">
                              {message.text === '⏳ Đang trả lời...' ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                                    <div
                                      className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                      style={{ animationDelay: '0.1s' }}
                                    />
                                    <div
                                      className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                                      style={{ animationDelay: '0.2s' }}
                                    />
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Đang trả lời...
                                  </p>
                                </div>
                              ) : (
                                <TextInteractionWrapper>
                                  <p className="text-sm text-gray-800 whitespace-pre-line">
                                    {message.text}
                                  </p>
                                </TextInteractionWrapper>
                              )}
                            </div>
                          )}
                          {message.audioUrl && (
                            <div className="flex items-center gap-2 pl-2">
                              <audio
                                controls
                                className="h-8 max-w-xs"
                                src={message.audioUrl}
                                style={{ maxHeight: '32px' }}
                              >
                                <track kind="captions" />
                              </audio>
                            </div>
                          )}
                          <div className="pl-2 text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* User Message - Right side */
                      <div className="flex items-start justify-end gap-2">
                        <div className="flex-1 flex flex-col items-end space-y-1.5">
                          {message.text && (
                            <div className="rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 shadow-sm max-w-[85%]">
                              {message.text === 'Đang ghi âm...' ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                  <p className="text-sm text-white">
                                    Đang ghi âm...
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-white whitespace-pre-line">
                                  {message.text}
                                </p>
                              )}
                            </div>
                          )}
                          {message.audioUrl && (
                            <div className="flex items-center gap-2 pr-2">
                              <audio
                                controls
                                className="h-8 max-w-xs"
                                src={message.audioUrl}
                                style={{ maxHeight: '32px' }}
                              >
                                <track kind="captions" />
                              </audio>
                            </div>
                          )}
                          <div className="pr-2 text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Recording Controls - Moved inside chat box */}
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
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
                <span
                  className={`text-sm font-medium ${
                    durationRef.current >= 16
                      ? 'text-emerald-600'
                      : durationRef.current >= 10
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                  }`}
                >
                  Thời lượng: {durationRef.current}s
                  {durationRef.current >= 16 && ' ✓'}
                  {durationRef.current < 16 &&
                    durationRef.current >= 10 &&
                    ' (cần thêm vài giây)'}
                </span>
                {silenceWarnings > 0 && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                    AI chưa nghe thấy bạn ({silenceWarnings})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                <strong>Quan trọng:</strong> Hãy trả lời tối thiểu{' '}
                <strong>16 giây</strong> để AI có đủ dữ liệu đánh giá chính xác.
              </p>
            </div>
          </div>

          {/* Phiên âm tạm thời & cuối cùng */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-gray-800">
                  Phiên âm tạm thời
                </h3>
                <p className="mt-2 text-sm text-gray-600 min-h-[48px] max-h-[120px] overflow-y-auto whitespace-pre-line">
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
                <p className="mt-2 text-sm text-gray-700 min-h-[48px] max-h-[120px] overflow-y-auto whitespace-pre-line">
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

            {/* Pronunciation Feedback Section */}
            {pronunciationFeedback && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    🎤 Đánh giá phát âm
                  </h3>
                </div>

                {/* Overall Scores */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Tổng điểm</div>
                    <div
                      className={`text-2xl font-bold ${
                        pronunciationFeedback.pronunciationScore >= 80
                          ? 'text-green-600'
                          : pronunciationFeedback.pronunciationScore >= 60
                            ? 'text-blue-600'
                            : pronunciationFeedback.pronunciationScore >= 40
                              ? 'text-yellow-600'
                              : 'text-red-600'
                      }`}
                    >
                      {pronunciationFeedback.pronunciationScore}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Chính xác</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {pronunciationFeedback.accuracyScore}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Trôi chảy</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {pronunciationFeedback.fluencyScore}
                    </div>
                  </div>
                </div>

                {/* Problematic Phonemes */}
                {pronunciationFeedback.problematicPhonemes &&
                  pronunciationFeedback.problematicPhonemes.length > 0 && (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Âm cần luyện tập:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pronunciationFeedback.problematicPhonemes.map(
                          (phoneme: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm font-mono"
                            >
                              /{phoneme}/
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Words Breakdown */}
                {pronunciationFeedback.words &&
                  pronunciationFeedback.words.length > 0 && (
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Chi tiết từng từ:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pronunciationFeedback.words.map(
                          (word: any, idx: number) => (
                            <div
                              key={idx}
                              className={`px-2 py-1 rounded-md text-sm ${
                                word.accuracyScore >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : word.accuracyScore >= 60
                                    ? 'bg-blue-100 text-blue-800'
                                    : word.accuracyScore >= 40
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                              }`}
                              title={`Accuracy: ${word.accuracyScore}`}
                            >
                              {word.word}
                              {word.errorType && word.errorType !== 'None' && (
                                <span className="ml-1 text-xs">⚠️</span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Recommendations */}
                {pronunciationFeedback.recommendations &&
                  pronunciationFeedback.recommendations.length > 0 && (
                    <div className="bg-white rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Gợi ý luyện tập:
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-700">
                        {pronunciationFeedback.recommendations.map(
                          (rec: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Speaking Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="bg-white rounded-lg p-2">
                    Thời lượng: {pronunciationFeedback.durationSec?.toFixed(1)}s
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    Tốc độ: {pronunciationFeedback.wordsPerMinute} từ/phút
                  </div>
                </div>
              </div>
            )}
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
            <h3 className="text-sm font-semibold text-gray-800">Tiến trình</h3>
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
              <h3 className="text-sm font-semibold text-gray-800">Thống kê</h3>
              <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-600">
                {JSON.stringify(sessionAnalytics, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AiSpeakingSessionPage
