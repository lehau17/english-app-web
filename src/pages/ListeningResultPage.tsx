import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Home, RotateCcw, XCircle } from 'lucide-react'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

interface ResultPageState {
  answers: Record<string, string>
  timeSpent: number
  result: {
    scorePercent: number
    correctCount: number
    totalQuestions: number
    feedback: Array<{
      questionId: string
      isCorrect: boolean
      userAnswer: string
      correctAnswers: string[]
    }>
  }
  podcastData: {
    title: string
    fillBlankContent: {
      sentences: Array<{
        id: string
        sentence: string
        correctAnswers: string[]
      }>
    }
  }
}

export const ListeningResultPage: React.FC = () => {
  const { podcastId } = useParams<{ podcastId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as ResultPageState

  if (!state) {
    navigate(`/listening-practice/${podcastId}`)
    return null
  }

  const { result, timeSpent, podcastData } = state
  const { scorePercent, correctCount, totalQuestions, feedback } = result

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉'
    if (score >= 80) return 'Tốt lắm! 👏'
    if (score >= 70) return 'Khá tốt! 👍'
    if (score >= 60) return 'Cần cố gắng thêm! 💪'
    return 'Hãy luyện tập thêm nhé! 📚'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header with Results */}
          <div className={`${getScoreBgColor(scorePercent)} px-8 py-6`}>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${scorePercent >= 60 ? 'bg-green-500' : 'bg-red-500'} text-white text-2xl font-bold`}
                >
                  {scorePercent >= 60 ? (
                    <CheckCircle size={40} />
                  ) : (
                    <XCircle size={40} />
                  )}
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kết quả bài làm
              </h1>
              <p className="text-lg text-gray-700 mb-4">{podcastData.title}</p>
              <p className="text-lg text-gray-600 mb-4">
                {getScoreMessage(scorePercent)}
              </p>

              <div className="flex items-center justify-center gap-8 text-lg">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(scorePercent)}`}
                  >
                    {scorePercent}%
                  </div>
                  <div className="text-gray-600">Điểm số</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {correctCount}/{totalQuestions}
                  </div>
                  <div className="text-gray-600">Câu đúng</div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-gray-600">Thời gian</div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Results */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Chi tiết câu trả lời
            </h2>

            <div className="space-y-6">
              {feedback.map((item, index) => {
                const sentence = podcastData.fillBlankContent.sentences.find(
                  (s) => s.id === item.questionId
                )

                return (
                  <motion.div
                    key={item.questionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 ${item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${item.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}
                      >
                        {item.isCorrect ? (
                          <CheckCircle size={16} className="text-white" />
                        ) : (
                          <XCircle size={16} className="text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="mb-3">
                          <span className="font-medium text-gray-700">
                            Câu {index + 1}:{' '}
                          </span>
                          <span className="text-gray-600 leading-relaxed">
                            {sentence?.sentence || 'Không tìm thấy câu hỏi'}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">
                              Câu trả lời của bạn:{' '}
                            </span>
                            <span
                              className={
                                item.isCorrect
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {item.userAnswer || '(Không trả lời)'}
                            </span>
                          </div>

                          {!item.isCorrect && (
                            <div>
                              <span className="font-medium">Đáp án đúng: </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.correctAnswers.map((answer, i) => (
                                  <span
                                    key={i}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                                  >
                                    {answer}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gray-50 flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/listening-practice/${podcastId}/test`)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              <RotateCcw size={20} />
              Làm lại
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/listening-practice/${podcastId}`)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              <BookOpen size={20} />
              Về bài học
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/listening-practice')}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              <Home size={20} />
              Trang chủ
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
