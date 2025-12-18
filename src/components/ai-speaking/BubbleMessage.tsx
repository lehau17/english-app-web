import { MessageCircle, User } from 'lucide-react'
import React from 'react'
import TextInteractionWrapper from '../common/TextInteractionWrapper'
import { CustomAudioPlayer } from './CustomAudioPlayer'
import { TurnFeedbackPanel } from './TurnFeedbackPanel'

interface BubbleMessageProps {
  role: 'ai' | 'user'
  text?: string | null
  audioUrl?: string | null
  audioUrls?: Record<string, string | null>
  selectedVoice?: string
  createdAt: number
  turnId: string
  onVoiceChange?: (voice: string) => void
  sessionTurn?: any // Pass full turn object for metrics
}

export const BubbleMessage: React.FC<BubbleMessageProps> = ({
  role,
  text,
  audioUrl,
  audioUrls,
  selectedVoice,
  createdAt,
  onVoiceChange,
  sessionTurn,
}) => {
  const isAi = role === 'ai'

  return (
    <div
      className={`flex items-start gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm border-2 ${
          isAi ? 'bg-white border-blue-100' : 'bg-indigo-600 border-indigo-200'
        }`}
      >
        {isAi ? (
          <MessageCircle className="h-5 w-5 text-blue-500" />
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Bubble Content */}
      <div
        className={`flex max-w-[85%] flex-col space-y-2 ${
          isAi ? 'items-start' : 'items-end'
        }`}
      >
        {/* Text Bubble */}
        {text && (
          <div
            className={`px-5 py-3.5 shadow-sm text-[15px] leading-relaxed relative group transition-all duration-200 ${
              isAi
                ? 'rounded-tr-3xl rounded-tl-3xl rounded-br-3xl bg-white text-gray-800'
                : 'rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl bg-indigo-600 text-white'
            }`}
          >
            {text === 'Đang trả lời...' ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" />
                  <div
                    className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  Đang suy nghĩ...
                </p>
              </div>
            ) : text === 'Đang ghi âm...' ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <p className="text-sm font-medium">Đang ghi âm...</p>
              </div>
            ) : text === 'Đang xử lý...' ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-75" />
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-150" />
                <p className="text-sm font-medium text-gray-400 ml-1">
                  Đang xử lý...
                </p>
              </div>
            ) : (
              <TextInteractionWrapper>
                <p className="whitespace-pre-line">{text}</p>
              </TextInteractionWrapper>
            )}

            {/* Timestamp tooltip on hover can be added here if needed */}
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className={`${isAi ? 'pl-1' : 'pr-1'}`}>
            <CustomAudioPlayer
              audioUrl={audioUrl}
              audioUrls={audioUrls}
              selectedVoice={selectedVoice}
              onVoiceChange={onVoiceChange}
              autoPlay={isAi && text !== 'Đang trả lời...'} // Auto-play AI response
            />
            {/* Fallback standard audio used to be here, now replaced */}
          </div>
        )}

        {/* User Evaluation/Feedback Panel */}
        {!isAi && sessionTurn?.evaluation && (
          <div className="w-full max-w-[320px]">
            <TurnFeedbackPanel
              evaluation={sessionTurn.evaluation}
              metrics={sessionTurn.evaluation?.metrics}
              score={sessionTurn.score ?? null}
            />
          </div>
        )}

        <div className="px-1 text-xs text-gray-400 font-medium select-none">
          {new Date(createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
