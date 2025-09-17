import { motion } from 'framer-motion'
import { Crown, Play, Plus, Share2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CommentSection } from '../components/podcast-comment/CommentSection'
import { useAuth } from '../context/AuthContext'
import {
  useAggregateRating,
  useHasUserRated,
  useListRatings,
  useMyRating,
  useSaveRating,
} from '../hooks/podcast-rating.hooks'
import { usePodcast } from '../hooks/podcast.hooks'

// Lightweight types for clarity
type Activity = {
  id: number
  title: string
  icon: string
  bgColor: string
  iconBg: string
  locked: boolean
}

const StarRating: React.FC<{
  rating: number
  interactive?: boolean
  onRate?: (n: number) => void
}> = ({ rating, interactive = false, onRate }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer' : ''}`}
        onClick={interactive ? () => onRate?.(i + 1) : undefined}
      >
        ★
      </span>
    ))}
  </div>
)

const PodcastDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [userRatings, setUserRatings] = useState({
    overallRating: 0,
    difficultyRating: 0,
    qualityRating: 0,
  })

  const { data: podcastResponse, isLoading, error } = usePodcast(id || '')
  const podcastData = podcastResponse

  const { data: aggregate } = useAggregateRating(podcastData?.id)
  const { data: myRating } = useMyRating(podcastData?.id)
  const saveRating = useSaveRating(podcastData?.id)
  const auth = useAuth()
  const [page, setPage] = useState(1)
  const { data: ratingsList, refetch } = useListRatings(
    podcastData?.id,
    page,
    6
  )
  const { data: hasRatedResp } = useHasUserRated(podcastData?.id)
  const hasRated = !!hasRatedResp?.data || false

  useEffect(() => {
    if (myRating?.data) {
      setUserRatings({
        overallRating: myRating.data.overallRating,
        difficultyRating: myRating.data.difficultyRating || 0,
        qualityRating: myRating.data.qualityRating || 0,
      })
    }
  }, [myRating])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Đang tải thông tin podcast...</p>
        </div>
      </div>
    )
  }

  if (error || !podcastData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            Không tìm thấy podcast hoặc có lỗi xảy ra
          </p>
        </div>
      </div>
    )
  }

  // Chỉ show activity fill_blank có sẵn trong podcast
  const activities: Activity[] = [
    {
      id: 1,
      title: 'Điền từ khuyết',
      icon: '📝',
      bgColor: 'from-blue-200 to-blue-100',
      iconBg: 'bg-blue-200',
      locked: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header with breadcrumb and play button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">
              {podcastData.code}
            </span>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Share2 size={16} className="text-gray-400" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Plus size={16} className="text-gray-400" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              navigate(`/listening-practice/${podcastData.id}/test`)
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm"
          >
            <Play size={16} fill="currentColor" />
            <span>Bắt đầu nghe</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              {podcastData.title}
            </h1>

            {/* Practice Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Luyện tập
                </h2>
                <span className="text-orange-500 text-sm">
                  (Điền từ khuyết) <span className="text-blue-500">🔗</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {podcastData.description ||
                  'Rèn luyện kỹ năng nghe với bài tập điền từ khuyết'}
              </p>

              {/* Activity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    whileHover={{ y: -2 }}
                    onClick={() =>
                      !activity.locked &&
                      navigate(`/listening-practice/${podcastData.id}/test`)
                    }
                    className={`relative p-6 rounded-2xl bg-gradient-to-br ${activity.bgColor} cursor-pointer transition-all ${activity.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div
                      className={
                        activity.locked
                          ? 'absolute top-3 left-3 text-gray-500 text-xs font-medium'
                          : 'hidden'
                      }
                    >
                      Locked
                    </div>
                    <div
                      className={
                        activity.locked ? 'absolute top-3 right-3' : 'hidden'
                      }
                    >
                      <Crown size={16} className="text-yellow-600" />
                    </div>
                    <div className="flex flex-col items-center text-center mt-6">
                      <div
                        className={`w-14 h-14 ${activity.iconBg} rounded-full flex items-center justify-center mb-3 text-2xl`}
                      >
                        {activity.icon}
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {activity.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Transcript Content */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nội dung bài nghe
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {podcastData.description || 'Nội dung đang được xử lý...'}
                </p>
              </div>
            </div>

            {/* Ratings Section */}
            <div className="mb-8">
              <div className="flex flex-col items-center gap-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900">
                  Đánh giá (
                  {(aggregate?.total ?? podcastData.totalRatings) || 0})
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={Math.round(aggregate?.averageOverall || 0)}
                    />
                    <span className="text-sm font-medium text-blue-600">
                      {Math.round(aggregate?.averageOverall || 0)}/5
                    </span>
                    <span className="text-sm text-gray-500">(Tổng thể)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={Math.round(
                        aggregate?.averageDifficulty ||
                          podcastData.difficultyRating ||
                          0
                      )}
                    />
                    <span className="text-sm font-medium text-red-600">
                      {Math.round(
                        aggregate?.averageDifficulty ||
                          podcastData.difficultyRating ||
                          0
                      )}
                      /5
                    </span>
                    <span className="text-sm text-gray-500">(Độ khó)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating
                      rating={Math.round(
                        aggregate?.averageQuality ||
                          podcastData.qualityRating ||
                          0
                      )}
                    />
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(
                        aggregate?.averageQuality ||
                          podcastData.qualityRating ||
                          0
                      )}
                      /5
                    </span>
                    <span className="text-sm text-gray-500">(Chất lượng)</span>
                  </div>
                </div>
              </div>

              {/* Interactive rating for logged-in users */}
              {auth?.user ? (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-4">
                    {hasRated ? 'Bạn đã đánh giá' : 'Gửi đánh giá của bạn'}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">
                        Tổng thể:
                      </span>
                      <StarRating
                        rating={userRatings.overallRating}
                        interactive
                        onRate={(n: number) =>
                          setUserRatings((prev) => ({
                            ...prev,
                            overallRating: n,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">Độ khó:</span>
                      <StarRating
                        rating={userRatings.difficultyRating}
                        interactive
                        onRate={(n: number) =>
                          setUserRatings((prev) => ({
                            ...prev,
                            difficultyRating: n,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">
                        Chất lượng:
                      </span>
                      <StarRating
                        rating={userRatings.qualityRating}
                        interactive
                        onRate={(n: number) =>
                          setUserRatings((prev) => ({
                            ...prev,
                            qualityRating: n,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <button
                        onClick={async () => {
                          const payload = {
                            podcastId: podcastData.id,
                            overallRating: userRatings.overallRating,
                            difficultyRating:
                              userRatings.difficultyRating || undefined,
                            qualityRating:
                              userRatings.qualityRating || undefined,
                          }
                          await saveRating.mutateAsync(payload)
                          refetch()
                        }}
                        disabled={!!hasRated}
                        className={`text-sm font-medium px-4 py-2 rounded-lg ${hasRated ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      >
                        {myRating
                          ? 'Cập nhật'
                          : hasRated
                            ? 'Bạn đã đánh giá'
                            : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Đăng nhập để gửi đánh giá
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            {/* Podcast Artwork */}
            <div className="rounded-lg overflow-hidden mb-6 shadow-sm">
              {podcastData.thumbnailUrl ? (
                <div className="aspect-square">
                  <img
                    src={podcastData.thumbnailUrl}
                    alt={podcastData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-yellow-200 via-orange-200 to-green-200 relative">
                  <div className="absolute inset-0 p-6 flex items-center justify-center">
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-yellow-300 via-orange-300 to-green-300 flex items-center justify-center relative">
                      <div className="text-center text-white font-semibold">
                        No Image
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Author and Stats Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-medium text-sm">
                  {podcastData.author?.avatarUrl ? (
                    <img
                      src={podcastData.author.avatarUrl}
                      alt="Author"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs">
                      📻
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tác giả</div>
                  <div className="font-medium text-gray-900">
                    {podcastData.author
                      ? `${podcastData.author.firstName || ''} ${podcastData.author.lastName || ''}`.trim() ||
                        'Unknown Author'
                      : 'AI Generated'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mã</span>
                  <span className="font-medium text-gray-900">
                    {podcastData.code}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Danh mục</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {podcastData.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Độ khó</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {podcastData.difficulty}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Thời lượng</span>
                  <span className="font-medium text-gray-900">
                    {podcastData.durationFormatted ||
                      `${Math.floor(podcastData.duration / 60)}:${String(podcastData.duration % 60).padStart(2, '0')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lượt xem</span>
                  <span className="font-medium text-gray-900">
                    {podcastData.viewCount || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-medium text-gray-900">
                    {new Date(podcastData.createdAt).toLocaleDateString(
                      'vi-VN'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <div className="font-medium text-gray-900 mb-2">Disclaimer</div>
              <div className="text-gray-600 leading-relaxed">
                WELE does not own the rights to this content. All rights belong
                to the owner. WELE only use this content to help users learn
                English. Contact to request removal of content:
              </div>
              <div className="mt-2 text-blue-600">welevietnam@gmail.com</div>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Các đánh giá gần đây ({ratingsList?.data?.totalItems || 0})
          </h3>
          <div className="space-y-4">
            {ratingsList?.data?.data?.length ? (
              ratingsList.data.data.map((r: any) => (
                <div
                  key={r.id}
                  className="bg-white border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                      {r.user?.avatarUrl ? (
                        <img
                          src={r.user.avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          {(r.user?.displayName || 'U').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">
                          {r.user?.displayName || 'Người dùng'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.overallRating} />
                          <span className="text-sm text-gray-600">
                            Tổng thể
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.difficultyRating || 0} />
                          <span className="text-sm text-gray-600">Độ khó</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating rating={r.qualityRating || 0} />
                          <span className="text-sm text-gray-600">
                            Chất lượng
                          </span>
                        </div>
                      </div>
                      {r.comment ? (
                        <div className="mt-2 text-sm text-gray-700">
                          {r.comment}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Chưa có đánh giá nào</div>
            )}

            {/* Pagination */}
            {ratingsList?.pagination &&
              ratingsList.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    Trước
                  </button>
                  <div className="px-3 py-1">
                    {page} / {ratingsList.pagination.totalPages}
                  </div>
                  <button
                    disabled={page >= ratingsList.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-gray-100 rounded"
                  >
                    Sau
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-12">
          <CommentSection
            podcastId={podcastData.id}
            currentUserId={auth.user?.id || 'current-user-id'}
          />
        </div>

        {/* Ratings List */}
      </div>
    </div>
  )
}

export default PodcastDetailPage
