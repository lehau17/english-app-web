import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListeningPracticeComponent } from '../components/listening/ListeningPracticeComponent'
import {
  usePodcastTest,
  useSubmitPodcastTest,
} from '../hooks/podcast-test.hooks'

export const ListeningActivityPage: React.FC = () => {
  const { podcastId } = useParams<{ podcastId: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  // Fetch podcast test data
  const {
    data: podcastTestData,
    isLoading,
    error: fetchError,
  } = usePodcastTest(podcastId!)

  // Submit test mutation
  const submitTestMutation = useSubmitPodcastTest(podcastId!)

  const handleSubmit = async (
    answers: Record<string, string>,
    timeSpent: number
  ) => {
    try {
      const result = await submitTestMutation.mutateAsync({
        answers,
        timeSpent,
      })

      // Show results
      navigate(`/listening-practice/${podcastId}/test/result`, {
        state: {
          answers,
          timeSpent,
          result,
          podcastData: podcastTestData,
        },
      })
    } catch (error) {
      console.error('Failed to submit attempt:', error)
      setError('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.')
    }
  }

  const handleExit = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn thoát? Tiến trình sẽ không được lưu.'
      )
    ) {
      navigate(`/listening-practice/${podcastId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải bài tập...</p>
        </div>
      </div>
    )
  }

  if (fetchError || !podcastTestData || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Không thể tải bài tập'}
          </p>
          <button
            onClick={() => navigate(`/listening-practice/${podcastId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  // Convert API data to component format
  const questions =
    podcastTestData.fillBlankContent?.sentences.map((sentence) => ({
      id: sentence.id,
      sentence: sentence.sentence,
      correctAnswers: sentence.correctAnswers,
    })) || []

  return (
    <ListeningPracticeComponent
      podcastId={podcastId!}
      title={podcastTestData.title}
      audioUrl={podcastTestData.audioUrl}
      questions={questions}
      timeLimit={podcastTestData.fillBlankContent?.timeLimit || 300}
      onSubmit={handleSubmit}
      onExit={handleExit}
    />
  )
}
