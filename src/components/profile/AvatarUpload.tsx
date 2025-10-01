import { Camera } from 'lucide-react'
import { useRef } from 'react'
import toast from 'react-hot-toast'
import { validateFileUpload } from '../../utils/errorHandling'

interface AvatarUploadProps {
  avatar: string
  name: string
  onUpload: (file: File) => Promise<void>
  loading?: boolean
}

export default function AvatarUpload({
  avatar,
  name,
  onUpload,
  loading = false,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (loading) return
    fileInputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFileUpload(file)
      if (!validation.isValid) {
        toast.error(validation.error || 'File không hợp lệ')
        return
      }

      try {
        await onUpload(file)
      } catch (error) {
        console.error('Error uploading:', error)
      }
    }
    // Reset input để có thể chọn lại file cũ
    e.target.value = ''
  }

  return (
    <div className="relative">
      <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/30 bg-white/10 md:h-32 md:w-32">
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="absolute -bottom-1 -right-1 rounded-full bg-white p-2 text-gray-700 shadow-lg hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-700 border-t-transparent" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
