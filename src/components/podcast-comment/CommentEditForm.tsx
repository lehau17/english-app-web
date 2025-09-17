import { motion } from 'framer-motion'
import { Save, X } from 'lucide-react'
import React, { useState } from 'react'
import { useUpdateComment } from '../../hooks/podcast-comment.hooks'

interface CommentEditFormProps {
  commentId: string
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export const CommentEditForm: React.FC<CommentEditFormProps> = ({
  commentId,
  initialContent,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent)
  const updateCommentMutation = useUpdateComment()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && content.trim() !== initialContent) {
      updateCommentMutation.mutate(
        {
          commentId,
          data: { content: content.trim() },
        },
        {
          onSuccess: () => {
            onSave(content.trim())
          },
        }
      )
    } else {
      onCancel()
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          disabled={updateCommentMutation.isPending}
          autoFocus
        />
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          disabled={updateCommentMutation.isPending}
        >
          <X size={14} />
          <span>Hủy</span>
        </button>

        <motion.button
          type="submit"
          disabled={!content.trim() || updateCommentMutation.isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
          whileHover={{ scale: content.trim() ? 1.02 : 1 }}
          whileTap={{ scale: content.trim() ? 0.98 : 1 }}
        >
          <Save size={14} />
          <span>{updateCommentMutation.isPending ? 'Đang lưu...' : 'Lưu'}</span>
        </motion.button>
      </div>
    </motion.form>
  )
}
