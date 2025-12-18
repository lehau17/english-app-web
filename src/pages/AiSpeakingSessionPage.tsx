import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Ban,
  BarChart2,
  BookOpen,
  FileText,
  Hand,
  HelpCircle,
  Info,
  Loader2,
  Mic,
  RefreshCw,
  Star,
  StopCircle,
  ThumbsUp,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { AiSpeakingSessionSummaryModal } from '../components/ai-speaking/AiSpeakingSessionSummaryModal'
import { BubbleMessage } from '../components/ai-speaking/BubbleMessage'
import { SuggestionButton } from '../components/ai-speaking/SuggestionButton'
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
  audioUrls?: Record<string, string | null> // Multi-voice audio URLs
  selectedVoice?: string // Currently selected voice for playback
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
  const [aiStatusMessage, setAiStatusMessage] = useState(
    'Đang khởi tạo phiên luyện nói...'
  )
  const [_aiErrorMessage, setAiErrorMessage] = useState<string | null>(null)
  const [partialTranscript, setPartialTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationState | null>(null)
  const [pronunciationFeedback, setPronunciationFeedback] = useState<
    any | null
  >(null)
  const [_silenceWarnings, setSilenceWarnings] = useState(0)
  const [sessionSummary, setSessionSummary] = useState<string | null>(null)
  const [sessionAnalytics, setSessionAnalytics] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

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
            ...(message.audioUrls !== undefined && {
              audioUrls: message.audioUrls,
            }),
            ...(message.selectedVoice !== undefined && {
              selectedVoice: message.selectedVoice,
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

  // Change voice for a specific message
  const changeMessageVoice = useCallback(
    (messageId: string, newVoice: string) => {
      setConversationMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId && msg.audioUrls) {
            const newAudioUrl = msg.audioUrls[newVoice]
            return {
              ...msg,
              selectedVoice: newVoice,
              audioUrl: newAudioUrl ?? msg.audioUrl,
            }
          }
          return msg
        })
      )
    },
    []
  )

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    // Copy suggestion to clipboard for user convenience
    navigator.clipboard.writeText(suggestion)
    toast.success('Đã sao chép gợi ý vào clipboard', { duration: 3000 })
  }, [])

  const appendAudioToConversation = useCallback(
    (params: {
      role: 'ai' | 'user'
      turnId: string
      audioUrl?: string | null
      audioUrls?: Record<string, string | null>
      selectedVoice?: string
      text?: string | null
    }) => {
      const { role, turnId, audioUrl, audioUrls, selectedVoice, text } = params
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

      // Thêm multi-voice support
      if (audioUrls !== undefined) {
        messageUpdate.audioUrls = audioUrls
      }
      if (selectedVoice !== undefined) {
        messageUpdate.selectedVoice = selectedVoice
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
          text: 'Đang trả lời...',
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
            setAiStatusMessage('AI đang gửi âm thanh, vui lòng chờ')
          }
        }
      )

      socket.on(
        'ai-speaking:tts-end',
        (payload: {
          turnId: string
          audioUrl?: string | null
          audioUrls?: Record<string, string | null>
          primaryVoice?: string
          text?: string | null
          multiVoice?: boolean
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

          // Determine selected voice (prioritize primaryVoice or first available)
          const selectedVoice =
            payload.primaryVoice ||
            (payload.audioUrls
              ? Object.keys(payload.audioUrls).find(
                  (k) => payload.audioUrls?.[k]
                )
              : undefined)

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
              audioUrls: payload.audioUrls,
              selectedVoice,
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
              audioUrls: payload.audioUrls,
              selectedVoice,
              text: promptText,
            })
          }
        }
      )

      // Listen for incremental voice updates (secondary voices from fast-track synthesis)
      socket.on(
        'ai-speaking:voice-ready',
        (payload: {
          turnId: string
          voice: string
          audioUrl: string | null
        }) => {
          console.log(`🎙️ Secondary voice ready: ${payload.voice}`)

          // Update conversation message with new voice URL
          const messageId = `ai-${payload.turnId}`

          setConversationMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  audioUrls: {
                    ...(msg.audioUrls || {}),
                    [payload.voice]: payload.audioUrl,
                  },
                }
              }
              return msg
            })
          )
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
              icon: <Ban className="text-white" />,
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
              icon: <AlertTriangle className="text-white" />,
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
              icon: <Ban />,
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
            icon: <VolumeX />,
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
              icon: <Info className="text-white" />,
              style: {
                background: '#3b82f6',
                color: 'white',
              },
            })
          } else if (payload.evaluation.score < 50) {
            toast(payload.evaluation.feedback, {
              duration: 5000,
              icon: <AlertTriangle className="text-white" />,
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
              icon: <Star className="text-yellow-400" />,
              duration: 3000,
            })
          } else if (score >= 60) {
            toast.success(`Phát âm tốt! ${score}/100`, {
              icon: <ThumbsUp className="text-green-500" />,
              duration: 3000,
            })
          } else if (score >= 40) {
            toast(`Phát âm cần cải thiện: ${score}/100`, {
              icon: <BookOpen className="text-white" />,
              duration: 4000,
              style: { background: '#f59e0b', color: 'white' },
            })
          } else {
            toast(`Hãy luyện tập thêm: ${score}/100`, {
              icon: <Award className="text-white" />,
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

        // Update bubble text to Processing
        if (currentTurnId) {
          appendAudioToConversation({
            role: 'user',
            turnId: currentTurnId,
            audioUrl: null,
            text: 'Đang xử lý...',
          })
        }

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
      setIsSummaryModalOpen(true)
      toast.success('Đã tổng kết phiên luyện nói')
      setAiStatusMessage('Phiên luyện nói đã được tổng kết.')
      setAiErrorMessage(null)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Không thể kết thúc phiên'
      toast.error(message)
    }
  }

  const handleViewConversation = (conversationId: string) => {
    navigate(`/ai-speaking/conversations/${conversationId}`)
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
          multiVoice: true, // Enable 5-voice generation for voice selector
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
        setAiStatusMessage('')
        setAiErrorMessage(null)
        setConversationMessages([])
        turnPromptRef.current = new Map()
        created.turns.forEach((turn) => {
          if (turn.aiPrompt) {
            turnPromptRef.current.set(turn.id, turn.aiPrompt)
          }
        })

        // Add initial AI message from session creation (first turn)
        if (initialTurn?.aiPrompt || initialTurn?.aiAudioUrl) {
          const initialMessage: ConversationMessage = {
            id: `ai-${initialTurn.id}`,
            role: 'ai',
            text: initialTurn.aiPrompt ?? null,
            audioUrl: initialTurn.aiAudioUrl ?? null,
            createdAt: initialTurn.createdAt
              ? new Date(initialTurn.createdAt).getTime()
              : Date.now(),
            turnId: initialTurn.id,
          }
          setConversationMessages([initialMessage])
        }

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
            icon: <Ban className="text-white" />,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center animate-bounce text-sky-500">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
          <p className="mt-4 text-lg font-medium text-sky-800">
            Đang chuẩn bị bài học...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-sky-50 overflow-hidden">
      {/* Top Header */}
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-sky-100 bg-white px-6 shadow-sm z-10 transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToConversations}
            className="group flex items-center justify-center rounded-full bg-sky-100 p-2 text-sky-600 hover:bg-sky-200 transition-all"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>{session.topic ?? 'Hội thoại vui vẻ'}</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                {session.targetDifficulty === 'beginner'
                  ? 'Dễ'
                  : session.targetDifficulty === 'advanced'
                    ? 'Khó'
                    : 'Vừa'}
              </span>
            </h1>
            <p className="text-xs text-gray-500">
              Lượt {session.turnCount} / {session.maxTurns}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSidebarOpen ? 'bg-sky-100 text-sky-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            {isSidebarOpen ? 'Ẩn thông tin' : 'Hiện thông tin'}
          </button>
          <button
            onClick={handleFinalizeSession}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Tổng kết
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat Area (Full Screen / Resizable) */}
        <main className="flex flex-1 flex-col overflow-hidden relative transition-all duration-300">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth space-y-6 md:px-8 lg:px-12 bg-sky-50/50">
            {conversationMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
                <div className="mb-4 animate-pulse text-sky-400">
                  <Hand className="h-16 w-16" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Chào bạn!</h3>
                <p className="text-gray-400">
                  Nhấn nút micro để bắt đầu trò chuyện nhé.
                </p>
              </div>
            ) : (
              conversationMessages.map((message) => {
                // Find turn data for user messages to show evaluation
                const turn = session.turns.find((t) => t.id === message.turnId)

                return (
                  <BubbleMessage
                    key={message.id}
                    role={message.role}
                    text={message.text}
                    audioUrl={message.audioUrl}
                    audioUrls={message.audioUrls}
                    selectedVoice={message.selectedVoice}
                    createdAt={message.createdAt}
                    turnId={message.turnId}
                    onVoiceChange={(voice) =>
                      changeMessageVoice(message.id, voice)
                    }
                    sessionTurn={turn}
                  />
                )
              })
            )}
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
          </div>

          {/* Bottom Action Bar */}
          <div className="flex-shrink-0 border-t border-sky-100 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <div className="mx-auto max-w-4xl flex flex-col gap-4">
              {/* Controls Layout - Grid for perfect centering */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                {/* Left: Status Text */}
                <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 pr-2">
                  {recordingState === 'recording' ? (
                    <span className="flex items-center gap-2 text-red-500 font-medium animate-pulse whitespace-nowrap">
                      <div className="h-2 w-2 rounded-full bg-red-500" /> Đang
                      ghi âm...
                    </span>
                  ) : (
                    <span className="truncate">{aiStatusMessage}</span>
                  )}
                </div>

                {/* Center: Recording Button */}
                <div className="flex flex-col items-center justify-center -mt-6">
                  {recordingState !== 'recording' ? (
                    <button
                      onClick={startRecording}
                      disabled={!canRecord}
                      className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:grayscale border-4 border-white"
                    >
                      <Mic className="h-9 w-9 text-white group-hover:animate-pulse" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-xl shadow-red-200 transition-all hover:scale-105 active:scale-95 animate-pulse border-4 border-white"
                    >
                      <StopCircle className="h-9 w-9 text-white" />
                    </button>
                  )}
                  <span className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {recordingState === 'recording' ? 'Dừng lại' : 'Nói ngay'}
                  </span>
                </div>

                {/* Right: Suggestion Button */}
                <div className="flex justify-end pl-2">
                  {canRecord && recordingState === 'idle' && (
                    <SuggestionButton
                      sessionId={session.id}
                      onSelect={handleSuggestionSelect}
                      disabled={!canRecord}
                    />
                  )}
                </div>
              </div>

              {/* Timer text when recording */}
              {recordingState === 'recording' && (
                <div className="text-center">
                  <span
                    className={`text-sm font-bold ${
                      durationRef.current >= 16
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {durationRef.current}s
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    (Tối thiểu 10s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar (Collapsible) */}
        <aside
          className={`flex-shrink-0 border-l border-sky-100 bg-white transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 z-30 md:static ${
            isSidebarOpen
              ? 'w-80 translate-x-0 shadow-xl md:shadow-none'
              : 'w-0 translate-x-full opacity-0 overflow-hidden'
          }`}
        >
          <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Transcript Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                <FileText className="h-4 w-4" /> Phiên âm
              </h3>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 min-h-[100px] text-sm text-gray-700 max-h-60 overflow-y-auto">
                {recordingState === 'recording' ? (
                  <span className="text-gray-400 italic">
                    {partialTranscript || 'Đang nghe...'}
                  </span>
                ) : (
                  finalTranscript || (
                    <span className="text-gray-400 italic">
                      Chưa có kết quả...
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Metrics Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                <BarChart2 className="h-4 w-4" /> Đánh giá gần nhất
              </h3>

              {hasEvaluation ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100 text-center mb-3">
                    <div className="text-3xl font-black text-emerald-600">
                      {evaluation?.score}
                    </div>
                    <div className="text-xs font-bold text-emerald-800 uppercase">
                      Điểm tổng
                    </div>
                  </div>

                  {evaluation?.feedback && (
                    <div className="rounded-xl bg-white border border-gray-100 p-3 text-sm text-gray-600 shadow-sm mb-3">
                      {evaluation.feedback}
                    </div>
                  )}

                  {/* Categories */}
                  {evaluation?.categories && (
                    <div className="mt-2 space-y-2">
                      {evaluation.categories.map((cat, i) => (
                        <div
                          key={i}
                          className="text-xs border-b border-dashed border-gray-200 pb-2 last:border-0"
                        >
                          <span className="font-bold text-gray-700 block">
                            {cat.name}
                          </span>
                          <span className="text-gray-500">{cat.comment}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-1" />
                  <span className="text-xs text-gray-400">
                    Chưa có đánh giá
                  </span>
                </div>
              )}
            </div>

            {/* Pronunciation Section */}
            {pronunciationFeedback && (
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Mic className="h-4 w-4" /> Phát âm
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {pronunciationFeedback.accuracyScore}
                    </div>
                    <div className="text-[10px] uppercase text-blue-800 font-bold">
                      Chính xác
                    </div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2 text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {pronunciationFeedback.fluencyScore}
                    </div>
                    <div className="text-[10px] uppercase text-purple-800 font-bold">
                      Trôi chảy
                    </div>
                  </div>
                </div>
                {pronunciationFeedback.problematicPhonemes?.length > 0 && (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                    <div className="text-xs font-bold text-red-800 mb-1">
                      Cần luyện thêm:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pronunciationFeedback.problematicPhonemes.map(
                        (p: string, i: number) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-white rounded text-xs text-red-600 font-mono shadow-sm"
                          >
                            /{p}/
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Summary Modal */}
      <AiSpeakingSessionSummaryModal
        session={session}
        summary={sessionSummary}
        analytics={sessionAnalytics}
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        onViewConversation={handleViewConversation}
      />
    </div>
  )
}

export default AiSpeakingSessionPage
