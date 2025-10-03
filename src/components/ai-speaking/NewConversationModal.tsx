import { Clock, MessageCircle, Target, X, Zap } from 'lucide-react'
import React, { useState } from 'react'

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onStartConversation: (params: {
    conversationId?: string
    topic: string
    goal?: string
    targetDifficulty: string
    maxTurns: number
  }) => void
  existingConversationId?: string // Để tiếp tục conversation cũ
}

const difficultyOptions = [
  {
    label: 'Beginner',
    value: 'beginner',
    description: 'Cơ bản - Từ vựng đơn giản',
  },
  {
    label: 'Elementary',
    value: 'elementary',
    description: 'Sơ cấp - Câu ngắn thông dụng',
  },
  {
    label: 'Intermediate',
    value: 'intermediate',
    description: 'Trung cấp - Giao tiếp hàng ngày',
  },
  {
    label: 'Upper Intermediate',
    value: 'upper_intermediate',
    description: 'Trung cấp cao - Chủ đề phức tạp',
  },
  {
    label: 'Advanced',
    value: 'advanced',
    description: 'Nâng cao - Thảo luận chuyên sâu',
  },
  {
    label: 'Expert',
    value: 'expert',
    description: 'Chuyên gia - Các chủ đề học thuật',
  },
]

const topicSuggestions = [
  'Daily life and routines',
  'Work and career',
  'Travel and culture',
  'Food and cooking',
  'Technology and innovation',
  'Environment and sustainability',
  'Health and fitness',
  'Education and learning',
  'Entertainment and hobbies',
  'Family and relationships',
]

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onStartConversation,
  existingConversationId,
}) => {
  const [topic, setTopic] = useState('')
  const [goal, setGoal] = useState('')
  const [targetDifficulty, setTargetDifficulty] = useState('intermediate')
  const [maxTurns, setMaxTurns] = useState(8)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      return
    }

    onStartConversation({
      conversationId: existingConversationId,
      topic: topic.trim(),
      goal: goal.trim() || undefined,
      targetDifficulty,
      maxTurns,
    })

    // Reset form
    setTopic('')
    setGoal('')
    setTargetDifficulty('intermediate')
    setMaxTurns(8)
  }

  const selectedDifficulty = difficultyOptions.find(
    (opt) => opt.value === targetDifficulty
  )

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        backdropFilter: 'blur(2px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10000,
          opacity: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderBottom: '1px solid #e5e7eb' }}
        >
          <h2
            className="text-xl font-semibold text-gray-900 flex items-center gap-2"
            style={{ color: '#111827', fontSize: '1.25rem', fontWeight: '600' }}
          >
            <MessageCircle className="h-6 w-6" />
            {existingConversationId
              ? 'Tiếp tục hội thoại'
              : 'Hội thoại mới với AI'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            style={{ padding: '8px', borderRadius: '8px' }}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
          style={{ padding: '24px' }}
        >
          {/* Topic Selection */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Target className="h-4 w-4" />
              Chủ đề hội thoại *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ví dụ: Daily life and routines"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />

            {/* Topic suggestions */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Gợi ý chủ đề:</p>
              <div className="flex flex-wrap gap-2">
                {topicSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setTopic(suggestion)}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Target className="h-4 w-4" />
              Mục tiêu cụ thể (tùy chọn)
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ví dụ: Luyện tập từ vựng về ẩm thực, cải thiện phát âm..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Zap className="h-4 w-4" />
              Độ khó
            </label>
            <select
              value={targetDifficulty}
              onChange={(e) => setTargetDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {selectedDifficulty && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedDifficulty.description}
              </p>
            )}
          </div>

          {/* Max Turns */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
              <Clock className="h-4 w-4" />
              Số lượt hội thoại: {maxTurns}
            </label>
            <input
              type="range"
              min={4}
              max={16}
              step={2}
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Ngắn (4 lượt)</span>
              <span>Vừa phải (8-10 lượt)</span>
              <span>Dài (16 lượt)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!topic.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {existingConversationId
                ? 'Tiếp tục hội thoại'
                : 'Bắt đầu luyện nói'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
