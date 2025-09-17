import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreatePodcast } from '../hooks/podcast.hooks'
import { apiTranSlation } from '../services/translate.api'
import '../styles/CreatePodcast.css'
import type { CreatePodcastData } from '../types/podcast.type'
import {
  extractGapsFromContent,
  previewGapsInContent,
} from '../utils/gapExtractor'

interface FormData {
  title: string
  description: string
  content: string
  audioUrl: string
  category: string
  difficulty: string
  audioMode: 'upload' | 'generate'
  voiceType: string
  speechSpeed: number
  thumbnailUrl?: string
}

export const CreatePodcastPageNew: React.FC = () => {
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('upload')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [gapPreview, setGapPreview] = useState<string>('')
  const [audioDuration, setAudioDuration] = useState<number>(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      audioMode: 'upload',
      voiceType: 'female_en_us',
      speechSpeed: 1,
      category: 'EDUCATION',
      difficulty: 'INTERMEDIATE',
    },
  })

  const createPodcastMutation = useCreatePodcast()
  const watchContent = watch('content')

  // Preview gaps khi content thay đổi
  React.useEffect(() => {
    if (watchContent) {
      const preview = previewGapsInContent(watchContent)
      setGapPreview(preview)
    }
  }, [watchContent])

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.match(/^audio\/(mp3|wav|mpeg)$/)) {
      alert('Chỉ hỗ trợ file MP3 và WAV')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setValue('audioUrl', url)

    // Get audio duration
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration)
    })
  }

  // Handle generate audio from text
  const handleGenerateAudio = async () => {
    const content = watch('content')

    if (!content.trim()) {
      alert('Vui lòng nhập nội dung để tạo audio')
      return
    }

    setIsGenerating(true)
    try {
      const response = await apiTranSlation(content)

      setPreviewUrl(response.data.url)
      setValue('audioUrl', response.data.url)
      setAudioDuration(4)
    } catch (error) {
      console.error('Generate audio error:', error)
      alert('Có lỗi xảy ra khi tạo audio')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    if (!formData.audioUrl) {
      alert('Vui lòng cung cấp audio (upload file hoặc generate từ text)')
      return
    }

    // Extract gaps từ content
    const { cleanContent, gaps } = extractGapsFromContent(formData.content)

    const createData: CreatePodcastData = {
      title: formData.title,
      description: formData.description,
      content: cleanContent,
      audioUrl: formData.audioUrl,
      thumbnailUrl: formData.thumbnailUrl,
      category: formData.category,
      difficulty: formData.difficulty,
      audioMode: formData.audioMode,
      voiceType: formData.voiceType,
      speechSpeed: formData.speechSpeed,
      duration: audioDuration,
      gaps,
    }

    try {
      await createPodcastMutation.mutateAsync(createData)
      alert('Tạo podcast thành công!')
      // Reset form hoặc redirect
    } catch (error) {
      console.error('Create podcast error:', error)
      alert('Có lỗi xảy ra khi tạo podcast')
    }
  }

  return (
    <div className="create-podcast-container">
      <h1>Tạo Podcast Mới</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="create-podcast-form">
        {/* Audio Mode Selection */}
        <div className="form-group">
          <label>Chế độ Audio:</label>
          <div className="audio-mode-selector">
            <label className="radio-option">
              <input
                type="radio"
                value="upload"
                checked={audioMode === 'upload'}
                onChange={(e) => {
                  setAudioMode('upload')
                  setValue('audioMode', 'upload')
                }}
              />
              Upload file từ máy
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="generate"
                checked={audioMode === 'generate'}
                onChange={(e) => {
                  setAudioMode('generate')
                  setValue('audioMode', 'generate')
                }}
              />
              Generate bằng AI
            </label>
          </div>
        </div>

        {/* Title */}
        <div className="form-group">
          <label>Tiêu đề*</label>
          <input
            {...register('title', { required: 'Tiêu đề là bắt buộc' })}
            type="text"
            placeholder="Nhập tiêu đề podcast"
          />
          {errors.title && (
            <span className="error">{errors.title.message}</span>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Mô tả</label>
          <textarea
            {...register('description')}
            placeholder="Nhập mô tả podcast"
            rows={3}
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label>
            {audioMode === 'upload' ? 'Transcript' : 'Nội dung tạo audio'}*
          </label>
          <textarea
            {...register('content', { required: 'Nội dung là bắt buộc' })}
            placeholder={
              audioMode === 'upload'
                ? 'Nhập transcript của audio. Sử dụng [từ] để đánh dấu chỗ trống'
                : 'Nhập nội dung để tạo audio. Sử dụng [từ] để đánh dấu chỗ trống'
            }
            rows={6}
          />
          {errors.content && (
            <span className="error">{errors.content.message}</span>
          )}

          {/* Gap Preview */}
          {gapPreview && (
            <div className="gap-preview">
              <strong>Preview chỗ trống:</strong>
              <pre>{gapPreview}</pre>
            </div>
          )}
        </div>

        {/* Audio Section */}
        <div className="form-group">
          <label>Audio*</label>

          {audioMode === 'upload' ? (
            <div className="audio-upload-section">
              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileUpload}
                className="file-input"
              />
              <small>Chấp nhận file MP3, WAV</small>
            </div>
          ) : (
            <div className="audio-generate-section">
              {/* Voice Type */}
              <div className="form-group">
                <label>Giọng đọc</label>
                <select {...register('voiceType')}>
                  <option value="female_en_us">Nữ - Mỹ</option>
                  <option value="male_en_us">Nam - Mỹ</option>
                  <option value="female_en_uk">Nữ - Anh</option>
                  <option value="male_en_uk">Nam - Anh</option>
                </select>
              </div>

              {/* Speech Speed */}
              <div className="form-group">
                <label>Tốc độ đọc: {watch('speechSpeed')}x</label>
                <input
                  {...register('speechSpeed', { min: 0.5, max: 2 })}
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={isGenerating}
                className="generate-audio-btn"
              >
                {isGenerating ? 'Đang tạo audio...' : 'Tạo Audio'}
              </button>
            </div>
          )}

          {/* Audio Preview */}
          {previewUrl && (
            <div className="audio-preview">
              <audio controls src={previewUrl} />
              <p>
                Duration:{' '}
                {audioDuration ? `${audioDuration.toFixed(1)}s` : 'Unknown'}
              </p>
            </div>
          )}
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Danh mục</label>
          <select {...register('category')}>
            <option value="EDUCATION">Giáo dục</option>
            <option value="BUSINESS">Kinh doanh</option>
            <option value="TECHNOLOGY">Công nghệ</option>
            <option value="ENTERTAINMENT">Giải trí</option>
            <option value="NEWS">Tin tức</option>
            <option value="LIFESTYLE">Lối sống</option>
          </select>
        </div>

        {/* Difficulty */}
        <div className="form-group">
          <label>Độ khó</label>
          <select {...register('difficulty')}>
            <option value="BEGINNER">Cơ bản</option>
            <option value="INTERMEDIATE">Trung bình</option>
            <option value="ADVANCED">Nâng cao</option>
          </select>
        </div>

        {/* Thumbnail URL */}
        <div className="form-group">
          <label>URL Thumbnail</label>
          <input
            {...register('thumbnailUrl')}
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={createPodcastMutation.isPending}
          className="submit-btn"
        >
          {createPodcastMutation.isPending ? 'Đang tạo...' : 'Tạo Podcast'}
        </button>
      </form>
    </div>
  )
}
