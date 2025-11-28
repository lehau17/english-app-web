import { Mic, Play, Upload, Volume2, X } from 'lucide-react'
import React, { useState } from 'react'
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import toast from 'react-hot-toast'
import { Button } from '../../ui/button'
import DragDropFile from '../../ui/DragDropFile'
import { Label } from '../../ui/label'
import { apiTranSlation } from '../../../services/translate.api'
import { uploadVideo } from '../../../services/video-upload.api'

interface MediaUploadFormProps {
  register: UseFormRegister<any>
  watch: UseFormWatch<any>
  setValue: UseFormSetValue<any>
  onAudioDurationChange: (duration: number) => void
  onTtsStatusChange: (
    status: 'idle' | 'generating' | 'completed' | 'error'
  ) => void
  onQueuedForTTS: (queued: boolean) => void
}

export const MediaUploadForm: React.FC<MediaUploadFormProps> = ({
  register,
  watch,
  setValue,
  onAudioDurationChange,
  onTtsStatusChange,
  onQueuedForTTS,
}) => {
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('generate')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)

  const watchMediaType = watch('mediaType')

  const handleGenerateAudio = async () => {
    const content = watch('content')

    if (!content?.trim()) {
      toast.error('Vui lòng nhập nội dung ở bước tiếp theo trước')
      return
    }

    setIsGenerating(true)
    onTtsStatusChange('generating')
    try {
      const response = await apiTranSlation(content)

      if (response.data.url) {
        setPreviewUrl(response.data.url)
        setValue('audioUrl', response.data.url)
        onTtsStatusChange('completed')

        const audio = new Audio(response.data.url)
        audio.addEventListener('loadedmetadata', () => {
          onAudioDurationChange(Math.floor(audio.duration) || 0)
        })
        toast.success('Tạo audio thành công!')
      } else if (
        (response.data as any).queued ||
        (response.data as any).status === 'queued'
      ) {
        onTtsStatusChange('generating')
        onQueuedForTTS(true)
        toast.success('Audio đang được tạo trong nền.')
      }
    } catch (error) {
      console.error('Generate audio error:', error)
      onTtsStatusChange('error')
      toast.error('Có lỗi xảy ra khi tạo audio')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (!file) return

    const validTypes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/webm',
      'video/x-matroska',
    ]
    if (!validTypes.includes(file.type)) {
      toast.error('Định dạng video không hợp lệ')
      return
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error('File quá lớn! Kích thước tối đa: 500MB')
      return
    }

    setIsUploadingVideo(true)
    setVideoUploadProgress(0)

    try {
      const result = await uploadVideo(file, (progress) => {
        setVideoUploadProgress(progress)
      })

      setValue('videoUrl', result.videoUrl)
      if (result.audioUrl) {
        setValue('audioUrl', result.audioUrl)
      }
      if (result.transcript) {
        setValue('content', result.transcript)
      }

      toast.success('Video đã được upload thành công!')
    } catch (error: any) {
      console.error('Video upload error:', error)
      toast.error(error.response?.data?.message || 'Không thể upload video')
    } finally {
      setIsUploadingVideo(false)
      setVideoUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
          {watchMediaType === 'video' ? (
            <Play className="h-8 w-8 text-purple-600" />
          ) : (
            <Volume2 className="h-8 w-8 text-purple-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {watchMediaType === 'video' ? 'Upload Video' : 'Chuẩn bị Audio'}
        </h2>
        <p className="text-gray-600">
          {watchMediaType === 'video'
            ? 'Upload file video của bạn'
            : 'Upload audio có sẵn hoặc tạo từ văn bản'}
        </p>
      </div>

      {/* Media Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setValue('mediaType', 'audio')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              watchMediaType === 'audio'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Volume2 className="h-4 w-4 inline mr-2" />
            Audio
          </button>
          <button
            type="button"
            onClick={() => setValue('mediaType', 'video')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              watchMediaType === 'video'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Play className="h-4 w-4 inline mr-2" />
            Video
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {watchMediaType === 'video' ? (
          /* Video Upload */
          <div className="space-y-4">
            {!watch('videoUrl') ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="videoFile"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleVideoUpload(file)
                  }}
                  className="hidden"
                  disabled={isUploadingVideo}
                />
                <label htmlFor="videoFile" className="cursor-pointer">
                  {isUploadingVideo ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <p className="text-gray-600">Đang upload video...</p>
                      <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${videoUploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {videoUploadProgress}%
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-16 w-16 mx-auto text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Click để chọn video
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          MP4, AVI, MOV, WebM (Max 500MB)
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Play className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">
                        Video đã upload thành công
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Transcript sẽ tự động điền ở bước tiếp theo
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setValue('videoUrl', '')
                      setValue('audioUrl', '')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Audio Mode */
          <>
            {/* Audio Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAudioMode('upload')
                    setValue('audioMode', 'upload')
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    audioMode === 'upload'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioMode('generate')
                    setValue('audioMode', 'generate')
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    audioMode === 'generate'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  <Mic className="h-4 w-4 inline mr-2" />
                  Tạo từ Text
                </button>
              </div>
            </div>

            {audioMode === 'upload' ? (
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Upload file audio
                </Label>
                <DragDropFile
                  accept="audio/*"
                  label="Audio File"
                  help="Chấp nhận MP3, WAV"
                  onUploaded={(url) => {
                    setPreviewUrl(url)
                    setValue('audioUrl', url)
                    const audio = new Audio(url)
                    audio.addEventListener('loadedmetadata', () => {
                      onAudioDurationChange(audio.duration)
                    })
                  }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voiceType" className="text-sm font-medium">
                      Giọng đọc
                    </Label>
                    <select
                      id="voiceType"
                      {...register('voiceType')}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    >
                      <option value="female_en_us">Nữ (Mỹ)</option>
                      <option value="male_en_us">Nam (Mỹ)</option>
                      <option value="female_en_uk">Nữ (Anh)</option>
                      <option value="male_en_uk">Nam (Anh)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="speechSpeed"
                      className="text-sm font-medium"
                    >
                      Tốc độ
                    </Label>
                    <select
                      id="speechSpeed"
                      {...register('speechSpeed', { valueAsNumber: true })}
                      className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    >
                      <option value={0.8}>Chậm (0.8x)</option>
                      <option value={1.0}>Bình thường (1.0x)</option>
                      <option value={1.2}>Nhanh (1.2x)</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={isGenerating}
                  className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Tạo Audio
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Audio sẽ được tạo từ nội dung văn bản bạn nhập ở bước tiếp
                  theo
                </p>
              </div>
            )}

            {/* Audio Preview */}
            {previewUrl && (
              <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
                <Label className="text-sm font-medium mb-3 block">
                  Preview Audio
                </Label>
                <audio controls src={previewUrl} className="w-full" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
