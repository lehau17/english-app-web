import { ArrowLeft, BookOpen, Check, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSavedWords } from '../hooks/useVocabulary'
import { dictionaryAPI } from '../services/dictionary.api'

type SavedWord = { word: string; [key: string]: any }

interface QuizQuestion {
  word: string
  correctDefinition: string
  options: string[]
  userAnswer?: string
  isCorrect?: boolean
}

interface QuizResult {
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  details: QuizQuestion[]
}

export default function QuizReviewPage() {
  const navigate = useNavigate()
  const { data: savedWords = [], isLoading } = useSavedWords()
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)

  // Generate quiz questions
  const generateQuiz = async () => {
    const words = savedWords as SavedWord[]
    if (words.length < 4) {
      alert('Bạn cần ít nhất 4 từ để chơi quiz!')
      return
    }

    setIsLoadingQuestions(true)
    setQuizStarted(true)

    try {
      // Shuffle words and take max 10 for quiz
      const shuffled = [...words].sort(() => Math.random() - 0.5)
      const quizWords = shuffled.slice(0, Math.min(10, shuffled.length))

      // Fetch definitions for all words
      const wordDetailsPromises = quizWords.map((w) =>
        dictionaryAPI.lookupWord(w.word)
      )
      const wordDetails = await Promise.all(wordDetailsPromises)

      // Create questions
      const newQuestions: QuizQuestion[] = quizWords.map((savedWord, idx) => {
        const details = wordDetails[idx]
        const correctDefinition =
          details.definitions[0]?.definition || 'No definition available'

        // Get 3 other random definitions as wrong answers
        const otherWords = quizWords.filter((w) => w.word !== savedWord.word)
        const wrongAnswers = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => {
            const wrongDetails = wordDetails.find((d) => d.word === w.word)
            return (
              wrongDetails?.definitions[0]?.definition ||
              'Alternative definition'
            )
          })

        // Shuffle options
        const options = [correctDefinition, ...wrongAnswers].sort(
          () => Math.random() - 0.5
        )

        return {
          word: savedWord.word,
          correctDefinition,
          options,
        }
      })

      setQuestions(newQuestions)
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert('Không thể tạo quiz. Vui lòng thử lại!')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      alert('Vui lòng chọn một đáp án!')
      return
    }

    // Update question with user answer
    const updatedQuestions = [...questions]
    const currentQuestion = updatedQuestions[currentQuestionIndex]
    currentQuestion.userAnswer = selectedAnswer
    currentQuestion.isCorrect =
      selectedAnswer === currentQuestion.correctDefinition

    setQuestions(updatedQuestions)
    setSelectedAnswer('')

    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate results
      const correctCount = updatedQuestions.filter((q) => q.isCorrect).length
      const result: QuizResult = {
        totalQuestions: updatedQuestions.length,
        correctAnswers: correctCount,
        incorrectAnswers: updatedQuestions.length - correctCount,
        score: Math.round((correctCount / updatedQuestions.length) * 100),
        details: updatedQuestions,
      }
      setQuizResult(result)
      setShowResult(true)
    }
  }

  const handleRestart = () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
    setShowResult(false)
    setQuizResult(null)
    setQuizStarted(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  if (savedWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chưa có từ để ôn tập
            </h2>
            <p className="text-gray-600 mb-6">
              Hãy lưu ít nhất 4 từ vựng trước khi bắt đầu quiz!
            </p>
            <button
              onClick={() => navigate('/dictionary')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Đi tới Từ điển
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (savedWords.length < 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Cần thêm từ vựng
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có {savedWords.length} từ. Cần ít nhất 4 từ để chơi quiz!
            </p>
            <button
              onClick={() => navigate('/dictionary')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Lưu thêm từ
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show results page
  if (showResult && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          {/* Score Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
                  quizResult.score >= 80
                    ? 'bg-green-100'
                    : quizResult.score >= 60
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }`}
              >
                <span
                  className={`text-5xl font-bold ${
                    quizResult.score >= 80
                      ? 'text-green-600'
                      : quizResult.score >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {quizResult.score}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {quizResult.score >= 80
                  ? 'Xuất sắc!'
                  : quizResult.score >= 60
                    ? '👍 Khá tốt!'
                    : '💪 Cố gắng lên!'}
              </h2>
              <p className="text-gray-600">
                Bạn đã trả lời đúng {quizResult.correctAnswers}/
                {quizResult.totalQuestions} câu
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  {quizResult.totalQuestions}
                </p>
                <p className="text-sm text-gray-600">Tổng câu</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {quizResult.correctAnswers}
                </p>
                <p className="text-sm text-gray-600">Đúng</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-600">
                  {quizResult.incorrectAnswers}
                </p>
                <p className="text-sm text-gray-600">Sai</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Chơi lại
              </button>
              <button
                onClick={() => navigate('/my-vocabulary')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Về danh sách
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Chi tiết kết quả
            </h3>
            <div className="space-y-4">
              {quizResult.details.map((question, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 ${
                    question.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-700">
                          #{idx + 1}
                        </span>
                        <span className="text-xl font-bold text-gray-900">
                          {question.word}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Đáp án đúng:</strong>{' '}
                        {question.correctDefinition}
                      </p>
                      {!question.isCorrect && (
                        <p className="text-sm text-red-700">
                          <strong>Bạn chọn:</strong> {question.userAnswer}
                        </p>
                      )}
                    </div>
                    <div>
                      {question.isCorrect ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Quiz Từ Vựng
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Kiểm tra kiến thức của bạn với {savedWords.length} từ đã lưu!
            </p>

            <div className="bg-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Quy tắc chơi:</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• Mỗi câu hỏi sẽ cho bạn 1 từ và 4 định nghĩa</li>
                <li>• Chọn định nghĩa đúng cho từ đó</li>
                <li>• Tối đa 10 câu hỏi ngẫu nhiên</li>
                <li>• Kết quả sẽ được hiển thị sau khi hoàn thành</li>
              </ul>
            </div>

            <button
              onClick={generateQuiz}
              disabled={isLoadingQuestions}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingQuestions ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Đang tạo quiz...
                </span>
              ) : (
                'Bắt đầu Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz in progress
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tạo câu hỏi...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/my-vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <button
            onClick={handleRestart}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Bắt đầu lại"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% hoàn thành
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-wide text-gray-500 mb-4">
              Chọn định nghĩa đúng
            </p>
            <h2 className="text-5xl font-bold text-gray-900">
              {currentQuestion.word}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswer === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedAnswer === option
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <p className="text-gray-700 flex-1">{option}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1
              ? 'Xem kết quả'
              : 'Câu tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  )
}
