import { Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LearningPathCard from '../components/learning-path/LearningPathCard'
import RecommendationsSection from '../components/recommendations/RecommendationsSection'
import {
  useActiveLearningPath,
  useDeleteLearningPath,
  useGenerateLearningPathForNewStudent,
  useLearningPaths,
} from '../hooks/useLearningPath'

export default function LearningPathPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>(
    'all'
  )

  const { data: allPaths, isLoading: isLoadingPaths } = useLearningPaths()
  const { data: activePath } = useActiveLearningPath()
  const deletePath = useDeleteLearningPath()
  const generatePath = useGenerateLearningPathForNewStudent()

  const handleGenerate = async () => {
    try {
      const result = await generatePath.mutateAsync({})
      if (result?.data?.pathId) {
        navigate(`/learning-paths/${result.data.pathId}`)
      }
    } catch (error) {
      console.error('Failed to generate learning path:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lộ trình học này?')) {
      try {
        await deletePath.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete learning path:', error)
      }
    }
  }

  const filteredPaths =
    activeTab === 'active'
      ? allPaths?.filter((p) => !p.isCompleted && p.currentStep > 0) || []
      : activeTab === 'completed'
        ? allPaths?.filter((p) => p.isCompleted) || []
        : allPaths || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lộ trình học của tôi
            </h1>
            <p className="mt-2 text-gray-600">
              Quản lý và theo dõi các lộ trình học được cá nhân hóa
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generatePath.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            {generatePath.isPending ? 'Đang tạo...' : 'Tạo lộ trình mới'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all'
                ? 'Tất cả'
                : tab === 'active'
                  ? 'Đang học'
                  : 'Hoàn thành'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {isLoadingPaths ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : filteredPaths.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Chưa có lộ trình học
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Tạo lộ trình học mới để bắt đầu hành trình học tập của bạn
              </p>
              <button
                onClick={handleGenerate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Tạo lộ trình mới
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  onView={(id) => navigate(`/learning-paths/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Path */}
          {activePath && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 max-h-[600px] overflow-y-auto">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Lộ trình đang học
              </h3>
              <LearningPathCard
                path={activePath}
                onView={(id) => navigate(`/learning-paths/${id}`)}
              />
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 max-h-[400px] overflow-y-auto">
            <RecommendationsSection
              limit={3}
              onAction={(id, type) => {
                // Handle recommendation action
                console.log('Recommendation action:', id, type)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
