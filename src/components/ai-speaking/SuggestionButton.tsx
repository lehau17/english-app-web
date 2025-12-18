import { Lightbulb } from 'lucide-react'
import React, { useState } from 'react'
import { useSuggestions } from '../../hooks/useSuggestions'
import { SuggestionChips } from './SuggestionChips'

interface SuggestionButtonProps {
  sessionId: string
  onSelect: (suggestion: string) => void
  disabled?: boolean
}

export const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  sessionId,
  onSelect,
  disabled = false,
}) => {
  const [showChips, setShowChips] = useState(false)
  const { data, refetch, isLoading, error } = useSuggestions(sessionId)

  const handleClick = async () => {
    if (disabled || isLoading) return

    if (showChips) {
      setShowChips(false)
    } else {
      await refetch()
      setShowChips(true)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onSelect(suggestion)
    setShowChips(false)
  }

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
      >
        <Lightbulb className="w-5 h-5" />
        <span>
          {isLoading
            ? 'Loading suggestions...'
            : showChips
              ? 'Hide suggestions'
              : 'What should I say?'}
        </span>
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-2">
          Failed to load suggestions. Please try again.
        </p>
      )}

      {showChips && data?.suggestions && (
        <SuggestionChips
          suggestions={data.suggestions}
          onSelect={handleSelectSuggestion}
        />
      )}
    </div>
  )
}
