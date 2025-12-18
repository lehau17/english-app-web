import { Clock, MessageCircle, Target, X, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { TopicSelector } from './TopicSelector'
import { type Topic } from '../../hooks/useTopics'

interface NewConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onStartConversation: (params: {
    conversationId?: string
    topic: string
    topicId?: string
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

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  onStartConversation,
  existingConversationId,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [customTopic, setCustomTopic] = useState('')
  const [goal, setGoal] = useState('')
  const [targetDifficulty, setTargetDifficulty] = useState('intermediate')
  const [maxTurns, setMaxTurns] = useState(8)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const topicText = selectedTopic?.name || customTopic.trim()

    if (!topicText) {
      return
    }

    onStartConversation({
      conversationId: existingConversationId,
      topic: topicText,
      topicId: selectedTopic?.id,
      goal: goal.trim() || undefined,
      targetDifficulty,
      maxTurns,
    })

    // Reset form
    setSelectedTopic(null)
    setCustomTopic('')
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
            <TopicSelector
              value={selectedTopic}
              onChange={(topic) => {
                setSelectedTopic(topic)
                setCustomTopic('') // Clear custom topic when selecting from list
                setTargetDifficulty(topic.difficulty) // Auto-set difficulty based on topic
              }}
              difficulty={targetDifficulty as any}
            />

            {/* Custom topic fallback */}
            <div className="mt-4">
              <label className="flex text-sm font-medium text-gray-700 mb-2 items-center gap-2">
                <Target className="h-4 w-4" />
                Or enter custom topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value)
                  if (e.target.value) {
                    setSelectedTopic(null) // Clear selected topic when typing custom
                  }
                }}
                placeholder="e.g., Daily life and routines"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              max={12}
              step={2}
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Ngắn (4 lượt)</span>
              <span>Vừa phải (8-10 lượt)</span>
              <span>Dài (12 lượt)</span>
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
              disabled={!selectedTopic && !customTopic.trim()}
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
