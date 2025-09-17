import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react'
import React, { useState } from 'react'
import {
  useCreateComment,
  usePodcastComments,
} from '../../hooks/podcast-comment.hooks'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

interface CommentSectionProps {
  podcastId: string
  currentUserId?: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  podcastId,
  currentUserId,
}) => {
  const [page, setPage] = useState(1)
  const [showCommentForm, setShowCommentForm] = useState(false)

  const {
    data: commentsData,
    isLoading,
    error,
  } = usePodcastComments(podcastId, {
    page,
    limit: 10,
    includeReplies: true,
  })

  const createCommentMutation = useCreateComment()

  const handleCreateComment = (content: string) => {
    createCommentMutation.mutate(
      {
        podcastId,
        content,
      },
      {
        onSuccess: () => {
          setShowCommentForm(false)
        },
      }
    )
  }

  const handleReply = (parentCommentId: string, content: string) => {
    createCommentMutation.mutate({
      podcastId,
      content,
      parentId: parentCommentId,
    })
  }

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Đang tải bình luận...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 text-sm">Có lỗi xảy ra khi tải bình luận</p>
      </div>
    )
  }

  const comments = commentsData?.data?.data || []
  const totalComments = commentsData?.data?.total || 0
  const hasMoreComments = page < (commentsData?.data?.totalPages || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Bình luận ({totalComments})
          </h3>
        </div>

        <button
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>Thêm bình luận</span>
          {showCommentForm ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <CommentForm
            onSubmit={handleCreateComment}
            isSubmitting={createCommentMutation.isPending}
          />
        </motion.div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}

          {/* Load More Button */}
          {hasMoreComments && (
            <div className="text-center pt-4">
              <motion.button
                onClick={handleLoadMore}
                className="px-6 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Xem thêm bình luận
              </motion.button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Chưa có bình luận nào</p>
          <button
            onClick={() => setShowCommentForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thêm bình luận đầu tiên
          </button>
        </div>
      )}
    </div>
  )
}
