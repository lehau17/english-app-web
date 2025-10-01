import { X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  playlistApi,
  type CreatePlaylistDto,
  type Playlist,
  type UpdatePlaylistDto,
} from '../../services/playlist.api'

interface PlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (playlist: Playlist) => void
  playlist?: Playlist // If provided, it's edit mode
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  playlist,
}) => {
  const [formData, setFormData] = useState<
    CreatePlaylistDto & UpdatePlaylistDto
  >({
    name: '',
    description: '',
    isPublic: false,
    thumbnailUrl: '',
    tags: [],
    category: '',
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)

  const isEditMode = Boolean(playlist)

  // Initialize form data when modal opens or playlist changes
  useEffect(() => {
    if (isOpen) {
      if (playlist) {
        setFormData({
          name: playlist.name,
          description: playlist.description || '',
          isPublic: playlist.isPublic,
          thumbnailUrl: playlist.thumbnailUrl || '',
          tags: playlist.tags || [],
          category: playlist.category || '',
        })
      } else {
        setFormData({
          name: '',
          description: '',
          isPublic: false,
          thumbnailUrl: '',
          tags: [],
          category: '',
        })
      }
      setTagInput('')
    }
  }, [isOpen, playlist])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Tên playlist không được để trống')
      return
    }

    setLoading(true)
    try {
      let result: Playlist

      if (isEditMode && playlist) {
        result = await playlistApi.update(playlist.id, formData)
        toast.success('Cập nhật playlist thành công!')
      } else {
        result = await playlistApi.create(formData)
        toast.success('Tạo playlist thành công!')
      }

      onSuccess(result)
      onClose()
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (isEditMode
          ? 'Có lỗi xảy ra khi cập nhật playlist'
          : 'Có lỗi xảy ra khi tạo playlist')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags?.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa playlist' : 'Tạo playlist mới'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Tên playlist <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Nhập tên playlist..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Mô tả về playlist..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Danh mục
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ví dụ: Học tiếng Anh, Tin tức..."
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Thẻ tag
            </label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Nhập tag và nhấn Enter..."
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                Thêm
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Privacy */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-medium text-gray-700"
              >
                Playlist công khai
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Playlist công khai có thể được người khác tìm kiếm và xem
            </p>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label
              htmlFor="thumbnailUrl"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              URL ảnh đại diện
            </label>
            <input
              type="url"
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  thumbnailUrl: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading
                ? 'Đang xử lý...'
                : isEditMode
                  ? 'Cập nhật'
                  : 'Tạo playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlaylistModal
