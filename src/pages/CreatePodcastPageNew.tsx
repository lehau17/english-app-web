import {
  BookOpen,
  Clock,
  Eye,
  FileText,
  Link,
  Mic,
  Settings,
  Tag,
  Upload,
  Volume2,
  X,
} from 'lucide-react'
import React, { useState, useRef } from 'react'
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

// Simplified form data type - unified approach
type FormValues = {
  // Common required fields
  title: string
  description: string
  content: string // Text content - for both transcript (upload) or text-to-speech (generate)
  category: string
  difficulty: string

  // Optional fields
  thumbnailUrl?: string
  tags: string[]

  // Audio mode
  audioMode: 'upload' | 'generate'

  // Generate mode specific
  voiceType?: string
  speechSpeed?: number

  // Form helper
  __tag_input?: string
}

const CreatePodcastPage: React.FC = () => {
  const navigate = useNavigate()
  const createPodcastMutation = useCreatePodcast()
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      content: '', // Unified content field
      category: 'education',
      difficulty: 'beginner',
      tags: [],
      audioMode: 'generate',
      // Generate mode defaults
      voiceType: 'female_en_us',
      speechSpeed: 1.0,
      thumbnailUrl: '',
    },
  })

  const isLoading = createPodcastMutation.status === 'pending'
  const tagInput = (watch('__tag_input') as string) || ''
  const watchedContent = (watch('content') as string) || ''
  const currentAudioMode = watch('audioMode') as 'upload' | 'generate'

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
    { value: 'culture', label: 'Văn hoá' },
    { value: 'science', label: 'Khoa học' },
    { value: 'travel', label: 'Du lịch' },
    { value: 'study_abroad', label: 'Du học' },
  ]

  const difficultyOptions = [
    { value: 'beginner', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' },
  ]

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

  // Audio handling functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (
      file &&
      (file.type === 'audio/mp3' ||
        file.type === 'audio/wav' ||
        file.type === 'audio/mpeg')
    ) {
      setAudioFile(file)
      const url = URL.createObjectURL(file)
      setAudioUrl(url)
    } else {
      alert('Vui lòng chọn file audio định dạng MP3 hoặc WAV')
    }
  }

  const handleGenerateAudio = async () => {
    if (!watchedContent.trim()) {
      alert('Vui lòng nhập nội dung để tạo audio')
      return
    }

    try {
      setIsGeneratingAudio(true)
      const response = await apiTranSlation(watchedContent)
      if (response.data?.url) {
        setAudioUrl(response.data.url)
      } else {
        alert('Có lỗi khi tạo audio. Vui lòng thử lại!')
      }
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Có lỗi khi tạo audio. Vui lòng thử lại!')
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    console.log('Check value for submit', values)
    try {
      // Normalize tags
      const tagsFromInput = (values.__tag_input || '').toString().trim()
      const tagsArray = Array.isArray(values.tags)
        ? values.tags.filter(Boolean)
        : []
      if (tagsFromInput) tagsArray.push(tagsFromInput)

      // Kiểm tra xem đã có audio chưa
      if (!audioUrl) {
        alert(
          'Vui lòng upload file audio hoặc generate audio trước khi tạo podcast'
        )
        return
      }

      // Build unified payload for BE
      const payload = {
        title: values.title,
        description: values.description,
        content: values.content, // Unified content field
        audioUrl: audioUrl, // From upload or generated
        category: values.category,
        difficulty: values.difficulty,
        tags: tagsArray,
        thumbnailUrl: values.thumbnailUrl || '',
        audioMode: values.audioMode,
        ...(values.audioMode === 'generate' && {
          voiceType: values.voiceType,
          speechSpeed: values.speechSpeed,
        }),
      }

      const result = await createPodcastMutation.mutateAsync(payload)
      navigate(`/listening-practice/${result.id}`)
    } catch (error) {
      console.error('Error creating podcast:', error)
      alert('Có lỗi xảy ra khi tạo podcast. Vui lòng thử lại!')
    }
  }

  const getWordCount = (text: string) =>
    (text || '').toString().trim().split(/\s+/).filter(Boolean).length

  const getEstimatedDuration = (text: string, speed: number = 1.0) => {
    const wordCount = getWordCount(text)
    const wordsPerMinute = 150 * speed
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Tạo Podcast Mới
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tạo podcast từ audio file hoặc generate bằng AI text-to-speech
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Content - Left Side */}
          <div className="lg:col-span-8 space-y-6">
            {/* Audio Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Chế Độ Audio
                </CardTitle>
                <CardDescription>
                  Chọn cách thức tạo audio cho podcast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setValue('audioMode', 'upload')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      currentAudioMode === 'upload'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Upload Audio File
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('audioMode', 'generate')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      currentAudioMode === 'generate'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mic className="h-4 w-4 inline mr-2" />
                    Generate bằng AI
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông Tin Cơ Bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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
                    placeholder="Nhập tiêu đề podcast..."
                    className="h-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.title && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.title.message}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="description"
                    className="flex items-center gap-2 font-medium"
                  >
                    <span>Mô tả</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description', {
                      required: 'Mô tả là bắt buộc',
                    })}
                    placeholder="Mô tả chi tiết về podcast..."
                    className="min-h-[80px] transition-all focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.description && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.description.message}
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="content"
                    className="flex items-center gap-2 font-medium"
                  >
                    <span>Nội dung</span>
                    <span className="text-red-500">*</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (
                      {currentAudioMode === 'upload'
                        ? 'Transcript của audio'
                        : 'Text để tạo audio'}
                      )
                    </span>
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
                      currentAudioMode === 'upload'
                        ? 'Nhập transcript của audio file...'
                        : 'Nhập text để AI tạo thành audio... (có thể sử dụng format [từ] để tạo fill-in-blank)'
                    }
                    className="min-h-[120px] transition-all focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.content && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.content.message}
                    </div>
                  )}

                  {/* Content Stats */}
                  <div className="flex gap-6 text-sm text-gray-500 mt-2">
                    <span>Từ: {getWordCount(watchedContent)}</span>
                    {currentAudioMode === 'generate' && (
                      <span>
                        Thời lượng dự kiến: ~
                        {getEstimatedDuration(
                          watchedContent,
                          (watch('speechSpeed') as number) || 1.0
                        )}{' '}
                        phút
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Mode */}
                {currentAudioMode === 'upload' && (
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2 font-medium">
                        <Upload className="h-4 w-4" />
                        Upload File Audio
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="mb-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Chọn File Audio
                        </Button>
                        <p className="text-sm text-gray-500">
                          Hỗ trợ MP3, WAV (tối đa 50MB)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate Mode */}
                {currentAudioMode === 'generate' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="voiceType" className="font-medium">
                          Giọng đọc
                        </Label>
                        <select
                          id="voiceType"
                          {...register('voiceType')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {voiceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="speechSpeed" className="font-medium">
                          Tốc độ đọc
                        </Label>
                        <select
                          id="speechSpeed"
                          {...register('speechSpeed')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value={0.8}>Chậm (0.8x)</option>
                          <option value={1.0}>Bình thường (1.0x)</option>
                          <option value={1.2}>Nhanh (1.2x)</option>
                          <option value={1.5}>Rất nhanh (1.5x)</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio || !watchedContent.trim()}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Đang tạo audio...
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Audio Player */}
                {audioUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <Label className="font-medium block mb-2">
                      Audio Preview
                    </Label>
                    <audio controls className="w-full">
                      <source src={audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-4 space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài Đặt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category" className="font-medium">
                    Danh mục
                  </Label>
                  <select
                    id="category"
                    {...register('category', {
                      required: 'Danh mục là bắt buộc',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.category.message}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="difficulty" className="font-medium">
                    Độ khó
                  </Label>
                  <select
                    id="difficulty"
                    {...register('difficulty', {
                      required: 'Độ khó là bắt buộc',
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.difficulty && (
                    <div className="text-sm text-red-600 mt-1">
                      {errors.difficulty.message}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="thumbnailUrl" className="font-medium">
                    URL Thumbnail (tuỳ chọn)
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    {...register('thumbnailUrl')}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    {...register('__tag_input')}
                    placeholder="Nhập tag..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                  >
                    Thêm
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(watch('tags') || []).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  disabled={isLoading || !audioUrl}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5 mr-2" />
                      Tạo Podcast
                    </>
                  )}
                </Button>
                {!audioUrl && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Vui lòng có audio trước khi tạo podcast
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePodcastPage
