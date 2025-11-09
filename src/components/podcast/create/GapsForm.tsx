import { Clock, FileText, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import type { UseFormWatch, UseFormSetValue } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { generateAutoGaps } from '../../../utils/gapExtractor'

interface GapsFormProps {
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

const difficultyOptions = [
  { value: 'beginner', label: 'Cơ bản (40%)' },
  { value: 'elementary', label: 'Sơ cấp (50%)' },
  { value: 'intermediate', label: 'Trung bình (60%)' },
  { value: 'upper_intermediate', label: 'Trung bình khá (70%)' },
  { value: 'advanced', label: 'Nâng cao (90%)' },
]

export const GapsForm: React.FC<GapsFormProps> = ({ watch, setValue }) => {
  const [autoMode, setAutoMode] = useState<'percent' | 'count'>('percent')
  const [autoDifficulty, setAutoDifficulty] = useState<string>('intermediate')
  const [autoCount, setAutoCount] = useState<number | ''>('')

  const watchContent = watch('content')
  const watchSpeechSpeed = watch('speechSpeed') || 1.0

  const getAvailableCandidates = (content: string): number => {
    try {
      if (!content?.trim()) return 0
      content = content.replace(/\[+\s*([^\]]+?)\s*\]+/g, '$1')
      const parts = content.split(/(\b\w+\b)/)
      let candidates = 0
      for (const token of parts) {
        if (token && /^\w+$/.test(token)) {
          candidates++
        }
      }
      return candidates
    } catch {
      return 0
    }
  }

  const handleAutoGenerate = async () => {
    const plain = watchContent || ''
    if (!plain.trim()) {
      toast.error('Chưa có nội dung. Vui lòng quay lại bước 2')
      return
    }
    try {
      const arg: any =
        autoMode === 'count' && autoCount !== ''
          ? Number(autoCount)
          : autoDifficulty
      const newContent = generateAutoGaps(plain, arg)
      setValue('content', newContent)

      if (autoMode === 'count' && autoCount !== '') {
        const available = getAvailableCandidates(plain)
        if (available > 0 && Number(autoCount) > available) {
          toast.success(`Đã tạo ${available} gaps (tối đa có thể)`)
        } else {
          toast.success('Đã tạo gaps tự động!')
        }
      } else {
        toast.success('Đã tạo gaps tự động!')
      }
    } catch (err) {
      console.error('Auto generate error', err)
      toast.error('Không thể tự động tạo gaps')
    }
  }

  const getWordCount = (text: string) =>
    (text || '').trim().split(/\s+/).filter(Boolean).length

  const getEstimatedDuration = (text: string, speed: number = 1.0) => {
    const wordCount = getWordCount(text)
    const wordsPerMinute = 150 * speed
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const PreviewWithHighlights: React.FC<{ text: string }> = ({ text }) => {
    if (!text)
      return <div className="text-sm text-gray-500">Chưa có nội dung</div>
    const parts = text.split(/(\[[^\]]+\])/g)
    return (
      <div className="text-sm leading-relaxed text-gray-800">
        {parts.map((part, i) => {
          if (!part) return null
          if (part.startsWith('[') && part.endsWith(']')) {
            const clean = part.substring(1, part.length - 1)
            return (
              <span
                key={i}
                className="bg-yellow-100 text-yellow-900 px-1 rounded font-medium"
              >
                {clean}
              </span>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tạo chỗ trống</h2>
        <p className="text-gray-600">
          Tự động tạo gaps hoặc chọn thủ công trong văn bản
        </p>
      </div>

      {/* Current Content Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Label className="text-base font-medium mb-3 block">
          Nội dung hiện tại:
        </Label>
        <div className="max-h-48 overflow-y-auto p-4 rounded-lg border border-gray-200 bg-gray-50">
          <PreviewWithHighlights text={watchContent || ''} />
        </div>
      </div>

      {/* Auto Gap Generator */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-emerald-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900">
              Tự động tạo gaps
            </h3>
            <p className="text-sm text-emerald-700">
              Chọn từ ngẫu nhiên để tạo chỗ trống
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-emerald-50 rounded-lg p-1 border border-emerald-200">
            <button
              type="button"
              onClick={() => setAutoMode('percent')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                autoMode === 'percent'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-700'
              }`}
            >
              Theo độ khó
            </button>
            <button
              type="button"
              onClick={() => setAutoMode('count')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                autoMode === 'count'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-700'
              }`}
            >
              Theo số lượng
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">
              {autoMode === 'percent' ? 'Độ khó' : 'Số gaps'}
            </label>
            {autoMode === 'percent' ? (
              <select
                value={autoDifficulty}
                onChange={(e) => setAutoDifficulty(e.target.value)}
                className="w-full h-11 rounded-lg border border-emerald-300 bg-white px-3 text-sm"
              >
                {difficultyOptions.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={0}
                max={getAvailableCandidates(watchContent) || 999}
                value={autoCount === '' ? '' : autoCount}
                onChange={(e) => {
                  const v =
                    e.target.value === ''
                      ? ''
                      : Math.max(0, Number(e.target.value))
                  setAutoCount(v === '' ? '' : Number(v))
                }}
                placeholder={`Max ${getAvailableCandidates(watchContent) || 0}`}
                className="w-full h-11 rounded-lg border border-emerald-300 bg-white px-3 text-sm"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800">
              Khả dụng
            </label>
            <div className="h-11 rounded-lg border border-emerald-300 bg-emerald-50 px-3 flex items-center text-sm text-emerald-700 font-medium">
              {getAvailableCandidates(watchContent) || 0} từ
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-emerald-800 invisible">
              Action
            </label>
            <Button
              type="button"
              onClick={handleAutoGenerate}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={autoMode === 'count' && autoCount === ''}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Tạo gaps
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-800">
            💡 <strong>Hoặc chỉnh thủ công:</strong> Quay lại bước 2 và dùng
            [từ] để chọn từ cụ thể
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-blue-700 font-medium">Số từ</div>
            <div className="text-2xl font-bold text-blue-900">
              {getWordCount(watchContent)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-xs text-purple-700 font-medium">Ước tính</div>
            <div className="text-2xl font-bold text-purple-900">
              ~{getEstimatedDuration(watchContent, watchSpeechSpeed)} phút
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
