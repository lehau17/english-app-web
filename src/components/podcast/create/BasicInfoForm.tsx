import { FileText } from 'lucide-react'
import React from 'react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'

interface BasicInfoFormProps {
  register: UseFormRegister<any>
  errors: FieldErrors
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  register,
  errors,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin cơ bản
        </h2>
        <p className="text-gray-600">
          Hãy bắt đầu với tiêu đề và mô tả cho podcast của bạn
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Tiêu đề podcast <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title', { required: 'Tiêu đề là bắt buộc' })}
              placeholder="Ví dụ: The Power of AI in Modern Education"
              className="h-12 text-base"
            />
            {errors.title && (
              <p className="text-sm text-red-600">
                {errors.title.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Mô tả ngắn
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Mô tả ngắn gọn về nội dung podcast này..."
              rows={4}
              className="text-base resize-none"
            />
            <p className="text-xs text-gray-500">
              Mô tả sẽ giúp học sinh hiểu nội dung trước khi nghe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
