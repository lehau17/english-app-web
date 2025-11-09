import { Settings, Tag, X } from 'lucide-react'
import React from 'react'
import type {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from 'react-hook-form'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import DragDropFile from '../../ui/DragDropFile'
import { Label } from '../../ui/label'

interface MetadataFormProps {
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
}

const categoryOptions = [
  { value: 'education', label: 'Giáo dục' },
  { value: 'business', label: 'Kinh doanh' },
  { value: 'technology', label: 'Công nghệ' },
  { value: 'entertainment', label: 'Giải trí' },
  { value: 'news', label: 'Tin tức' },
  { value: 'lifestyle', label: 'Lối sống' },
  { value: 'culture', label: 'Văn hóa' },
  { value: 'science', label: 'Khoa học' },
  { value: 'travel', label: 'Du lịch' },
  { value: 'study_abroad', label: 'Du học' },
]

const difficultyOptions = [
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'elementary', label: 'Sơ cấp' },
  { value: 'intermediate', label: 'Trung bình' },
  { value: 'upper_intermediate', label: 'Trung bình khá' },
  { value: 'advanced', label: 'Nâng cao' },
]

export const MetadataForm: React.FC<MetadataFormProps> = ({
  register,
  watch,
  setValue,
}) => {
  const tagInput = watch('__tag_input') || ''
  const tags = (watch('tags') || []) as string[]

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (!t) return
    if (!tags.includes(t)) {
      setValue('tags', [...tags, t])
    }
    setValue('__tag_input', '')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((t) => t !== tagToRemove)
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-2xl mb-4">
          <Settings className="h-8 w-8 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cài đặt & Phân loại
        </h2>
        <p className="text-gray-600">
          Hoàn tất bằng cách chọn danh mục, độ khó và thêm thumbnail
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-medium">
              Danh mục
            </Label>
            <select
              id="category"
              {...register('category')}
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-base font-medium">
              Độ khó
            </Label>
            <select
              id="difficulty"
              {...register('difficulty')}
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Thẻ từ khóa
          </Label>
          <div className="flex gap-3">
            <input
              type="text"
              {...register('__tag_input')}
              onKeyDown={(e) =>
                e.key === 'Enter' && (e.preventDefault(), handleAddTag())
              }
              placeholder="Thêm thẻ từ khóa..."
              className="flex-1 h-12 rounded-lg border border-gray-300 px-3 text-base"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              className="px-6 h-12 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Thêm
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  className="gap-2 px-3 py-2 bg-cyan-100 text-cyan-800 border border-cyan-200 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-cyan-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Thumbnail (tuỳ chọn)</Label>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <DragDropFile
                accept="image/*"
                label="Thumbnail"
                help="Kéo thả hình ảnh thumbnail (jpg/png)"
                onUploaded={(url) => setValue('thumbnailUrl', url)}
              />
              <input type="hidden" {...register('thumbnailUrl')} />
            </div>
          </div>
          <p className="text-xs text-center text-gray-500">
            Thumbnail sẽ hiển thị trong danh sách podcast
          </p>
        </div>
      </div>
    </div>
  )
}
