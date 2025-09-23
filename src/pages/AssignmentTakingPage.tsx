import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Link,
  Mic,
  PenTool,
  Trophy,
  Volume2,
} from 'lucide-react'
import { useEffect, useState, type JSX } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAssignmentForTaking,
  getMySubmissionResult,
  submitAssignment,
} from '../services/assignment.api'

// API interfaces based on backend models
interface Assignment {
  id: string
  title: string
  description?: string
  instructions?: string
  dueDate?: string
  totalPoints: number
  timeLimit?: number // in minutes
  maxAttempts: number
  assignmentActivities: Activity[]
}

interface Activity {
  id: string
  type:
    | 'quiz'
    | 'fill_blank'
    | 'matching'
    | 'listening'
    | 'reading'
    | 'writing'
    | 'speaking'
    | 'pronunciation'
    | 'dictation'
    | 'vocab'
    | 'grammar'
    | 'flashcard'
    | 'conversation'
    | 'mini_game'
  title: string
  instructions?: string
  points: number
  content: any
}

export default function AssignmentTakingPage(): JSX.Element {
  const navigate = useNavigate()
  const { classroomId, assignmentId } = useParams<{
    classroomId: string
    assignmentId: string
  }>()

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load assignment data from API
  useEffect(() => {
    const loadAssignment = async () => {
      if (!assignmentId) {
        toast.error('Assignment ID không hợp lệ')
        navigate(`/classroom-detail/${classroomId}`)
        return
      }

      try {
        setIsLoading(true)

        // Check if student has already submitted this assignment
        try {
          const submissionResponse = await getMySubmissionResult(assignmentId)
          if (submissionResponse && submissionResponse.data) {
            // Student has already submitted, redirect to result page
            toast.success(
              'Bạn đã nộp bài tập này rồi. Đang chuyển đến trang kết quả...'
            )
            navigate(
              `/classroom/${classroomId}/assignment/${assignmentId}/result`
            )
            return
          }
        } catch (error: any) {
          // If 404, means no submission yet - continue to load assignment
          if (error.response?.status === 404) {
            console.log(
              'No submission found, allowing student to take assignment'
            )
          } else {
            console.error('Error checking submission:', error)
            // Don't block assignment taking for other errors
          }
        }

        const response = await getAssignmentForTaking(assignmentId)
        const assignmentData = response.data

        // Validate response data
        if (!assignmentData) {
          toast.error('Không thể tải dữ liệu bài tập')
          navigate(`/classroom-detail/${classroomId}`)
          return
        }

        // Additional validation: check if assignment is still available
        if (!assignmentData.isPublished) {
          toast.error('Bài tập này chưa được công bố')
          navigate(`/classroom-detail/${classroomId}`)
          return
        }

        // Check due date
        if (
          assignmentData.dueDate &&
          new Date() > new Date(assignmentData.dueDate)
        ) {
          toast.error('Bài tập này đã hết hạn nộp')
          navigate(`/classroom-detail/${classroomId}`)
          return
        }

        // Validate that assignment has activities
        if (
          !assignmentData.assignmentActivities ||
          assignmentData.assignmentActivities.length === 0
        ) {
          toast.error('Bài tập này không có câu hỏi nào')
          navigate(`/classroom-detail/${classroomId}`)
          return
        }

        setAssignment(assignmentData)

        // Set timer if assignment has time limit
        if (assignmentData.timeLimit) {
          setTimeLeft(assignmentData.timeLimit * 60) // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Error loading assignment:', error)
        toast.error('Không thể tải bài tập')
        navigate(`/classroom-detail/${classroomId}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssignment()
  }, [assignmentId, classroomId, navigate])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit() // Auto submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft]) // Remove handleSubmit from dependencies to avoid recreating timer

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (activityId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [activityId]: answer,
    }))
  }

  const handleNext = () => {
    if (
      assignment &&
      currentActivityIndex < assignment.assignmentActivities.length - 1
    ) {
      setCurrentActivityIndex(currentActivityIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentActivityIndex > 0) {
      setCurrentActivityIndex(currentActivityIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!assignment || !assignmentId) return

    setIsSubmitting(true)
    try {
      const submissionData = {
        answers,
        timeSpent: assignment.timeLimit
          ? assignment.timeLimit * 60 - (timeLeft || 0)
          : undefined,
        notes: '',
      }

      await submitAssignment(assignmentId, submissionData)

      toast.success('Nộp bài thành công!')
      navigate(`/classroom/${classroomId}/assignment/${assignmentId}/result`)
    } catch (error: any) {
      console.error('Error submitting assignment:', error)
      const errorMessage =
        error.response?.data?.message || 'Có lỗi khi nộp bài. Vui lòng thử lại.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderActivity = (activity: Activity) => {
    const answer = answers[activity.id]

    switch (activity.type) {
      case 'quiz':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {activity.content.question}
            </h3>
            <div className="space-y-2">
              {activity.content.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={activity.id}
                    value={index}
                    checked={answer === index}
                    onChange={(e) =>
                      handleAnswerChange(activity.id, parseInt(e.target.value))
                    }
                    className="text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Điền vào chỗ trống</h3>
            {activity.content.passage ? (
              // New format with passage and multiple blanks
              <div className="text-gray-700 leading-relaxed">
                {activity.content.passage
                  .split('___')
                  .map((part: string, index: number, array: string[]) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <input
                          type="text"
                          value={answer?.[index] || ''}
                          onChange={(e) => {
                            const newAnswers = [...(answer || [])]
                            newAnswers[index] = e.target.value
                            handleAnswerChange(activity.id, newAnswers)
                          }}
                          className="mx-2 px-2 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 min-w-[100px] bg-blue-50"
                          placeholder={`Blank ${index + 1}`}
                        />
                      )}
                    </span>
                  ))}
              </div>
            ) : (
              // Legacy format with single sentence
              <p className="text-gray-700">
                {activity.content.sentence
                  .split('_____')
                  .map((part: string, index: number, array: string[]) => (
                    <span key={index}>
                      {part}
                      {index < array.length - 1 && (
                        <input
                          type="text"
                          value={answer || ''}
                          onChange={(e) =>
                            handleAnswerChange(activity.id, e.target.value)
                          }
                          className="mx-2 px-2 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 min-w-[100px]"
                          placeholder="..."
                        />
                      )}
                    </span>
                  ))}
              </p>
            )}
          </div>
        )

      case 'matching':
        const matches = answer || {}
        const leftItems = activity.content.pairs.map((pair: any) => pair.left)
        const rightItems = activity.content.pairs.map((pair: any) => pair.right)

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              Nối các cặp phù hợp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Cột A</h4>
                {leftItems.map((item: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <span className="font-medium text-blue-800">
                      {index + 1}. {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Cột B</h4>
                {leftItems.map((leftItem: string, leftIndex: number) => (
                  <div key={leftIndex} className="flex items-center gap-2">
                    <span className="font-medium text-blue-800">
                      {leftIndex + 1}.
                    </span>
                    <select
                      value={matches[leftItem] || ''}
                      onChange={(e) => {
                        const newMatches = { ...matches }
                        if (e.target.value) {
                          newMatches[leftItem] = e.target.value
                        } else {
                          delete newMatches[leftItem]
                        }
                        handleAnswerChange(activity.id, newMatches)
                      }}
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Chọn đáp án --</option>
                      {rightItems.map(
                        (rightItem: string, rightIndex: number) => (
                          <option key={rightIndex} value={rightItem}>
                            {String.fromCharCode(65 + rightIndex)}. {rightItem}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'listening':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-green-600" />
              Nghe và trả lời
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <audio controls className="w-full mb-3">
                <source src={activity.content.audioUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
              <p className="text-green-800 font-medium">
                {activity.content.prompt}
              </p>
            </div>
            <div className="space-y-2">
              {activity.content.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={activity.id}
                    value={index}
                    checked={answer === index}
                    onChange={(e) =>
                      handleAnswerChange(activity.id, parseInt(e.target.value))
                    }
                    className="text-green-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'reading':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              Đọc hiểu
            </h3>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="prose prose-sm max-w-none">
                {activity.content.passage
                  .split('\n')
                  .map((paragraph: string, index: number) => (
                    <p
                      key={index}
                      className="mb-3 text-purple-900 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">
                {activity.content.question}
              </h4>
              <div className="space-y-2">
                {activity.content.options.map(
                  (option: string, index: number) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={activity.id}
                        value={index}
                        checked={answer === index}
                        onChange={(e) =>
                          handleAnswerChange(
                            activity.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="text-purple-600"
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        )

      case 'writing':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PenTool className="h-5 w-5 text-indigo-600" />
              Viết luận
            </h3>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-indigo-800 font-medium">
                {activity.content.prompt}
              </p>
              <p className="text-indigo-600 text-sm mt-2">
                Yêu cầu tối thiểu: {activity.content.minWords} từ
              </p>
            </div>
            <div>
              <textarea
                value={answer || ''}
                onChange={(e) =>
                  handleAnswerChange(activity.id, e.target.value)
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
                rows={8}
                placeholder="Nhập bài viết của bạn ở đây..."
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>
                  Số từ: {answer ? answer.trim().split(/\s+/).length : 0}
                </span>
                <span>Tối thiểu: {activity.content.minWords} từ</span>
              </div>
            </div>
          </div>
        )

      case 'speaking':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5 text-red-600" />
              Nói
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-3">
                {activity.content.prompt}
              </p>
              <p className="text-red-600 text-sm">
                Thời gian tối thiểu: {activity.content.minSeconds} giây
              </p>
              {activity.content.tips && activity.content.tips.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-700 mb-1">Gợi ý:</h5>
                  <ul className="list-disc list-inside text-red-600 text-sm space-y-1">
                    {activity.content.tips.map((tip: string, index: number) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Mic className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-3">
                Chức năng ghi âm sẽ được bổ sung trong phiên bản sau
              </p>
              <textarea
                value={answer || ''}
                onChange={(e) =>
                  handleAnswerChange(activity.id, e.target.value)
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-red-500"
                rows={3}
                placeholder="Tạm thời bạn có thể ghi chú ý tưởng của mình ở đây..."
              />
            </div>
          </div>
        )

      case 'pronunciation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-orange-600" />
              Phát âm
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-medium text-lg mb-3">
                Phát âm:{' '}
                <span className="font-bold">{activity.content.phrase}</span>
              </p>
              {activity.content.sampleUrl && (
                <div className="mb-3">
                  <p className="text-orange-700 text-sm mb-2">Nghe mẫu:</p>
                  <audio controls className="w-full">
                    <source
                      src={activity.content.sampleUrl}
                      type="audio/mpeg"
                    />
                  </audio>
                </div>
              )}
              {activity.content.tips && activity.content.tips.length > 0 && (
                <div>
                  <h5 className="font-medium text-orange-700 mb-1">
                    Mẹo phát âm:
                  </h5>
                  <ul className="list-disc list-inside text-orange-600 text-sm space-y-1">
                    {activity.content.tips.map((tip: string, index: number) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Mic className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-3">
                Chức năng ghi âm phát âm sẽ được bổ sung trong phiên bản sau
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => handleAnswerChange(activity.id, 'attempted')}
                  className={`px-4 py-2 rounded-lg ${
                    answer === 'attempted'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                  }`}
                >
                  {answer === 'attempted'
                    ? 'Đã thực hành'
                    : 'Đánh dấu đã thực hành'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'dictation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-teal-600" />
              Chính tả
            </h3>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-teal-800 font-medium mb-3">
                Nghe và viết lại những gì bạn nghe được
              </p>
              <audio controls className="w-full mb-3">
                <source src={activity.content.audioUrl} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
              <p className="text-teal-600 text-sm">
                Tối thiểu: {activity.content.minWords} từ
              </p>
            </div>
            <div>
              <textarea
                value={answer || ''}
                onChange={(e) =>
                  handleAnswerChange(activity.id, e.target.value)
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-teal-500"
                rows={4}
                placeholder="Viết những gì bạn nghe được..."
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>
                  Số từ:{' '}
                  {answer
                    ? answer.trim().split(/\s+/).filter(Boolean).length
                    : 0}
                </span>
                <span>Tối thiểu: {activity.content.minWords} từ</span>
              </div>
            </div>
          </div>
        )

      case 'vocab':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-600" />
              Từ vựng
            </h3>
            <div className="space-y-4">
              {activity.content.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-cyan-50 border border-cyan-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-cyan-800 text-lg">
                      {item.word}
                    </h4>
                    {item.audioUrl && (
                      <audio controls className="w-32">
                        <source src={item.audioUrl} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                  <p className="text-cyan-700 mb-2">{item.definition}</p>
                  {item.examples && item.examples.length > 0 && (
                    <div className="text-cyan-600 text-sm">
                      <p className="font-medium mb-1">Ví dụ:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {item.examples.map(
                          (example: string, exIndex: number) => (
                            <li key={exIndex}>{example}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.word}
                      className="mt-2 max-w-32 h-auto rounded"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => handleAnswerChange(activity.id, 'studied')}
                className={`px-6 py-2 rounded-lg ${
                  answer === 'studied'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-cyan-100'
                }`}
              >
                {answer === 'studied' ? 'Đã học xong' : 'Đánh dấu đã học'}
              </button>
            </div>
          </div>
        )

      case 'grammar':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Ngữ pháp
            </h3>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2">
                Quy tắc ngữ pháp:
              </h4>
              <p className="text-emerald-700">{activity.content.rule}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                {activity.content.question}
              </h4>
              <div className="space-y-2">
                {activity.content.options.map(
                  (option: string, index: number) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={activity.id}
                        value={index}
                        checked={answer === index}
                        onChange={(e) =>
                          handleAnswerChange(
                            activity.id,
                            parseInt(e.target.value)
                          )
                        }
                        className="text-emerald-600"
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        )

      case 'flashcard':
        const currentCardIndex = answer?.currentIndex || 0
        const studiedCards = answer?.studied || []
        const cards = activity.content.cards
        const currentCard = cards[currentCardIndex]
        const showBack = answer?.showBack || false

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-pink-600" />
              Thẻ từ vựng
            </h3>
            <div className="text-center text-gray-600 mb-4">
              Thẻ {currentCardIndex + 1} / {cards.length}
            </div>
            <div className="max-w-md mx-auto">
              <div
                className="bg-white border-2 border-pink-200 rounded-xl p-6 min-h-[200px] flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  const newAnswer = { ...answer, showBack: !showBack }
                  handleAnswerChange(activity.id, newAnswer)
                }}
              >
                {currentCard && (
                  <>
                    <div className="text-center">
                      {!showBack ? (
                        <>
                          <p className="text-2xl font-bold text-pink-800 mb-2">
                            {currentCard.front}
                          </p>
                          <p className="text-pink-600 text-sm">
                            Nhấn để xem nghĩa
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl text-pink-700 mb-2">
                            {currentCard.back}
                          </p>
                          <p className="text-pink-600 text-sm">
                            Nhấn để quay lại
                          </p>
                        </>
                      )}
                    </div>
                    {currentCard.imageUrl && (
                      <img
                        src={currentCard.imageUrl}
                        alt="Card visual"
                        className="mt-3 max-w-24 h-auto rounded"
                      />
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    if (currentCardIndex > 0) {
                      const newAnswer = {
                        ...answer,
                        currentIndex: currentCardIndex - 1,
                        showBack: false,
                      }
                      handleAnswerChange(activity.id, newAnswer)
                    }
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => {
                    const newStudied = studiedCards.includes(currentCardIndex)
                      ? studiedCards
                      : [...studiedCards, currentCardIndex]
                    const newAnswer = {
                      ...answer,
                      studied: newStudied,
                    }
                    handleAnswerChange(activity.id, newAnswer)
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    studiedCards.includes(currentCardIndex)
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-100 text-pink-600'
                  }`}
                >
                  {studiedCards.includes(currentCardIndex)
                    ? 'Đã học'
                    : 'Đánh dấu'}
                </button>
                <button
                  onClick={() => {
                    if (currentCardIndex < cards.length - 1) {
                      const newAnswer = {
                        ...answer,
                        currentIndex: currentCardIndex + 1,
                        showBack: false,
                      }
                      handleAnswerChange(activity.id, newAnswer)
                    }
                  }}
                  disabled={currentCardIndex === cards.length - 1}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="text-center text-gray-500 text-sm mt-2">
                Đã học: {studiedCards.length} / {cards.length} thẻ
              </div>
            </div>
          </div>
        )

      case 'conversation':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5 text-violet-600" />
              Hội thoại
            </h3>
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <h4 className="font-medium text-violet-800 mb-2">Tình huống:</h4>
              <p className="text-violet-700">{activity.content.scenario}</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Cuộc hội thoại mẫu:</h4>
              {activity.content.initialDialog.map(
                (message: any, index: number) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                )
              )}
            </div>
            {activity.content.suggestions &&
              activity.content.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Gợi ý câu trả lời:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.content.suggestions.map(
                      (suggestion: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                        >
                          {suggestion}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            <div>
              <textarea
                value={answer || ''}
                onChange={(e) =>
                  handleAnswerChange(activity.id, e.target.value)
                }
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-violet-500"
                rows={3}
                placeholder="Viết phản hồi của bạn cho tình huống này..."
              />
            </div>
          </div>
        )

      case 'mini_game':
        const gameAnswer = answer || { completed: false, score: 0 }

        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Mini Game
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium mb-2">
                Mục tiêu: {activity.content.target}
              </p>
              <p className="text-yellow-600 text-sm">
                Số vòng chơi: {activity.content.rounds}
              </p>
            </div>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-3">
                Mini game sẽ được phát triển trong phiên bản sau
              </p>
              <p className="text-gray-500 text-sm mb-3">
                Từ vựng: {activity.content.pool.join(', ')}
              </p>
              <button
                onClick={() =>
                  handleAnswerChange(activity.id, {
                    completed: true,
                    score: 100,
                  })
                }
                className={`px-6 py-2 rounded-lg ${
                  gameAnswer.completed
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                }`}
              >
                {gameAnswer.completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Loại câu hỏi này chưa được hỗ trợ</p>
            <p className="text-gray-400 text-sm mt-1">Type: {activity.type}</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy bài tập
          </h2>
          <p className="text-gray-600 mb-4">
            Bài tập có thể đã bị xóa hoặc bạn không có quyền truy cập
          </p>
          <button
            onClick={() => navigate(`/classroom-detail/${classroomId}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Quay lại lớp học
          </button>
        </div>
      </div>
    )
  }

  const currentActivity = assignment.assignmentActivities[currentActivityIndex]
  const isLastActivity =
    currentActivityIndex === assignment.assignmentActivities.length - 1
  const currentAnswer = answers[currentActivity.id]

  // Enhanced answer validation for different activity types
  const isCurrentAnswered = (() => {
    if (currentAnswer === undefined || currentAnswer === null) return false

    switch (currentActivity.type) {
      case 'quiz':
      case 'listening':
      case 'reading':
      case 'grammar':
        return typeof currentAnswer === 'number'

      case 'fill_blank':
        if (Array.isArray(currentAnswer)) {
          return currentAnswer.some((answer) => answer && answer.trim() !== '')
        }
        return currentAnswer && currentAnswer.trim() !== ''

      case 'matching':
        return (
          typeof currentAnswer === 'object' &&
          Object.keys(currentAnswer).length > 0
        )

      case 'writing':
      case 'dictation':
      case 'conversation':
        return typeof currentAnswer === 'string' && currentAnswer.trim() !== ''

      case 'speaking':
      case 'pronunciation':
        return currentAnswer === 'attempted'

      case 'vocab':
        return currentAnswer === 'studied'

      case 'flashcard':
        return (
          typeof currentAnswer === 'object' &&
          currentAnswer.studied &&
          currentAnswer.studied.length > 0
        )

      case 'mini_game':
        return typeof currentAnswer === 'object' && currentAnswer.completed

      default:
        return currentAnswer !== '' && currentAnswer !== null
    }
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/classroom-detail/${classroomId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {assignment.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Câu {currentActivityIndex + 1} /{' '}
                  {assignment.assignmentActivities.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    timeLeft <= 300
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="h-4 w-4" />
                <span>{assignment.totalPoints} điểm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 h-2">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{
            width: `${((currentActivityIndex + 1) / assignment.assignmentActivities.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Activity Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentActivity.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="h-4 w-4" />
                <span>{currentActivity.points} điểm</span>
              </div>
            </div>

            {currentActivity.instructions && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-800">{currentActivity.instructions}</p>
              </div>
            )}
          </div>

          {/* Activity Content */}
          <div className="mb-8">{renderActivity(currentActivity)}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentActivityIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Câu trước
            </button>

            <div className="flex items-center gap-2">
              {isCurrentAnswered && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className="text-sm text-gray-600">
                {isCurrentAnswered ? 'Đã trả lời' : 'Chưa trả lời'}
              </span>
            </div>

            <div className="flex gap-3">
              {!isLastActivity ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Câu tiếp
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  Nộp bài
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Activity Navigator */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex gap-2">
          {assignment.assignmentActivities.map((activity, index: number) => {
            const activityAnswer = answers[activity.id]
            const isAnswered = (() => {
              if (activityAnswer === undefined || activityAnswer === null)
                return false

              switch (activity.type) {
                case 'quiz':
                case 'listening':
                case 'reading':
                case 'grammar':
                  return typeof activityAnswer === 'number'

                case 'fill_blank':
                  if (Array.isArray(activityAnswer)) {
                    return activityAnswer.some(
                      (answer) => answer && answer.trim() !== ''
                    )
                  }
                  return activityAnswer && activityAnswer.trim() !== ''

                case 'matching':
                  return (
                    typeof activityAnswer === 'object' &&
                    Object.keys(activityAnswer).length > 0
                  )

                case 'writing':
                case 'dictation':
                case 'conversation':
                  return (
                    typeof activityAnswer === 'string' &&
                    activityAnswer.trim() !== ''
                  )

                case 'speaking':
                case 'pronunciation':
                  return activityAnswer === 'attempted'

                case 'vocab':
                  return activityAnswer === 'studied'

                case 'flashcard':
                  return (
                    typeof activityAnswer === 'object' &&
                    activityAnswer.studied &&
                    activityAnswer.studied.length > 0
                  )

                case 'mini_game':
                  return (
                    typeof activityAnswer === 'object' &&
                    activityAnswer.completed
                  )

                default:
                  return activityAnswer !== '' && activityAnswer !== null
              }
            })()

            const isCurrent = index === currentActivityIndex

            return (
              <button
                key={index}
                onClick={() => setCurrentActivityIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isAnswered
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {Object.keys(answers).length}/{assignment.assignmentActivities.length}{' '}
          câu
        </p>
      </div>
    </div>
  )
}
