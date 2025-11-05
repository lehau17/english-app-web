import api from '../lib/api'

export interface VideoUploadResponse {
  videoUrl: string
  audioUrl?: string
  transcript?: string
  duration: number
  sizeBytes: number
  status: 'completed' | 'partial' | 'failed'
  message?: string
}

/**
 * Upload video file and auto-process (extract audio, upload to S3)
 */
export const uploadVideo = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<VideoUploadResponse> => {
  const formData = new FormData()
  formData.append('video', file)

  const response = await api.post(
    '/private/v1/podcasts/upload-video',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    }
  )

  return response.data.data
}
