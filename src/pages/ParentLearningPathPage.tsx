import { BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LearningPathCard from '../components/learning-path/LearningPathCard'
import ChildSelector from '../components/parent/ChildSelector'
import {
  useParentChildActiveLearningPathQuery,
  useParentChildLearningPathsQuery,
  useParentChildrenQuery,
} from '../hooks/parent.queries'

export default function ParentLearningPathPage() {
  const navigate = useNavigate()
  const { data: childrenData } = useParentChildrenQuery()
  const children = childrenData || []

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    children.length > 0 ? children[0]?.id || null : null
  )

  const { data: learningPaths, isLoading: isLoadingPaths } =
    useParentChildLearningPathsQuery(selectedChildId)
  const { data: activePath } =
    useParentChildActiveLearningPathQuery(selectedChildId)

  if (children.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Chưa có con được liên kết
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Vui lòng liên kết tài khoản con trước khi xem lộ trình học tập
          </p>
        </div>
      </div>
    )
  }

  const selectedChild = children.find((c) => c.id === selectedChildId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Lộ trình học tập của con
        </h1>
        <p className="mt-2 text-gray-600">
          Xem và theo dõi lộ trình học tập được cá nhân hóa cho con của bạn
        </p>
      </div>

      <ChildSelector
        children={children}
        selectedChildId={selectedChildId}
        onSelect={setSelectedChildId}
        variant={children.length <= 3 ? 'tabs' : 'dropdown'}
      />

      {selectedChildId && (
        <div className="space-y-6">
          {/* Active Path */}
          {activePath && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Lộ trình đang học - {selectedChild?.name || 'Con'}
              </h3>
              <LearningPathCard
                path={activePath}
                onView={(id) =>
                  navigate(`/parent/learning-paths/${selectedChildId}/${id}`)
                }
              />
            </div>
          )}

          {/* All Paths */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Tất cả lộ trình học tập
            </h3>

            {isLoadingPaths ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : !learningPaths || learningPaths.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  Chưa có lộ trình học tập
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedChild?.name || 'Con'} chưa có lộ trình học tập nào
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {learningPaths.map((path: any) => (
                  <LearningPathCard
                    key={path.id}
                    path={path}
                    onView={(id) =>
                      navigate(
                        `/parent/learning-paths/${selectedChildId}/${id}`
                      )
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
