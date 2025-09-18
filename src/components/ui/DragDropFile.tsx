import React, { useCallback, useState } from 'react'
import { uploadFile } from '../../services/upload.api'

interface Props {
  accept?: string // e.g. 'image/*' or '.pdf,audio/*'
  onUploaded: (url: string) => void
  label?: string
  help?: string
  multiple?: boolean
}

const DragDropFile: React.FC<Props> = ({
  accept = '*',
  onUploaded,
  label,
  help,
  multiple = false,
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setUploading(true)
      try {
        // use first file for now
        const file = files[0]
        // preview for images
        if (file.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(file))
        } else {
          setPreviewUrl(null)
        }

        const url = await uploadFile(file)
        // Defensive: backend/upload API may return different shapes. Ensure we pass a string URL.
        let normalized: string = ''
        if (!url) {
          normalized = ''
        } else if (typeof url === 'string') {
          normalized = url
        } else if (typeof url === 'object' && (url as any).url) {
          normalized = (url as any).url
        } else {
          // fallback: try to stringify if nothing else
          try {
            normalized = JSON.stringify(url)
          } catch (e) {
            normalized = ''
          }
        }

        if (!normalized) {
          throw new Error('Invalid upload result, no URL returned')
        }

        onUploaded(normalized)
      } catch (err) {
        console.error('Upload failed', err)
        alert('Upload thất bại')
      } finally {
        setUploading(false)
      }
    },
    [onUploaded]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <div>
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full rounded-md border-2 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300 bg-white'} p-4 flex items-center justify-center flex-col`}
      >
        <div className="text-sm text-gray-600 mb-2">
          {help || 'Kéo thả hoặc nhấn để chọn file'}
        </div>
        <input
          type="file"
          accept={accept}
          onChange={onFileChange}
          multiple={multiple}
          className="hidden"
          id="drag-drop-input"
        />
        <label
          htmlFor="drag-drop-input"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded"
        >
          Chọn file
        </label>
        {uploading && (
          <div className="text-sm text-gray-500 mt-2">Đang tải lên...</div>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="mt-3 max-h-40 object-contain"
          />
        )}
      </div>
    </div>
  )
}

export default DragDropFile
