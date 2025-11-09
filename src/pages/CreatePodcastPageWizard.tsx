import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '../components/ui/button'
import { StepIndicator } from '../components/podcast/create/StepIndicator'
import { BasicInfoForm } from '../components/podcast/create/BasicInfoForm'
import { MediaAndContentForm } from '../components/podcast/create/MediaAndContentForm'
import { GapsForm } from '../components/podcast/create/GapsForm'
import { MetadataForm } from '../components/podcast/create/MetadataForm'
import { useCreatePodcast } from '../hooks/podcast.hooks'
import { extractGapsFromContent } from '../utils/gapExtractor'
import { PodcastMediaType } from '../types/podcast.type'
import type { CreatePodcastData } from '../types/podcast.type'

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

const steps = [
  { id: 1, title: 'Thông tin', description: 'Tiêu đề & mô tả' },
  { id: 2, title: 'Nội dung', description: 'Media & Transcript' },
  { id: 3, title: 'Chỗ trống', description: 'Tạo gaps' },
  { id: 4, title: 'Hoàn tất', description: 'Cài đặt cuối' },
]

export const CreatePodcastPageWizard: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [ttsStatus, setTtsStatus] = useState<
    'idle' | 'generating' | 'completed' | 'error'
  >('idle')
  const [queuedForTTS, setQueuedForTTS] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
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
    mode: 'onBlur',
  })

  const createPodcastMutation = useCreatePodcast()

  const canGoNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title']
        break
      case 2:
        // Media step - validate based on mediaType
        const mediaType = watch('mediaType')
        if (mediaType === 'video') {
          if (!watch('videoUrl')) {
            toast.error('Vui lòng upload video')
            return false
          }
        } else {
          if (!watch('audioUrl') && !queuedForTTS) {
            toast.error('Vui lòng upload hoặc tạo audio')
            return false
          }
        }
        return true
      case 3:
        fieldsToValidate = ['content']
        break
      case 4:
        // Final step, no additional validation needed
        return true
      default:
        return true
    }

    const isValid = await trigger(fieldsToValidate)
    return isValid
  }

  const handleNext = async () => {
    const valid = await canGoNext()
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (formData: FormData) => {
    // Validation
    if (formData.mediaType === 'audio') {
      if (!formData.audioUrl && !queuedForTTS) {
        toast.error('Vui lòng cung cấp audio')
        return
      }
    } else if (formData.mediaType === 'video') {
      if (!formData.videoUrl) {
        toast.error('Vui lòng cung cấp video')
        return
      }
    }

    // Extract gaps
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
        audioUrl: formData.audioUrl || '',
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
      ...(queuedForTTS && {
        ttsQueued: true,
        ttsStatus: ttsStatus,
        originalContent: formData.content,
      }),
    }

    try {
      await createPodcastMutation.mutateAsync(createData)
      toast.success('Tạo podcast thành công!')
      navigate('/listening-practice')
    } catch (error) {
      console.error('Create podcast error:', error)
      toast.error('Có lỗi xảy ra khi tạo podcast')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoForm register={register} errors={errors} />
      case 2:
        return (
          <MediaAndContentForm
            register={register}
            watch={watch}
            setValue={setValue}
            errors={errors}
            onAudioDurationChange={setAudioDuration}
            onTtsStatusChange={setTtsStatus}
            onQueuedForTTS={setQueuedForTTS}
          />
        )
      case 3:
        return <GapsForm watch={watch} setValue={setValue} />
      case 4:
        return (
          <MetadataForm register={register} watch={watch} setValue={setValue} />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/listening-practice')}
            className="mb-6 -ml-2 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Tạo Podcast Mới
            </h1>
            <p className="text-lg text-gray-600">
              Tạo bài nghe tiếng Anh với AI trong 4 bước đơn giản
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-8 mb-12">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="h-12 px-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>

              <div className="text-sm text-gray-600">
                Bước {currentStep} / {steps.length}
              </div>

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tiếp tục
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createPodcastMutation.isPending}
                  className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white"
                >
                  {createPodcastMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Hoàn tất
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePodcastPageWizard
