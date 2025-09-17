import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import React, { useState } from 'react'

interface CommentFormProps {
  onSubmit: (content: string) => void
  placeholder?: string
  submitText?: string
  showCancel?: boolean
  onCancel?: () => void
  isSubmitting?: boolean
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = 'Viết bình luận...',
  submitText = 'Đăng',
  showCancel = false,
  onCancel,
  isSubmitting = false,
}) => {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-end space-x-3">
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Hủy
          </button>
        )}

        <motion.button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          whileHover={{ scale: content.trim() ? 1.02 : 1 }}
          whileTap={{ scale: content.trim() ? 0.98 : 1 }}
        >
          <Send size={16} />
          <span>{isSubmitting ? 'Đang đăng...' : submitText}</span>
        </motion.button>
      </div>
    </form>
  )
}
