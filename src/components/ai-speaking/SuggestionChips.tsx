import React from 'react'

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSelect,
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      <p className="text-xs text-gray-500 font-medium">Select a suggestion:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-colors duration-200 border border-blue-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
