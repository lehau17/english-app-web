import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Reply,
  Trash2,
} from 'lucide-react'
import React, { useState } from 'react'
import {
  useCommentReplies,
  useDeleteComment,
  useLikeComment,
  useReportComment,
} from '../../hooks/podcast-comment.hooks'
import type { PodcastComment } from '../../types/podcast-comment.type'
import { CommentEditForm } from './CommentEditForm'
import { CommentForm } from './CommentForm'

interface CommentItemProps {
  comment: PodcastComment
  currentUserId?: string
  onReply?: (parentCommentId: string, content: string) => void
  showReplies?: boolean
  isReply?: boolean
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  showReplies: _showReplies = true,
  isReply = false,
}) => {
  void _showReplies
  const [showMenu, setShowMenu] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showRepliesExpanded, setShowRepliesExpanded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const deleteCommentMutation = useDeleteComment()
  const likeCommentMutation = useLikeComment()
  const reportCommentMutation = useReportComment()

  // Fetch replies chỉ khi cần thiết
  const { data: repliesData } = useCommentReplies(comment.id, {
    enabled: showRepliesExpanded && !isReply && comment.replyCount > 0,
    limit: 10,
  })

  const handleLike = () => {
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    likeCommentMutation.mutate({
      commentId: comment.id,
      data: { isLiked: newLikedState },
    })
  }

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      deleteCommentMutation.mutate(comment.id)
    }
  }

  const handleReport = () => {
    const reason = window.prompt('Vui lòng nhập lý do báo cáo:')
    if (reason?.trim()) {
      reportCommentMutation.mutate({
        commentId: comment.id,
        data: { reason: reason.trim() },
      })
    }
  }

  const handleReplySubmit = (content: string) => {
    if (onReply) {
      onReply(comment.id, content)
      setShowReplyForm(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      )
      return `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  const getUserDisplayName = (user: PodcastComment['user']) => {
    if (!user) return 'Người dùng ẩn danh'
    return (
      user.displayName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      'Người dùng'
    )
  }

  const isOwner = currentUserId === comment.userId

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 border-l-2 border-gray-100 pl-4' : ''} mb-4`}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
              {comment.user?.avatarUrl ? (
                <img
                  src={comment.user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm">
                  {getUserDisplayName(comment.user).charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 text-sm">
                  {getUserDisplayName(comment.user)}
                </h4>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500 italic">
                      Đã chỉnh sửa
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal size={16} className="text-gray-500" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
                >
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setShowEditForm(true)
                          setShowMenu(false)
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit2 size={14} />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDelete()
                          setShowMenu(false)
                        }}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        <span>Xóa</span>
                      </button>
                    </>
                  )}
                  {!isOwner && (
                    <button
                      onClick={() => {
                        handleReport()
                        setShowMenu(false)
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Flag size={14} />
                      <span>Báo cáo</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        {showEditForm ? (
          <CommentEditForm
            initialContent={comment.content}
            onSave={(_content) => {
              // Handle edit
              setShowEditForm(false)
            }}
            onCancel={() => setShowEditForm(false)}
            commentId={comment.id}
          />
        ) : (
          <p className="text-gray-800 text-sm mb-3 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{comment.likeCount}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply size={16} />
                <span>Trả lời</span>
              </button>
            )}

            {!isReply && comment.replyCount > 0 && (
              <button
                onClick={() => setShowRepliesExpanded(!showRepliesExpanded)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle size={16} />
                <span>{comment.replyCount} phản hồi</span>
                {showRepliesExpanded ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <CommentForm
                placeholder="Viết phản hồi..."
                onSubmit={handleReplySubmit}
                submitText="Phản hồi"
                showCancel
                onCancel={() => setShowReplyForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replies */}
        <AnimatePresence>
          {showRepliesExpanded && !isReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              {repliesData?.data?.data.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  showReplies={false}
                  isReply={true}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
