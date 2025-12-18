import React, { useState, useCallback } from 'react'
import { Volume2, RotateCcw } from 'lucide-react'
import type {
  NextPracticeItem,
  SubmitResult,
} from '../../types/speaking-practice.types'
import { AudioRecorder } from './AudioRecorder'
import { FeedbackPanel } from './FeedbackPanel'
import {
  useAudioRecording,
  useSubmitAttempt,
} from '../../hooks/useSpeakingPractice'

interface PracticeSessionProps {
  item: NextPracticeItem
  onComplete: () => void
  onLevelUp?: () => void
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  item,
  onComplete,
  onLevelUp,
}) => {
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecording()

  const submitMutation = useSubmitAttempt()

  const playReference = useCallback(() => {
    if (item.referenceAudioUrl) {
      setIsPlaying(true)
      const audio = new Audio(item.referenceAudioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.play()
    }
  }, [item.referenceAudioUrl])

  const handleSubmit = useCallback(async () => {
    if (!audioBlob) return

    try {
      // Convert Blob to File for the API
      const audioFile = new File([audioBlob], 'recording.webm', {
        type: audioBlob.type || 'audio/webm',
      })

      const response = await submitMutation.mutateAsync({
        data: {
          lessonId: item.lessonId,
          itemIndex: item.itemIndex,
          referenceText: item.referenceText || item.text,
          attemptNumber: item.attemptNumber,
        },
        audioFile,
      })
      setResult(response)

      if (response.nextAction === 'level_up' && onLevelUp) {
        onLevelUp()
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }, [audioBlob, item, submitMutation, onLevelUp])

  const handleRetry = useCallback(() => {
    setResult(null)
    clearRecording()
  }, [clearRecording])

  const handleNext = useCallback(() => {
    setResult(null)
    clearRecording()
    onComplete()
  }, [clearRecording, onComplete])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      {/* Item Type Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500 uppercase tracking-wide">
          {item.itemType}
        </span>
        {item.phonemeFocus && (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
            /{item.phonemeFocus}/
          </span>
        )}
      </div>

      {/* Text to Practice */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold mb-2">{item.text}</div>
        {item.translation && (
          <div className="text-gray-500 text-sm">{item.translation}</div>
        )}
        {item.phonetic && (
          <div className="text-blue-600 text-sm mt-1">{item.phonetic}</div>
        )}
      </div>

      {/* Reference Audio */}
      {item.referenceAudioUrl && (
        <div className="flex justify-center mb-6">
          <button
            onClick={playReference}
            disabled={isPlaying}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <Volume2 className="w-5 h-5" />
            {isPlaying ? 'Dang phat...' : 'Nghe mau'}
          </button>
        </div>
      )}

      {/* Recording or Result */}
      {result ? (
        <FeedbackPanel
          result={result}
          onRetry={handleRetry}
          onNext={handleNext}
        />
      ) : (
        <div className="space-y-4">
          <AudioRecorder
            isRecording={isRecording}
            audioBlob={audioBlob}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onClearRecording={clearRecording}
            disabled={submitMutation.isPending}
          />

          {audioBlob && !isRecording && (
            <div className="flex justify-center gap-2">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
                Ghi lai
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Dang cham...' : 'Nop bai'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      {item.tips && item.tips.length > 0 && !result && (
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <div className="text-xs font-medium text-yellow-800 mb-1">Meo:</div>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {item.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
