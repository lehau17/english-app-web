import { Sparkles, X } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  ActivityType,
  DifficultyLevel,
  generateActivitiesWithAI,
  type GeneratedActivity,
} from '../../services/activity-ai.api'

interface AIActivityGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  courseTitle: string
  courseDescription?: string
  lessonTitle: string
  lessonDescription?: string
  lessonDifficulty?: DifficultyLevel
  onActivitiesGenerated: (activities: GeneratedActivity[]) => void
}

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  [ActivityType.VOCAB]: 'Từ vựng',
  [ActivityType.QUIZ]: 'Trắc nghiệm',
  [ActivityType.LISTENING]: 'Nghe',
  [ActivityType.SPEAKING]: 'Nói',
  [ActivityType.READING]: 'Đọc hiểu',
  [ActivityType.WRITING]: 'Viết',
  [ActivityType.PRONUNCIATION]: 'Phát âm',
  [ActivityType.FILL_BLANK]: 'Điền từ',
  [ActivityType.DICTATION]: 'Chính tả',
  [ActivityType.MATCHING]: 'Ghép đôi',
  [ActivityType.MINI_GAME]: 'Mini game',
  [ActivityType.GRAMMAR]: 'Ngữ pháp',
  [ActivityType.FLASHCARD]: 'Flashcard',
  [ActivityType.CONVERSATION]: 'Hội thoại',
}

const DEFAULT_ACTIVITY_TYPES = [
  ActivityType.VOCAB,
  ActivityType.QUIZ,
  ActivityType.LISTENING,
  ActivityType.SPEAKING,
  ActivityType.READING,
  ActivityType.WRITING,
]

export const AIActivityGeneratorModal: React.FC<
  AIActivityGeneratorModalProps
> = ({
  isOpen,
  onClose,
  courseTitle,
  courseDescription,
  lessonTitle,
  lessonDescription,
  lessonDifficulty,
  onActivitiesGenerated,
}) => {
  const [count, setCount] = useState<number>(5)
  const [userPrompt, setUserPrompt] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(
    DEFAULT_ACTIVITY_TYPES
  )
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const handleTypeToggle = (type: ActivityType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSelectAllTypes = () => {
    setSelectedTypes(Object.values(ActivityType))
  }

  const handleDeselectAllTypes = () => {
    setSelectedTypes([])
  }

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 loại hoạt động')
      return
    }

    setIsGenerating(true)

    try {
      const response = await generateActivitiesWithAI({
        courseTitle,
        courseDescription,
        lessonTitle,
        lessonDescription,
        userPrompt: userPrompt.trim() || undefined,
        count,
        activityTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
        difficulty: lessonDifficulty,
      })

      onActivitiesGenerated(response.activities)
      toast.success(`Đã tạo ${response.activities.length} hoạt động`)
      onClose()

      // Reset state
      setCount(5)
      setUserPrompt('')
      setSelectedTypes(DEFAULT_ACTIVITY_TYPES)
    } catch (err: any) {
      console.error('AI generation error:', err)
      toast.error(
        err.response?.data?.message ||
          'Có lỗi xảy ra khi tạo hoạt động. Vui lòng thử lại.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Tạo Hoạt Động Bằng AI</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Context */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Ngữ cảnh
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Khóa học:</strong> {courseTitle}
              </p>
              {courseDescription && (
                <p className="text-gray-600">{courseDescription}</p>
              )}
              <p className="mt-2">
                <strong>Bài học:</strong> {lessonTitle}
              </p>
              {lessonDescription && (
                <p className="text-gray-600">{lessonDescription}</p>
              )}
              {lessonDifficulty && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {lessonDifficulty}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết (tuỳ chọn)
            </label>
            <textarea
              rows={4}
              placeholder="Ví dụ: Tạo bài tập về chủ đề Shopping, tập trung vào từ vựng liên quan đến mua sắm tại cửa hàng quần áo, bao gồm cả cách hỏi giá và thương lượng..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              disabled={isGenerating}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Activity Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng hoạt động
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              disabled={isGenerating}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} hoạt động
                </option>
              ))}
            </select>
          </div>

          {/* Activity Types */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Loại hoạt động
              </label>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAllTypes}
                  disabled={isGenerating}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Chọn tất cả
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllTypes}
                  disabled={isGenerating}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.values(ActivityType).map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    disabled={isGenerating}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm">{ACTIVITY_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Đang tạo hoạt động bằng AI...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedTypes.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Đang tạo...' : 'Tạo hoạt động'}
          </button>
        </div>
      </div>
    </div>
  )
}
