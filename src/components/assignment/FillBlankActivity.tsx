import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, PenTool } from 'lucide-react'

interface FillBlankActivityProps {
  activity: any
  savedAnswer: any
  onSave: (answer: any) => void
}

export const FillBlankActivity: React.FC<FillBlankActivityProps> = ({
  activity,
  savedAnswer,
  onSave,
}) => {
  const [blanks, setBlanks] = useState<string[]>([])
  const [parts, setParts] = useState<string[]>([])

  // State: keys are blank indices (0, 1, 2...), values are the words filled in
  const [filledWords, setFilledWords] = useState<Record<number, string>>({})

  // Initialize
  useEffect(() => {
    const rawBlanks = activity.content.blanks || []
    setBlanks(rawBlanks)

    // Parse passage
    const passage = activity.content.passage || activity.content.sentence || ''
    // Split by [____] or ____
    const splitParts = passage.split(/\[_+\]|_+/g)
    setParts(splitParts)

    // Load saved answer
    if (savedAnswer && typeof savedAnswer === 'object') {
      const initialFilled: Record<number, string> = {}
      Object.entries(savedAnswer).forEach(([key, val]) => {
        if (typeof val === 'string') {
          initialFilled[parseInt(key)] = val
        }
      })
      setFilledWords(initialFilled)
    } else {
      setFilledWords({})
    }
  }, [activity, savedAnswer])

  // Derive available words (in bank)
  // We need to count occurrences in blanks vs used in filledWords
  // Simple approach: Create a pool of available words
  const availableWords = React.useMemo(() => {
    const usedCounts: Record<string, number> = {}
    Object.values(filledWords).forEach((word) => {
      usedCounts[word] = (usedCounts[word] || 0) + 1
    })

    const available: { word: string; id: string }[] = []

    // Count totals in source
    const totalCounts: Record<string, number> = {}
    blanks.forEach((w) => (totalCounts[w] = (totalCounts[w] || 0) + 1))

    // Construct available list
    Object.entries(totalCounts).forEach(([word, count]) => {
      const used = usedCounts[word] || 0
      const remaining = count - used
      for (let i = 0; i < remaining; i++) {
        // Generate unique ID for framer motion key
        available.push({ word, id: `${word}-bank-${i}` })
      }
    })

    return available
  }, [blanks, filledWords])

  // Track which drop zone is currently active (hovered) during drag
  const [activeZone, setActiveZone] = useState<number | null>(null)

  // Helper to find zone under cursor using browser native hit testing
  const findZoneUnderPoint = (point: { x: number; y: number }) => {
    // Hide the dragged element momentarily if needed, but pointerEvents: none in whileDrag should handle it.
    // We use the client coordinates directly.
    const elements = document.elementsFromPoint(point.x, point.y)

    // Find the first element that is a drop zone or inside one
    for (const el of elements) {
      // Check if element itself is a zone
      if (el.hasAttribute('data-drop-zone')) {
        return parseInt(el.getAttribute('data-index') || '-1')
      }
      // Check if parent is a zone (shadow/nested)
      const closest = el.closest('[data-drop-zone]')
      if (closest) {
        return parseInt(closest.getAttribute('data-index') || '-1')
      }
    }
    return -1
  }

  // Drag Handlers
  const handleDrag = (_event: any, info: any) => {
    const index = findZoneUnderPoint(info.point)
    if (index !== activeZone) {
      setActiveZone(index !== -1 ? index : null)
    }
  }

  const handleDragEnd = (_event: any, info: any, word: string) => {
    // Final check on drop
    const targetIndex = findZoneUnderPoint(info.point)

    if (targetIndex !== -1) {
      const newFilled = { ...filledWords }
      newFilled[targetIndex] = word
      setFilledWords(newFilled)
      onSave(newFilled)
    }

    setActiveZone(null)
  }

  const handleRemoveWord = (index: number) => {
    const newFilled = { ...filledWords }
    delete newFilled[index]
    setFilledWords(newFilled)
    onSave(newFilled)
  }

  const handleReset = () => {
    setFilledWords({})
    onSave({})
  }

  return (
    <div className="space-y-6 select-none relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PenTool className="h-5 w-5 text-blue-600" />
          Điền vào chỗ trống
        </h3>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded"
        >
          <RotateCcw className="w-4 h-4" /> Làm lại
        </button>
      </div>

      {/* Word Bank */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 min-h-[100px] sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-blue-50/90">
        <p className="font-medium text-blue-800 mb-3 text-sm">
          Kéo từ bên dưới vào ô trống:
        </p>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {availableWords.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id} // Enable shared layout animation? Complex with varying IDs.
                // Instead, just use layout
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                drag
                dragMomentum={false}
                dragSnapToOrigin={true} // Snaps back if not valid drop (handled by state change re-render)
                onDrag={(e, info) => handleDrag(e, info)}
                onDragEnd={(e, info) => handleDragEnd(e, info, item.word)}
                whileDrag={{
                  scale: 1.1,
                  zIndex: 100,
                  cursor: 'grabbing',
                  pointerEvents: 'none', // CRITICAL: Allows elementFromPoint to see through this element
                }}
                className="bg-white border focus:ring-2 border-blue-300 text-blue-700 px-4 py-2 rounded-full font-medium shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
              >
                {item.word}
              </motion.div>
            ))}
          </AnimatePresence>
          {availableWords.length === 0 && (
            <p className="text-gray-400 italic text-sm py-2">
              Bạn đã sử dụng hết các từ.
            </p>
          )}
        </div>
      </div>

      {/* Passage Area */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 leading-loose text-lg text-gray-800">
        {parts.map((part, index) => {
          // Render the text part
          // If not the last part, render a blank after it
          const showBlank = index < parts.length - 1
          const filledWord = filledWords[index]
          const isActive = activeZone === index

          return (
            <React.Fragment key={index}>
              <span className="whitespace-pre-wrap">{part}</span>
              {showBlank && (
                <span
                  data-drop-zone="true"
                  data-index={index}
                  className={`inline-flex items-center justify-center align-middle mx-1 min-w-[120px] h-[44px] border-b-2 transition-all duration-200 rounded-md px-2
                                ${
                                  filledWord
                                    ? 'border-transparent bg-blue-50/30'
                                    : isActive
                                      ? 'border-green-500 bg-green-100 scale-105 shadow-inner' // Active Highlight
                                      : 'border-blue-400 bg-blue-50/50 hover:bg-blue-100'
                                }
                            `}
                >
                  {filledWord ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1 group w-full justify-center"
                      onClick={() => handleRemoveWord(index)}
                    >
                      {filledWord}
                      <RotateCcw className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  ) : (
                    <span
                      className={`text-sm select-none pointer-events-none transition-colors ${isActive ? 'text-green-700 font-bold' : 'text-blue-200'}`}
                    >
                      ({index + 1})
                    </span>
                  )}
                </span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
