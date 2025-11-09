import { BookOpen, Clock, FileText, Sparkles } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import {
  generateAutoGaps,
  previewGapsInContent,
} from '../../../utils/gapExtractor'

interface ContentFormProps {
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  errors: FieldErrors
}

const difficultyOptions = [
  { value: 'beginner', label: 'Cơ bản (40%)' },
  { value: 'elementary', label: 'Sơ cấp (50%)' },
  { value: 'intermediate', label: 'Trung bình (60%)' },
  { value: 'upper_intermediate', label: 'Trung bình khá (70%)' },
  { value: 'advanced', label: 'Nâng cao (90%)' },
]

export const ContentForm: React.FC<ContentFormProps> = ({
  register,
  watch,
  setValue,
  errors,
}) => {
  const [autoMode, setAutoMode] = useState<'percent' | 'count'>('percent')
  const [autoDifficulty, setAutoDifficulty] = useState<string>('intermediate')
  const [autoCount, setAutoCount] = useState<number | ''>('')
  const [gapPreview, setGapPreview] = useState<string>('')

  const watchContent = watch('content')
  const watchSpeechSpeed = watch('speechSpeed') || 1.0

  useEffect(() => {
    if (watchContent) {
      const preview = previewGapsInContent(watchContent)
      setGapPreview(preview)
    }
  }, [watchContent])

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
      toast.error('Vui lòng nhập nội dung trước')
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
                className="bg-yellow-100 text-yellow-900 px-1 rounded"
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
          <BookOpen className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nội dung & Transcript
        </h2>
        <p className="text-gray-600">
          Nhập văn bản tiếng Anh và tạo chỗ trống cho bài tập
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Text Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Văn bản tiếng Anh <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              {...register('content', {
                required: 'Nội dung là bắt buộc',
                minLength: {
                  value: 10,
                  message: 'Nội dung phải có ít nhất 10 ký tự',
                },
              })}
              placeholder="Nhập hoặc dán văn bản tiếng Anh của bạn vào đây..."
              rows={12}
              className="text-base leading-relaxed resize-none"
            />
            {errors.content && (
              <p className="text-sm text-red-600">
                {errors.content.message as string}
              </p>
            )}
          </div>

          {/* Auto Gap Generator */}
          <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900">
                  Tự động tạo gaps
                </h4>
                <p className="text-sm text-emerald-700">
                  Chọn từ ngẫu nhiên để tạo chỗ trống
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setAutoMode('percent')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    autoMode === 'percent'
                      ? 'bg-emerald-500 text-white'
                      : 'text-emerald-700'
                  }`}
                >
                  Theo độ khó
                </button>
                <button
                  type="button"
                  onClick={() => setAutoMode('count')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    autoMode === 'count'
                      ? 'bg-emerald-500 text-white'
                      : 'text-emerald-700'
                  }`}
                >
                  Theo số lượng
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">
                  {autoMode === 'percent' ? 'Độ khó' : 'Số gaps'}
                </label>
                {autoMode === 'percent' ? (
                  <select
                    value={autoDifficulty}
                    onChange={(e) => setAutoDifficulty(e.target.value)}
                    className="w-full h-10 rounded-lg border border-emerald-300 bg-white px-3 text-sm"
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
                    className="w-full h-10 rounded-lg border border-emerald-300 bg-white px-3 text-sm"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-800">
                  Khả dụng
                </label>
                <div className="h-10 rounded-lg border border-emerald-300 bg-emerald-50 px-3 flex items-center text-sm text-emerald-700 font-medium">
                  {getAvailableCandidates(watchContent) || 0} từ
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAutoGenerate}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white mt-7"
                disabled={autoMode === 'count' && autoCount === ''}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Tạo gaps
              </Button>
            </div>

            <p className="mt-4 text-xs text-emerald-700 text-center">
              💡 Hoặc dùng [từ] để chọn thủ công trong văn bản
            </p>
          </div>

          {/* Gap Preview */}
          {gapPreview && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Preview (từ khuyết được highlight)
              </div>
              <PreviewWithHighlights text={watchContent} />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-blue-700 font-medium">Số từ</div>
                <div className="text-xl font-bold text-blue-900">
                  {getWordCount(watchContent)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-purple-700 font-medium">
                  Ước tính
                </div>
                <div className="text-xl font-bold text-purple-900">
                  ~{getEstimatedDuration(watchContent, watchSpeechSpeed)} phút
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
