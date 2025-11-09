import {
  CheckCircle2,
  Circle,
  Info,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { evaluatePronunciation } from '../../services/evaluation.api'

interface VocabularyPronunciationPracticeProps {
  word: string
  activityId?: string // Optional - only needed if saving to Activity attempts
  onComplete?: () => void
}

export const VocabularyPronunciationPractice: React.FC<
  VocabularyPronunciationPracticeProps
> = ({ word, activityId, onComplete }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [hasRecorded, setHasRecorded] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number
    feedback: string
    transcript?: string
    detail?: any
  } | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingStartTimeRef = useRef<number | null>(null)

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    // Note: recordingStartTimeRef will be cleared in onstop handler
  }, [isRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (recordingStartTimeRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          Date.now() - recordingStartTimeRef.current
        }
        recordingStartTimeRef.current = null

        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        await handleEvaluate(audioBlob)
      }

      mediaRecorder.start()
      recordingStartTimeRef.current = Date.now()
      setIsRecording(true)
      setHasRecorded(true)
      setEvaluationResult(null)
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Không thể truy cập microphone. Vui lòng cho phép quyền.')
    }
  }

  const handleEvaluate = async (audioBlob: Blob) => {
    setIsEvaluating(true)

    try {
      // Basic validation - let backend handle detailed silence detection
      if (audioBlob.size < 1024) {
        // Audio too small, likely empty
        toast.error('Ghi âm không hợp lệ. Vui lòng ghi âm lại.')
        setIsEvaluating(false)
        setHasRecorded(false)
        return
      }

      // Convert audio blob to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1]
          resolve(base64String)
        }
        reader.onerror = reject
        reader.readAsDataURL(audioBlob)
      })

      // Call pronunciation evaluation API
      const response = await evaluatePronunciation({
        ...(activityId && { activityId }), // Only include activityId if provided
        audioBase64: base64Audio,
        mimeType: 'audio/webm',
        phrase: word,
      })

      setEvaluationResult({
        score: response.data.score,
        feedback: response.data.feedback,
        transcript: response.data.transcript,
        detail: response.data.detail,
      })

      // Auto complete if score is good (optional)
      if (response.data.score >= 70 && onComplete) {
        setTimeout(() => {
          onComplete()
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error evaluating pronunciation:', error)
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi đánh giá phát âm'
      )
      setEvaluationResult(null)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleTryAgain = () => {
    setEvaluationResult(null)
    setHasRecorded(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80)
      return <CheckCircle2 size={24} className="text-green-600" />
    if (score >= 60) return <Sparkles size={24} className="text-yellow-600" />
    return <XCircle size={24} className="text-red-600" />
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Xuất sắc!'
    if (score >= 60) return 'Khá tốt!'
    return 'Cần cải thiện'
  }

  return (
    <div className="space-y-4">
      {/* Recording Section */}
      <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Mic size={20} className="text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">
                Luyện phát âm
              </h4>
            </div>
            <p className="text-sm text-gray-600">
              Nhấn nút mic và đọc từ: <strong>{word}</strong>
            </p>
          </div>

          {/* Recording Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isEvaluating}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : isEvaluating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
            } ${isEvaluating ? 'opacity-50' : ''}`}
          >
            {isRecording ? (
              <MicOff size={32} className="text-white" />
            ) : (
              <Mic size={32} className="text-white" />
            )}
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </button>

          <div className="text-center">
            {isRecording && (
              <p className="text-sm text-red-600 font-medium animate-pulse flex items-center justify-center gap-2">
                <Circle size={12} className="fill-red-600 text-red-600" />
                Đang ghi âm... Nhấn lại để dừng
              </p>
            )}
            {isEvaluating && (
              <p className="text-sm text-blue-600 font-medium flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Đang đánh giá phát âm...
              </p>
            )}
            {!isRecording && !isEvaluating && !hasRecorded && (
              <p className="text-sm text-gray-600">
                Nhấn mic để bắt đầu ghi âm
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Result */}
      {evaluationResult && (
        <div
          className={`rounded-xl border-2 p-6 ${getScoreBg(evaluationResult.score)}`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getScoreIcon(evaluationResult.score)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  {getScoreMessage(evaluationResult.score)}
                </h4>
                <div
                  className={`text-3xl font-bold ${getScoreColor(evaluationResult.score)}`}
                >
                  {evaluationResult.score}/100
                </div>
              </div>

              {/* Transcript */}
              {evaluationResult.transcript && (
                <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Bạn đã đọc:</p>
                  <p className="text-sm font-medium text-gray-900">
                    "{evaluationResult.transcript}"
                  </p>
                </div>
              )}

              {/* Feedback */}
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Nhận xét:</p>
                <p className="text-sm text-gray-800">
                  {evaluationResult.feedback}
                </p>
              </div>

              {/* Detailed Feedback */}
              {evaluationResult.detail && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Chi tiết:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {evaluationResult.detail.accuracy !== undefined && (
                      <div>
                        <span className="text-gray-600">Độ chính xác: </span>
                        <span className="font-semibold">
                          {evaluationResult.detail.accuracy}%
                        </span>
                      </div>
                    )}
                    {evaluationResult.detail.fluency !== undefined && (
                      <div>
                        <span className="text-gray-600">Trôi chảy: </span>
                        <span className="font-semibold">
                          {evaluationResult.detail.fluency}%
                        </span>
                      </div>
                    )}
                    {evaluationResult.detail.clarity !== undefined && (
                      <div>
                        <span className="text-gray-600">Rõ ràng: </span>
                        <span className="font-semibold">
                          {evaluationResult.detail.clarity}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Try Again Button */}
              <button
                onClick={handleTryAgain}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
              >
                <RefreshCw size={16} />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!evaluationResult && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-blue-600" />
            <p className="font-medium">Mẹo:</p>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Nói rõ ràng, không quá nhanh hoặc quá chậm</li>
            <li>Giữ khoảng cách 10-15cm với microphone</li>
            <li>Tránh tiếng ồn xung quanh</li>
            <li>Bạn có thể thử nhiều lần để cải thiện</li>
          </ul>
        </div>
      )}
    </div>
  )
}
