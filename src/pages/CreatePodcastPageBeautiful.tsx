import {
  BookOpen,
  Clock,
  Eye,
  FileText,
  Mic,
  Settings,
  Tag,
  Upload,
  Volume2,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { apiTranSlation } from '../services/translate.api'
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
  tags: string[]
  __tag_input?: string
}

export const CreatePodcastPageUpdated: React.FC = () => {
  const navigate = useNavigate()
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('generate')
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
      audioMode: 'generate',
      voiceType: 'female_en_us',
      speechSpeed: 1,
      category: 'education',
      difficulty: 'intermediate',
      tags: [],
    },
  })

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    if (!sec || !Number.isFinite(sec)) return 'Unknown'
    const minutes = Math.floor(sec / 60)
    const seconds = Math.floor(sec % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const createPodcastMutation = useCreatePodcast()
  const watchContent = watch('content')
  const tagInput = (watch('__tag_input') as string) || ''
  const isLoading = createPodcastMutation.isPending

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
      alert('Vui lòng nhập nội dung để tạo audio')
      return
    }

    setIsGenerating(true)
    try {
      const response = await apiTranSlation(content)

      setPreviewUrl(response.data.url)
      setValue('audioUrl', response.data.url)
      // Load duration from generated audio
      try {
        const audio = new Audio(response.data.url)
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration || 0)
        })
      } catch {
        // fallback: duration will be set by <audio onLoadedMetadata>
      }
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
      navigate('/listening-practice')
    } catch (error) {
      console.error('Create podcast error:', error)
      alert('Có lỗi xảy ra khi tạo podcast')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/listening-practice')}
            className="mb-4 -ml-2 hover:bg-white/50"
          >
            Quay lại
          </Button>

          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Tạo Podcast Mới
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Thông tin cơ bản</CardTitle>
                    <CardDescription>
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

            {/* Content Section */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {audioMode === 'upload'
                        ? 'Transcript'
                        : 'Nội dung văn bản'}
                    </CardTitle>
                    <CardDescription>
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

            {/* Audio Section */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Audio</CardTitle>
                    <CardDescription>
                      {audioMode === 'upload'
                        ? 'Upload file audio của bạn'
                        : 'Tạo audio từ văn bản'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Mode Selection Tabs */}
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
                      <Label className="font-medium">Upload file audio</Label>
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
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      {isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang tạo audio...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          Tạo Audio
                        </div>
                      )}
                    </Button>
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
              </CardContent>
            </Card>

            {/* Category and Difficulty */}
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Phân loại</CardTitle>
                    <CardDescription>
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
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Thẻ từ khóa</CardTitle>
                    <CardDescription>
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
                    variant="outline"
                    onClick={handleAddTag}
                    className="px-6 h-11 bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 hover:from-orange-600 hover:to-red-700"
                  >
                    Thêm
                  </Button>
                </div>

                {((watch('tags') || []) as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {((watch('tags') || []) as string[]).map((tag, index) => (
                      <Badge
                        key={index}
                        className="gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 hover:from-orange-200 hover:to-red-200"
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
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Thumbnail</CardTitle>
                    <CardDescription>
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
            <Card className="sticky top-6 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Tổng quan</CardTitle>
                    <CardDescription>
                      Xem nhanh thông số bài nghe
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      Số từ
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {getWordCount(watchContent)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center">
                    <div className="text-xs text-purple-600 font-medium mb-1">
                      Ước tính
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      ~
                      {getEstimatedDuration(
                        watchContent,
                        (watch('speechSpeed') as number) || 1.0
                      )}
                      m
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-slate-50 p-4">
                  <div className="text-xs text-gray-600 font-medium mb-3 flex items-center gap-2">
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
                      !previewUrl
                    }
                    className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Đang tạo...
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
