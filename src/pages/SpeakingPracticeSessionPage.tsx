import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Home, ArrowLeft, Loader2 } from 'lucide-react'
import { useNextItem, useCurrentProgress } from '../hooks/useSpeakingPractice'
import { PracticeSession, LevelSelector } from '../components/speaking-practice'

const SpeakingPracticeSessionPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const levelParam = searchParams.get('level')
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(
    levelParam ? parseInt(levelParam, 10) : undefined
  )

  const { data: progress } = useCurrentProgress()
  const {
    data: item,
    isLoading,
    refetch,
  } = useNextItem({
    level: selectedLevel,
  })

  const handleComplete = useCallback(() => {
    refetch()
  }, [refetch])

  const handleLevelUp = useCallback(() => {
    if (selectedLevel && selectedLevel < 5) {
      setSelectedLevel(selectedLevel + 1)
    }
  }, [selectedLevel])

  const handleSelectLevel = useCallback((level: number) => {
    setSelectedLevel(level)
  }, [])

  const handleBack = useCallback(() => {
    navigate('/speaking-practice')
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200/50 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lai
          </button>

          <div className="text-center">
            <h1 className="font-bold text-gray-900">Luyen phat am</h1>
            {selectedLevel && (
              <div className="text-sm text-emerald-600">
                Cap do {selectedLevel}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Level Selector (collapsible on mobile) */}
        {progress && (
          <div className="mb-6">
            <details className="bg-white rounded-lg shadow">
              <summary className="px-4 py-3 cursor-pointer font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Chon cap do khac
              </summary>
              <div className="p-4 border-t">
                <LevelSelector
                  currentLevel={selectedLevel ?? progress.currentLevel}
                  onSelectLevel={handleSelectLevel}
                  unlockedLevels={progress.unlockedLevels}
                />
              </div>
            </details>
          </div>
        )}

        {/* Practice Session */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
            <p className="mt-4 text-gray-600">Dang tai bai tap...</p>
          </div>
        ) : item ? (
          <PracticeSession
            item={item}
            onComplete={handleComplete}
            onLevelUp={handleLevelUp}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">
              Tuyet voi!
            </h2>
            <p className="text-gray-600 mb-6">
              Ban da hoan thanh tat ca bai tap o cap do nay.
            </p>
            <div className="flex justify-center gap-4">
              {selectedLevel && selectedLevel < 5 && (
                <button
                  onClick={() => setSelectedLevel(selectedLevel + 1)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Len cap do {selectedLevel + 1}
                </button>
              )}
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Ve trang chinh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpeakingPracticeSessionPage
