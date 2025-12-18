import { Mic, Play, Clock, Target, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCurrentProgress, useDueWords } from '../hooks/useSpeakingPractice'
import {
  LevelSelector,
  ProgressDashboard,
  DueWordsReview,
} from '../components/speaking-practice'
import type { DueWord } from '../types/speaking-practice.types'

const SpeakingPracticePage: React.FC = () => {
  const navigate = useNavigate()

  const { data: progress, isLoading: progressLoading } = useCurrentProgress()
  const { data: dueWordsData, isLoading: dueWordsLoading } = useDueWords({
    limit: 10,
  })

  const handleStartPractice = (level?: number) => {
    const params = new URLSearchParams()
    if (level) params.set('level', String(level))
    navigate(`/speaking-practice/session?${params.toString()}`)
  }

  const handleSelectLevel = (level: number) => {
    handleStartPractice(level)
  }

  const handleSelectDueWord = (word: DueWord) => {
    const params = new URLSearchParams()
    params.set('wordId', word.id)
    params.set('level', '1') // Words level
    navigate(`/speaking-practice/session?${params.toString()}`)
  }

  if (progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Dang tai...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Luyen phat am</h1>
        <p className="text-gray-600 mt-2">5 cap do tu don gian den nang cao</p>
      </div>

      {/* Progress Dashboard */}
      {progress && <ProgressDashboard progress={progress} />}

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Bat dau luyen tap</h2>
            <p className="text-emerald-100">
              {progress
                ? `Tiep tuc cap do ${progress.currentLevel}: ${progress.currentLevelName}`
                : 'Bat dau tu cap do 1: Tu don'}
            </p>
          </div>
          <button
            onClick={() => handleStartPractice(progress?.currentLevel)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
          >
            <Play className="h-5 w-5" />
            Bat dau
          </button>
        </div>
      </div>

      {/* Level Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          Chon cap do
        </h2>
        <LevelSelector
          currentLevel={progress?.currentLevel ?? 1}
          onSelectLevel={handleSelectLevel}
          unlockedLevels={progress?.unlockedLevels ?? [1]}
        />
      </div>

      {/* Due Words Review */}
      {!dueWordsLoading && dueWordsData && dueWordsData.total > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Tu can on tap ({dueWordsData.total})
          </h2>
          <DueWordsReview
            words={dueWordsData.words}
            total={dueWordsData.total}
            onSelectWord={handleSelectDueWord}
            hasMore={dueWordsData.words.length < dueWordsData.total}
          />
        </div>
      )}

      {/* Stats Summary */}
      {progress && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Thong ke nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {progress.totalWordsLearned ?? 0}
              </div>
              <div className="text-sm text-gray-500">Tu da hoc</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {progress.totalLessonsCompleted ?? 0}
              </div>
              <div className="text-sm text-gray-500">Bai da hoan thanh</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {progress.averageScore ?? 0}
              </div>
              <div className="text-sm text-gray-500">Diem trung binh</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {progress.practiceMinutesToday ?? 0}
              </div>
              <div className="text-sm text-gray-500">Phut hom nay</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeakingPracticePage
