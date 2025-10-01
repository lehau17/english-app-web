import { useMutation } from '@tanstack/react-query'
import { CloudUpload, StopCircle, Volume } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

interface AudioGenerationOptionsProps {
  value?: string
  onChange: (audioUrl: string) => void
  label?: string
  required?: boolean
  className?: string
}

export function AudioGenerationOptions({
  value,
  onChange,
  label = 'Audio',
  required = false,
  className = '',
}: AudioGenerationOptionsProps) {
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('upload')
  const [textToSpeak, setTextToSpeak] = useState('')
  const [language, setLanguage] = useState('en')
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)

  const generateAudioMutation = useMutation({
    mutationFn: async ({
      text,
      language,
    }: {
      text: string
      language: string
    }) => {
      const response = await api.post(
        '/public/v1/google-translate/free/text-to-speech',
        {
          text,
          language,
        }
      )
      return response.data.data
    },
    onSuccess: (data) => {
      onChange(data.url)
      setAudioPreview(null)
      toast.success('Audio generated successfully')
    },
    onError: (error: any) => {
      console.error('Audio generation error:', error)
      toast.error(error?.response?.data?.message || 'Failed to generate audio')
    },
  })

  const handleAudioModeChange = (mode: 'upload' | 'generate') => {
    setAudioMode(mode)
    if (mode === 'generate') {
      onChange('')
    }
  }

  const handleGenerateAudio = async () => {
    if (!textToSpeak.trim()) return

    try {
      await generateAudioMutation.mutateAsync({
        text: textToSpeak,
        language,
      })
    } catch (error) {
      console.error('Failed to generate audio:', error)
    }
  }

  const handlePlayPreview = () => {
    if (!value) return

    if (audioPreview && !audioPreview.paused) {
      audioPreview.pause()
      setIsPlaying(false)
      return
    }

    const audio = new Audio(value)
    audio.onended = () => setIsPlaying(false)
    audio.onloadstart = () => setIsPlaying(true)
    audio.onerror = () => {
      setIsPlaying(false)
      console.error('Error playing audio')
    }

    setAudioPreview(audio)
    audio.play()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileUrl = URL.createObjectURL(file)
    onChange(fileUrl)
    setAudioPreview(null)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block">
        <span
          className={`text-sm font-medium text-gray-700 ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}
        >
          {label}
        </span>

        <div className="mt-2 space-y-3">
          {/* Mode Selection */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`audio-mode-${Math.random()}`}
                checked={audioMode === 'upload'}
                onChange={() => handleAudioModeChange('upload')}
                className="mr-2"
              />
              <span className="text-sm">Upload File</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`audio-mode-${Math.random()}`}
                checked={audioMode === 'generate'}
                onChange={() => handleAudioModeChange('generate')}
                className="mr-2"
              />
              <span className="text-sm">Generate Audio</span>
            </label>
          </div>

          {/* Upload Mode */}
          {audioMode === 'upload' && (
            <div>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="audio-upload-button"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="audio-upload-button">
                <div className="flex items-center gap-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                  <CloudUpload className="h-4 w-4" />
                  Choose Audio File
                </div>
              </label>
            </div>
          )}

          {/* Generate Mode */}
          {audioMode === 'generate' && (
            <div className="space-y-3">
              <textarea
                placeholder="Enter the text you want to convert to speech..."
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                required
              />

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`language-${Math.random()}`}
                    value="en"
                    checked={language === 'en'}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">English</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`language-${Math.random()}`}
                    value="vi"
                    checked={language === 'vi'}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Vietnamese</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={
                  !textToSpeak.trim() || generateAudioMutation.isPending
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateAudioMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume className="h-4 w-4" />
                    Generate Audio
                  </>
                )}
              </button>
            </div>
          )}

          {/* Audio Preview */}
          {value && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-800">✅ Audio ready!</span>
                <button
                  type="button"
                  onClick={handlePlayPreview}
                  className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900"
                >
                  {isPlaying ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume className="h-4 w-4" />
                      Preview
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  )
}
