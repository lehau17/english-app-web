import {
  BookOpen,
  Clock,
  Eye,
  FileText,
  Mic,
  Play,
  Settings,
  Sparkles,
  Tag,
  Upload,
  Volume2,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import DragDropFile from '../components/ui/DragDropFile'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { useCreatePodcast } from '../hooks/podcast.hooks'
import { podcastApi } from '../services/podcast.api'
import { apiTranSlation } from '../services/translate.api'
import { uploadVideo } from '../services/video-upload.api'
import type { CreatePodcastData } from '../types/podcast.type'
import { PodcastMediaType } from '../types/podcast.type'
import {
  extractGapsFromContent,
  previewGapsInContent,
} from '../utils/gapExtractor'

interface FormData {
  title: string
  description: string
  content: string
  mediaType: 'audio' | 'video'
  audioUrl: string
  videoUrl?: string
  category: string
  difficulty: string
  audioMode: 'upload' | 'generate'
  voiceType: string
  speechSpeed: number
  thumbnailUrl?: string
  tags: string[]
  __tag_input?: string
}

export const CreatePodcastPageUpdated: React.FC = () => {
  const navigate = useNavigate()
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('generate')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [gapPreview, setGapPreview] = useState<string>('')
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [ttsStatus, setTtsStatus] = useState<
    'idle' | 'generating' | 'completed' | 'error'
  >('idle')
  const [queuedForTTS, setQueuedForTTS] = useState(false)
  const podcastPollRef = React.useRef<number | null>(null)
  const podcastTimeoutRef = React.useRef<number | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      mediaType: 'audio',
      audioMode: 'generate',
      voiceType: 'female_en_us',
      speechSpeed: 1,
      category: 'education',
      difficulty: 'intermediate',
      tags: [],
    },
  })

  const clearPodcastPolling = React.useCallback(() => {
    if (podcastPollRef.current) {
      clearInterval(podcastPollRef.current)
      podcastPollRef.current = null
    }
    if (podcastTimeoutRef.current) {
      clearTimeout(podcastTimeoutRef.current)
      podcastTimeoutRef.current = null
    }
  }, [])

  React.useEffect(() => {
    return () => {
      clearPodcastPolling()
    }
  }, [clearPodcastPolling])

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    if (!sec || !Number.isFinite(sec)) return 'Unknown'
    const minutes = Math.floor(sec / 60)
    const seconds = Math.floor(sec % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const createPodcastMutation = useCreatePodcast()
  const watchContent = watch('content')
  const watchMediaType = watch('mediaType')
  const tagInput = (watch('__tag_input') as string) || ''
  const isLoading = createPodcastMutation.isPending

  const startPodcastAudioPolling = React.useCallback(
    (podcastId: string) => {
      clearPodcastPolling()
      podcastPollRef.current = setInterval(async () => {
        try {
          const podcast = await podcastApi.getById(podcastId)
          const audioUrl = (podcast as any)?.audioUrl
          if (audioUrl) {
            clearPodcastPolling()
            setValue('audioUrl', audioUrl)
            setPreviewUrl(audioUrl)
            setTtsStatus('completed')
            setQueuedForTTS(false)
            toast.success('Audio podcast đã sẵn sàng và được cập nhật!')
          }
        } catch (error) {
          console.error('Error polling podcast audio status:', error)
        }
      }, 7000)

      podcastTimeoutRef.current = setTimeout(
        () => {
          if (podcastPollRef.current) {
            clearPodcastPolling()
            setTtsStatus('error')
            toast.error(
              'Audio podcast chưa sẵn sàng sau 5 phút. Vui lòng kiểm tra lại sau.'
            )
          }
        },
        5 * 60 * 1000
      )
    },
    [clearPodcastPolling, setValue]
  )

  const voiceOptions = [
    { value: 'female_en_us', label: 'Nữ (Mỹ)' },
    { value: 'male_en_us', label: 'Nam (Mỹ)' },
    { value: 'female_en_uk', label: 'Nữ (Anh)' },
    { value: 'male_en_uk', label: 'Nam (Anh)' },
  ]

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

  // Preview gaps khi content thay đổi
  React.useEffect(() => {
    if (watchContent) {
      const preview = previewGapsInContent(watchContent)
      setGapPreview(preview)
    }
  }, [watchContent])

  // Auto-generate gaps helper
  const [autoDifficulty, setAutoDifficulty] = useState<string>('intermediate')
  const [autoMode, setAutoMode] = useState<'percent' | 'count'>('percent')
  const [autoCount, setAutoCount] = useState<number | ''>('')

  // Count available candidate words for gap generation
  const getAvailableCandidates = (content: string): number => {
    try {
      if (!content || !content.trim()) return 0

      // Strip existing brackets
      content = content.replace(/\[+\s*([^\]]+?)\s*\]+/g, '$1')

      const parts = content.split(/(\b\w+\b)/)
      let candidates = 0
      for (let i = 0; i < parts.length; i++) {
        const token = parts[i]
        if (!token) continue
        if (/^\w+$/.test(token)) {
          // Accept ALL words regardless of length or type
          candidates++
        }
      }
      return candidates
    } catch (error) {
      console.warn('Error counting candidates:', error)
      return 0
    }
  }
  const handleAutoGenerate = async () => {
    const plain = (watch('content') as string) || ''
    if (!plain.trim()) {
      toast.error('Vui lòng nhập nội dung trước khi tự động tạo gaps')
      return
    }
    try {
      const mod = await import('../utils/gapExtractor')
      const arg: any =
        autoMode === 'count' && autoCount !== ''
          ? Number(autoCount)
          : (autoDifficulty as any)
      const newContent = mod.generateAutoGaps(plain, arg)
      setValue('content', newContent)

      // Show helpful message when user requested more than available
      if (autoMode === 'count' && autoCount !== '') {
        const available = getAvailableCandidates(plain)
        if (available > 0 && Number(autoCount) > available) {
          toast.success(
            `Đã tạo ${available} gaps (tối đa có thể với văn bản này)`
          )
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

  // Handle tags
  const handleAddTag = () => {
    const t = (tagInput || '').trim()
    if (!t) return
    const current = (watch('tags') || []) as string[]
    if (!current.includes(t)) {
      setValue('tags', [...current, t])
    }
    setValue('__tag_input', '')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const current = (watch('tags') || []) as string[]
    setValue(
      'tags',
      current.filter((t) => t !== tagToRemove)
    )
  }

  // Handle generate audio from text
  const handleGenerateAudio = async () => {
    const content = watch('content')

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung để tạo audio')
      return
    }

    setIsGenerating(true)
    setTtsStatus('generating')
    try {
      const response = await apiTranSlation(content)

      if (response.data.url) {
        // Audio generated successfully
        setPreviewUrl(response.data.url)
        setValue('audioUrl', response.data.url)
        setTtsStatus('completed')

        // Load duration from generated audio
        try {
          const audio = new Audio(response.data.url)
          audio.addEventListener('loadedmetadata', () => {
            setAudioDuration(Math.floor(audio.duration) || 0)
          })
        } catch {
          // fallback: duration will be set by <audio onLoadedMetadata>
        }
        toast.success('Tạo audio thành công!')
      } else if (
        (response.data as any).queued ||
        (response.data as any).status === 'queued'
      ) {
        // Audio is being generated in background
        setTtsStatus('generating')
        setQueuedForTTS(true)
        toast.success(
          'Audio đang được tạo trong nền. Bạn có thể tiếp tục tạo podcast.'
        )
      }
    } catch (error) {
      console.error('Generate audio error:', error)
      setTtsStatus('error')
      toast.error('Có lỗi xảy ra khi tạo audio')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle video file upload
  const handleVideoUpload = async (file: File) => {
    if (!file) return

    // Validate file type
    const validTypes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/webm',
      'video/x-matroska',
    ]
    if (!validTypes.includes(file.type)) {
      toast.error(
        'Định dạng video không hợp lệ. Chỉ chấp nhận MP4, AVI, MOV, WebM, MKV'
      )
      return
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File quá lớn! Kích thước tối đa: 500MB')
      return
    }

    setIsUploadingVideo(true)
    setVideoUploadProgress(0)

    try {
      const result = await uploadVideo(file, (progress) => {
        setVideoUploadProgress(progress)
      })

      // Auto-fill form fields
      setValue('videoUrl', result.videoUrl)
      if (result.audioUrl) {
        setValue('audioUrl', result.audioUrl)
      }

      // If transcript is available, fill content
      if (result.transcript) {
        setValue('content', result.transcript)
      }

      toast.success(
        `Video đã được upload và xử lý thành công! (${(result.duration / 60).toFixed(1)} phút)`
      )
    } catch (error: any) {
      console.error('Video upload error:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Không thể upload video'

      toast.error(errorMessage)
    } finally {
      setIsUploadingVideo(false)
      setVideoUploadProgress(0)
    }
  }

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    // Validation based on mediaType
    if (formData.mediaType === 'audio') {
      if (!formData.audioUrl && !queuedForTTS) {
        toast.error(
          'Vui lòng cung cấp audio (upload file hoặc generate từ text)'
        )
        return
      }
    } else if (formData.mediaType === 'video') {
      if (!formData.videoUrl) {
        toast.error('Vui lòng cung cấp URL video')
        return
      }
    }

    // Extract gaps từ content
    const { cleanContent, gaps } = extractGapsFromContent(formData.content)

    const createData: CreatePodcastData = {
      title: formData.title,
      description: formData.description,
      content: cleanContent,
      mediaType:
        formData.mediaType === 'video'
          ? PodcastMediaType.VIDEO
          : PodcastMediaType.AUDIO,
      ...(formData.mediaType === 'audio' && {
        audioUrl: formData.audioUrl || '', // Allow empty if queued for TTS
      }),
      ...(formData.mediaType === 'video' && {
        videoUrl: formData.videoUrl,
      }),
      thumbnailUrl: formData.thumbnailUrl,
      category: formData.category,
      difficulty: formData.difficulty,
      audioMode: formData.audioMode,
      voiceType: formData.voiceType,
      speechSpeed: formData.speechSpeed,
      duration: audioDuration,
      gaps,
      // Add metadata for background processing
      ...(queuedForTTS && {
        ttsQueued: true,
        ttsStatus: ttsStatus,
        originalContent: formData.content, // Keep original content for TTS processing
      }),
    }

    try {
      const createdPodcast = await createPodcastMutation.mutateAsync(createData)

      if (queuedForTTS) {
        if (createdPodcast?.id) {
          startPodcastAudioPolling(createdPodcast.id)
        }
        toast.success(
          'Tạo podcast thành công! Audio sẽ được cập nhật khi hoàn thành.'
        )
      } else {
        toast.success('Tạo podcast thành công!')
      }
      navigate('/listening-practice')
    } catch (error) {
      console.error('Create podcast error:', error)
      toast.error('Có lỗi xảy ra khi tạo podcast')
    }
  }

  const getWordCount = (text: string) =>
    (text || '').toString().trim().split(/\s+/).filter(Boolean).length

  const getEstimatedDuration = (text: string, speed: number = 1.0) => {
    const wordCount = getWordCount(text)
    const wordsPerMinute = 150 * speed
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Helper to render text with bracketed words highlighted
  const PreviewWithHighlights: React.FC<{ text: string }> = ({ text }) => {
    if (!text)
      return (
        <div className="text-sm text-muted-foreground">
          (Chưa có nội dung để preview)
        </div>
      )
    const parts = text.split(/(\[[^\]]+\])/g)
    return (
      <div className="prose max-w-full text-sm leading-6 text-gray-800">
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
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/listening-practice')}
            className="mb-4 -ml-2 hover:bg-gray-100"
          >
            Quay lại
          </Button>

          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl shadow-sm mb-3">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo Podcast Mới
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Upload audio có sẵn hoặc tạo bài nghe từ văn bản với AI
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* LEFT: Form */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Thông tin cơ bản
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Nhập tiêu đề và mô tả cho podcast của bạn
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="flex items-center gap-2 font-medium"
                  >
                    <span>Tiêu đề</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                    placeholder="Nhập tiêu đề podcast"
                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.title && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.title.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả ngắn về nội dung podcast"
                    rows={3}
                    className="transition-all focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Type Selection Card */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Loại Media
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Chọn loại nội dung: Audio hoặc Video
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setValue('mediaType', 'audio')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        watchMediaType === 'audio'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Volume2 className="h-4 w-4 inline mr-2" />
                      Audio Podcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('mediaType', 'video')}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        watchMediaType === 'video'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Play className="h-4 w-4 inline mr-2" />
                      Video Podcast
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio/Video Section */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {watchMediaType === 'video' ? (
                      <Play className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {watchMediaType === 'video' ? 'Video' : 'Audio'}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {watchMediaType === 'video'
                        ? 'Nhập URL video của bạn'
                        : audioMode === 'upload'
                          ? 'Upload file audio của bạn'
                          : 'Tạo audio từ văn bản'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {watchMediaType === 'video' ? (
                  /* Video File Upload */
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="videoFile" className="font-medium">
                        Upload Video <span className="text-red-500">*</span>
                      </Label>

                      {!watch('videoUrl') ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            id="videoFile"
                            accept="video/mp4,video/avi,video/quicktime,video/webm,video/x-matroska"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleVideoUpload(file)
                              }
                            }}
                            className="hidden"
                            disabled={isUploadingVideo}
                          />
                          <label htmlFor="videoFile" className="cursor-pointer">
                            {isUploadingVideo ? (
                              <div className="space-y-3">
                                <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-sm text-gray-600">
                                  Đang upload và xử lý video...
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${videoUploadProgress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {videoUploadProgress}%
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  Click để chọn video hoặc kéo thả vào đây
                                </p>
                                <p className="text-xs text-gray-500">
                                  MP4, AVI, MOV, WebM, MKV (Max 500MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <Play className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  Video đã upload thành công
                                </p>
                                <p className="text-xs text-green-600 mt-1 break-all">
                                  {watch('videoUrl')}
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
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          💡 Video sẽ được tự động xử lý:
                          <br />
                          • Upload lên hệ thống
                          <br />
                          • Trích xuất audio
                          <br />• Vui lòng nhập transcript trong tab "Content"
                          bên dưới
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mode Selection Tabs - Only for Audio */}
                    <div className="flex justify-center mb-6">
                      <div className="inline-flex bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setAudioMode('upload')
                            setValue('audioMode', 'upload')
                          }}
                          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            audioMode === 'upload'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Upload className="h-4 w-4 inline mr-2" />
                          Upload Audio
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAudioMode('generate')
                            setValue('audioMode', 'generate')
                          }}
                          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                            audioMode === 'generate'
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Mic className="h-4 w-4 inline mr-2" />
                          Generate từ Text
                        </button>
                      </div>
                    </div>

                    {audioMode === 'upload' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-medium">
                            Upload file audio
                          </Label>
                          <DragDropFile
                            accept="audio/*"
                            label="Audio File"
                            help="Kéo thả file audio (MP3/WAV) vào đây hoặc click để chọn"
                            onUploaded={(url) => {
                              setPreviewUrl(url)
                              setValue('audioUrl', url)
                              // Get audio duration
                              const audio = new Audio(url)
                              audio.addEventListener('loadedmetadata', () => {
                                setAudioDuration(audio.duration)
                              })
                            }}
                          />
                          <p className="text-sm text-muted-foreground">
                            Chấp nhận file MP3, WAV
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="voice"
                              className="flex items-center gap-2 font-medium"
                            >
                              <Volume2 className="h-4 w-4" />
                              Giọng đọc
                            </Label>
                            <select
                              id="voice"
                              {...register('voiceType')}
                              className="h-11 w-full rounded-lg border border-input/30 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20"
                            >
                              {voiceOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="speed" className="font-medium">
                              Tốc độ đọc
                            </Label>
                            <select
                              id="speed"
                              {...register('speechSpeed')}
                              className="h-11 w-full rounded-lg border border-input/30 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20"
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
                          disabled={isGenerating || !watchContent?.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          {isGenerating ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Đang tạo audio...
                            </div>
                          ) : ttsStatus === 'generating' && queuedForTTS ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Audio đang được tạo...
                            </div>
                          ) : ttsStatus === 'completed' ? (
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4" />
                              Tạo lại Audio
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4" />
                              Tạo Audio
                            </div>
                          )}
                        </Button>

                        {/* TTS Status Indicator */}
                        {ttsStatus !== 'idle' && queuedForTTS && (
                          <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50">
                            <div className="flex items-center gap-2 text-amber-800">
                              {ttsStatus === 'generating' && (
                                <>
                                  <div className="w-4 h-4 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin"></div>
                                  <span className="text-sm font-medium">
                                    Audio đang được tạo trong nền...
                                  </span>
                                </>
                              )}
                              {ttsStatus === 'error' && (
                                <>
                                  <span className="text-red-500">⚠️</span>
                                  <span className="text-sm font-medium text-red-700">
                                    Có lỗi khi tạo audio
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-amber-700 mt-1">
                              Bạn có thể tiếp tục tạo podcast. Audio sẽ được cập
                              nhật khi hoàn thành.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Audio Preview */}
                    {previewUrl && (
                      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 border">
                        <Label className="font-medium mb-2 block">
                          Preview Audio
                        </Label>
                        <audio
                          controls
                          src={previewUrl}
                          className="w-full"
                          onLoadedMetadata={(e) =>
                            setAudioDuration(e.currentTarget.duration || 0)
                          }
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Duration:{' '}
                          {audioDuration
                            ? formatDuration(audioDuration)
                            : 'Unknown'}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Content Section */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {audioMode === 'upload'
                        ? 'Transcript'
                        : 'Nội dung văn bản'}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {audioMode === 'upload'
                        ? 'Nhập transcript của audio file'
                        : 'Dán văn bản tiếng Anh mà bạn muốn chuyển thành podcast'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="flex items-center gap-2 font-medium"
                  >
                    <span>
                      {audioMode === 'upload' ? 'Transcript' : 'Văn bản'}
                    </span>
                    <span className="text-red-500">*</span>
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
                    placeholder={
                      audioMode === 'upload'
                        ? 'Nhập transcript của audio. Sử dụng [từ] để đánh dấu chỗ trống...'
                        : 'Dán văn bản tiếng Anh của bạn vào đây. Sử dụng [từ] để đánh dấu chỗ trống...'
                    }
                    rows={12}
                    className="leading-6 transition-all focus:ring-2 focus:ring-green-500/20"
                  />
                  {/* Auto Gap Generator */}
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-emerald-800">
                        Tự động tạo gaps
                      </h4>
                      <div className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        Random selection
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="mb-4">
                      <div className="inline-flex bg-white rounded-lg p-1 border border-emerald-200">
                        <button
                          type="button"
                          onClick={() => setAutoMode('percent')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            autoMode === 'percent'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-emerald-700 hover:text-emerald-900'
                          }`}
                        >
                          Theo độ khó
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoMode('count')}
                          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            autoMode === 'count'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'text-emerald-700 hover:text-emerald-900'
                          }`}
                        >
                          Theo số lượng
                        </button>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-emerald-700">
                          {autoMode === 'percent' ? 'Độ khó' : 'Số gaps'}
                        </label>
                        {autoMode === 'percent' ? (
                          <select
                            value={autoDifficulty}
                            onChange={(e) => setAutoDifficulty(e.target.value)}
                            className="w-full h-9 rounded-md border border-emerald-200 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          >
                            {difficultyOptions.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            <input
                              type="number"
                              min={0}
                              max={getAvailableCandidates(watchContent) || 999}
                              value={autoCount === '' ? '' : String(autoCount)}
                              onChange={(e) => {
                                const v =
                                  e.target.value === ''
                                    ? ''
                                    : Math.max(0, Number(e.target.value))
                                setAutoCount(v === '' ? '' : Number(v))
                              }}
                              placeholder={`Tối đa ${getAvailableCandidates(watchContent) || 0} gaps`}
                              className="w-full h-9 rounded-md border border-emerald-200 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                            {autoCount !== '' &&
                              getAvailableCandidates(watchContent) > 0 &&
                              autoCount >
                                getAvailableCandidates(watchContent) && (
                                <div className="mt-1 text-xs text-amber-600">
                                  ⚠️ Chỉ có{' '}
                                  {getAvailableCandidates(watchContent)} từ khả
                                  dụng
                                </div>
                              )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-emerald-700">
                          {autoMode === 'percent' ? 'Phần trăm' : 'Tối đa'}
                        </label>
                        <div className="h-9 rounded-md border border-emerald-200 bg-emerald-50 px-3 flex items-center text-sm text-emerald-700">
                          {autoMode === 'percent' ? (
                            <>
                              {autoDifficulty === 'beginner' && '40%'}
                              {autoDifficulty === 'elementary' && '50%'}
                              {autoDifficulty === 'intermediate' && '60%'}
                              {autoDifficulty === 'upper_intermediate' && '70%'}
                              {autoDifficulty === 'advanced' && '90%'}
                              <span className="ml-1">ký tự</span>
                            </>
                          ) : (
                            <span>
                              {getAvailableCandidates(watchContent) || 0} từ khả
                              dụng
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAutoGenerate}
                        className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        disabled={autoMode === 'count' && autoCount === ''}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo gaps
                      </Button>
                    </div>

                    <div className="mt-3 text-xs text-emerald-600">
                      💡 Hoặc dùng [từ] để chọn thủ công trong văn bản
                    </div>
                  </div>
                  {errors.content && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.content.message}
                    </div>
                  )}

                  {/* Gap Preview */}
                  {gapPreview && (
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Preview (selected blanks highlighted)
                      </div>
                      <div className="p-3 rounded-md border border-input/30 bg-muted">
                        <PreviewWithHighlights text={watchContent} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-800 font-medium">
                          Số từ
                        </div>
                        <div className="text-xl font-bold text-blue-900">
                          {getWordCount(watchContent)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-purple-800 font-medium">
                          Thời lượng ước tính
                        </div>
                        <div className="text-xl font-bold text-purple-900">
                          ~
                          {getEstimatedDuration(
                            watchContent,
                            (watch('speechSpeed') as number) || 1.0
                          )}{' '}
                          phút
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">💡</span>
                      <div>
                        <div className="font-bold text-blue-900 mb-1">
                          Tip: Tự chọn từ khuyết
                        </div>
                        <div className="text-blue-800">
                          Đặt từ trong [dấu ngoặc vuông] để chọn từ khuyết. Ví
                          dụ: "AI is [transforming] the [world]"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category and Difficulty */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Phân loại
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Chọn danh mục và độ khó của podcast
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-medium">
                      Danh mục
                    </Label>
                    <select
                      id="category"
                      {...register('category')}
                      className="h-11 w-full rounded-lg border border-input/30 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="font-medium">
                      Độ khó
                    </Label>
                    <select
                      id="difficulty"
                      {...register('difficulty')}
                      className="h-11 w-full rounded-lg border border-input/30 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                    >
                      {difficultyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Thẻ từ khóa
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Thêm các từ khóa để dễ tìm kiếm podcast sau này
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex gap-3">
                  <input
                    type="text"
                    {...register('__tag_input')}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Thêm thẻ từ khóa..."
                    className="flex-1 h-11 rounded-md border border-input/30 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="px-6 h-11 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Thêm
                  </Button>
                </div>

                {((watch('tags') || []) as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {((watch('tags') || []) as string[]).map((tag, index) => (
                      <Badge
                        key={index}
                        className="gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 border border-orange-200"
                      >
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-orange-200 rounded-full"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Thumbnail
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Upload ảnh thumbnail (jpg/png) để hiển thị trong danh sách
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-xs">
                    <DragDropFile
                      accept="image/*"
                      label="Thumbnail"
                      help="Kéo thả hình ảnh thumbnail (jpg/png)"
                      onUploaded={(url) => setValue('thumbnailUrl', url)}
                    />
                    <input type="hidden" {...register('thumbnailUrl')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Preview / Actions */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-6 shadow-sm border border-gray-200 bg-white">
              <CardHeader className="border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      Tổng quan
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Xem nhanh thông số bài nghe
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Số từ
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getWordCount(watchContent)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                    <div className="text-xs text-purple-700 font-medium mb-1">
                      Ước tính
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ~
                      {getEstimatedDuration(
                        watchContent,
                        (watch('speechSpeed') as number) || 1.0
                      )}
                      m
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-xs text-gray-700 font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Thiết lập
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-medium text-gray-900">
                        {audioMode === 'upload'
                          ? 'Upload Audio'
                          : 'Generate từ Text'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Danh mục:</span>
                      <span className="font-medium text-gray-900">
                        {
                          categoryOptions.find(
                            (o) => o.value === (watch('category') as string)
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Độ khó:</span>
                      <span className="font-medium text-gray-900">
                        {
                          difficultyOptions.find(
                            (o) => o.value === (watch('difficulty') as string)
                          )?.label
                        }
                      </span>
                    </div>
                    {audioMode === 'generate' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giọng:</span>
                          <span className="font-medium text-gray-900">
                            {
                              voiceOptions.find(
                                (o) =>
                                  o.value === (watch('voiceType') as string)
                              )?.label
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tốc độ:</span>
                          <span className="font-medium text-gray-900">
                            {watch('speechSpeed')}x
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/listening-practice')}
                    className="h-11 border-gray-200 hover:bg-gray-50"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !(watch('title') as string)?.trim() ||
                      !(watch('content') as string)?.trim() ||
                      (!previewUrl && !queuedForTTS)
                    }
                    className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang tạo...
                      </div>
                    ) : queuedForTTS && ttsStatus === 'generating' ? (
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Tạo Podcast (Audio đang xử lý)
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {audioMode === 'upload' ? (
                          <Upload className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                        Tạo Podcast
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePodcastPageUpdated
