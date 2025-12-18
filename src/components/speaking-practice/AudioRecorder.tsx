import React, { useMemo } from 'react'
import { Mic, MicOff, Trash2 } from 'lucide-react'

interface AudioRecorderProps {
  isRecording: boolean
  audioBlob: Blob | null
  onStartRecording: () => void
  onStopRecording: () => void
  onClearRecording: () => void
  disabled?: boolean
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onClearRecording,
  disabled = false,
}) => {
  const audioUrl = useMemo(
    () => (audioBlob ? URL.createObjectURL(audioBlob) : null),
    [audioBlob]
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={disabled}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all transform hover:scale-105
          ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isRecording ? (
          <MicOff className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
      </button>

      <div className="text-sm text-gray-600">
        {isRecording ? 'Dang ghi am... Nhan de dung' : 'Nhan de ghi am'}
      </div>

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-2">
          <audio src={audioUrl!} controls className="h-10" />
          <button
            onClick={onClearRecording}
            className="p-2 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
