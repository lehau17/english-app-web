import { useState, useRef } from 'react'
import { X, Upload, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { createMakeupRequest } from '../../services/makeup-request.api'
import { uploadFile } from '../../services/upload.api'
import type { AttendanceHistoryItem } from '../../types/attendance.type'

interface MakeupRequestModalProps {
  isOpen: boolean
  onClose: () => void
  attendanceItem: AttendanceHistoryItem | null
  onSuccess?: () => void
}

interface UploadedFile {
  file: File
  url: string
  preview: string
}

export const MakeupRequestModal = ({
  isOpen,
  onClose,
  attendanceItem,
  onSuccess,
}: MakeupRequestModalProps) => {
  const [reason, setReason] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !attendanceItem) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)
    setIsUploading(true)

    try {
      const newFiles: UploadedFile[] = []

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Chỉ hỗ trợ upload hình ảnh (jpg, png, gif...)')
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Kích thước file tối đa là 5MB')
          continue
        }

        // Upload file
        const url = await uploadFile(file)

        // Create preview URL
        const preview = URL.createObjectURL(file)

        newFiles.push({ file, url, preview })
      }

      setUploadedFiles((prev) => [...prev, ...newFiles])
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Không thể upload file. Vui lòng thử lại.'
      )
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => {
      const removed = prev[index]
      // Revoke preview URL to free memory
      URL.revokeObjectURL(removed.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do')
      return
    }

    try {
      setIsSubmitting(true)

      const evidenceUrls = uploadedFiles.map((f) => f.url)

      await createMakeupRequest(attendanceItem.session.sessionId, {
        reason: reason.trim(),
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined,
      })

      // Cleanup
      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
      setReason('')
      setUploadedFiles([])
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Yêu cầu điểm danh bù</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-blue-100 mt-1">
            {attendanceItem.session.sessionTitle}
          </p>
          <p className="text-xs text-blue-200 mt-0.5">
            {formatDate(attendanceItem.session.startTime)}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do bạn không thể tham gia buổi học này..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minh chứng (ảnh)
            </label>

            {/* Upload Button */}
            <div className="mb-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
                id="evidence-upload"
              />
              <label
                htmlFor="evidence-upload"
                className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors ${
                  isUploading
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-600">
                      Đang upload...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Nhấn để chọn ảnh (tối đa 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={file.preview}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Có thể upload nhiều ảnh: giấy khám bệnh, tin nhắn xin phép, v.v.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
