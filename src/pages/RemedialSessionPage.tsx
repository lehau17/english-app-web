import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  getRemedialExercises,
  verifySpeech,
  type RemedialExerciseDto,
} from '../services/aiSpeaking.api'
import { ArrowLeft, Mic, RotateCcw, CheckCircle, Volume2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function RemedialSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // State
  const [exercise, setExercise] = useState<RemedialExerciseDto | null>(null)
  const [currentStep, setCurrentStep] = useState<
    'intro' | 'practice' | 'success'
  >('intro')
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{
    passed: boolean
    msg: string
    score: number
  } | null>(null)

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    loadExercise()
  }, [id])

  const loadExercise = async () => {
    try {
      const exercises = await getRemedialExercises()
      // In real app, fetch by ID. Here we find from list or specific endpoint
      const found = exercises.find((e) => e.id === id) || exercises[0] // Fallback for demo
      if (found) {
        setExercise(found)
      } else {
        toast.error('Bài tập không tìm thấy')
        navigate('/ai-speaking')
      }
    } catch (err) {
      console.error(err)
      toast.error('Lỗi khi tải bài tập')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        setIsProcessing(true)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = [] // Reset

        // Verify
        if (exercise) {
          const targetText =
            exercise.content.sentences[currentSentenceIndex].text
          try {
            const result = await verifySpeech(blob, targetText)
            setFeedback({
              passed: result.passed,
              msg: result.feedback,
              score: result.score,
            })

            if (result.passed) {
              toast.success('Tuyệt vời!')
              // Auto advance after short delay
              setTimeout(() => {
                nextSentence()
              }, 1500)
            } else {
              toast.error('Hãy thử lại, chú ý phát âm rõ ràng hơn.')
            }
          } catch (e) {
            toast.error('Lỗi kiểm tra')
          } finally {
            setIsProcessing(false)
          }
        }
      }

      recorder.start()
      setIsRecording(true)
      mediaRecorderRef.current = recorder
    } catch (err) {
      toast.error('Không thể truy cập microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
    }
  }

  const nextSentence = () => {
    if (!exercise) return
    if (currentSentenceIndex < exercise.content.sentences.length - 1) {
      setCurrentSentenceIndex((prev) => prev + 1)
      setFeedback(null)
    } else {
      setCurrentStep('success')
    }
  }

  if (!exercise)
    return <div className="p-8 text-center">Đang tải bài tập ôn luyện...</div>

  // --- REVIEW SCREEN ---
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
          </button>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Ôn tập phát âm
          </h1>
          <p className="text-slate-600 mb-8 max-w-lg">
            Chúng tôi nhận thấy bạn gặp khó khăn với các âm{' '}
            <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded mx-1">
              {exercise.content.focus_phonemes.join(', ')}
            </span>
            . Hãy cùng sửa lại với bài tập nhanh này nhé!
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-amber-900 mb-3">
              Các từ cần cải thiện:
            </h3>
            <div className="flex flex-wrap gap-2">
              {exercise.content.sentences.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white border border-amber-200 text-amber-800 rounded-full text-sm font-medium shadow-sm"
                >
                  {s.targetWord}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('practice')}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            Bắt đầu ngay <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    )
  }

  // --- PRACTICE SCREEN ---
  if (currentStep === 'practice') {
    const currentSentence = exercise.content.sentences[currentSentenceIndex]
    const percent =
      (currentSentenceIndex / exercise.content.sentences.length) * 100

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center relative overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl p-6 z-10">
          {/* Sentence Card */}
          <div className="bg-white border border-slate-200 p-10 rounded-3xl w-full text-center mb-8 shadow-xl relative">
            <div className="absolute top-4 right-4 text-slate-400 text-sm font-medium">
              {currentSentenceIndex + 1} / {exercise.content.sentences.length}
            </div>

            <p className="text-sm text-indigo-600 font-bold tracking-wider mb-4 uppercase">
              Luyện đọc câu sau
            </p>
            <h2 className="text-3xl md:text-4xl font-medium leading-relaxed mb-6 text-slate-900">
              "{currentSentence.text}"
            </h2>

            <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg text-slate-600 text-sm border border-slate-200">
              <span className="text-indigo-600 font-bold">Lưu ý:</span>{' '}
              {currentSentence.explanation}
            </div>
          </div>

          {/* Feedback Area */}
          <div className="h-16 mb-6 flex items-center justify-center">
            {feedback && (
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-sm border ${feedback.passed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
              >
                {feedback.passed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <RotateCcw className="w-5 h-5" />
                )}
                <span className="font-medium text-lg">
                  {feedback.msg} ({Math.round(feedback.score)}%)
                </span>
              </div>
            )}
            {isProcessing && (
              <div className="text-indigo-600 animate-pulse font-medium">
                Đang phân tích phát âm...
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-20">
            {/* TTS Button (Mockup) */}
            <button
              className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 transition shadow-sm"
              onClick={() => toast('Tính năng đọc mẫu đang cập nhật')}
            >
              <Volume2 className="w-6 h-6" />
            </button>

            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-xl ${
                isRecording
                  ? 'bg-red-500 animate-pulse ring-4 ring-red-500/30 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100 text-white'
              } `}
            >
              {isRecording ? (
                <div className="w-8 h-8 bg-white rounded-sm" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>

            {/* Skip Button */}
            <button
              className="p-4 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition shadow-sm"
              onClick={nextSentence}
            >
              <span className="font-bold text-sm">BỎ QUA</span>
            </button>
          </div>

          <div className="mt-8 text-slate-400 text-sm">
            {isRecording ? 'Đang nghe...' : 'Nhấn mic để nói'}
          </div>
        </div>
      </div>
    )
  }

  // --- SUCCESS SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          Hoàn thành ôn tập!
        </h2>
        <p className="text-slate-600 mb-8 text-lg">
          Bạn đã hoàn thành bài luyện tập. Khả năng phát âm của bạn đang tiến bộ
          từng ngày!
        </p>
        <button
          onClick={() => navigate('/ai-speaking')}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Quay về màn hình chính
        </button>
      </div>
    </div>
  )
}
