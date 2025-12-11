import { RotateCcw } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

interface MatchingActivityProps {
  activity: any
  savedAnswer: any
  onSave: (answer: any) => void
}

interface Point {
  x: number
  y: number
}

// Helper to get element center relative to container
const getRelativeCenter = (
  element: HTMLElement | null,
  container: HTMLElement | null
): Point | null => {
  if (!element || !container) return null
  const elRect = element.getBoundingClientRect()
  const cnRect = container.getBoundingClientRect()

  return {
    x: elRect.left + elRect.width / 2 - cnRect.left,
    y: elRect.top + elRect.height / 2 - cnRect.top,
  }
}

export const MatchingActivity: React.FC<MatchingActivityProps> = ({
  activity,
  savedAnswer,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Prepare items
  const { leftItems, rightItems } = useMemo(() => {
    const pairs = activity.content.pairs || []
    if (pairs.length > 0) {
      return {
        leftItems: pairs.map((p: any) => p.left),
        rightItems: pairs.map((p: any) => p.right),
      }
    }
    return {
      leftItems: activity.content.leftItems || [],
      rightItems: activity.content.rightItems || [],
    }
  }, [activity])

  // State
  // connections: { [leftIndex]: rightIndex }
  // We store INDICES internally for cleaner logic, then map to strings for save
  const [connections, setConnections] = useState<Record<number, number>>({})

  // Dragging state
  const [dragStart, setDragStart] = useState<{
    side: 'left' | 'right'
    index: number
  } | null>(null)
  const [mousePos, setMousePos] = useState<Point | null>(null)

  // Helper to re-initialize connections from savedAnswer (strings) to indices
  useEffect(() => {
    if (!savedAnswer) {
      setConnections({})
      return
    }

    // Map string answers back to indices
    // savedAnswer is { "Left String": "Right String" }
    const newConnections: Record<number, number> = {}

    Object.entries(savedAnswer).forEach(([leftVal, rightVal]) => {
      const lIndex = leftItems.findIndex((l: string) => l === leftVal)
      const rIndex = rightItems.findIndex((r: string) => r === rightVal)

      if (lIndex !== -1 && rIndex !== -1) {
        newConnections[lIndex] = rIndex
      }
    })
    setConnections(newConnections)
    // We only run this on mount or if savedAnswer changes externally (reset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAnswer]) // Be careful with loop

  // Refs for dots to calculate coordinates
  const leftDotsRef = useRef<(HTMLDivElement | null)[]>([])
  const rightDotsRef = useRef<(HTMLDivElement | null)[]>([])

  // Calculate connection lines
  const [lines, setLines] = useState<
    { start: Point; end: Point; key: string }[]
  >([])

  // Recalculate lines on render/resize/connections change
  useEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return

      const newLines = Object.entries(connections)
        .map(([lIdxStr, rIdxStr]) => {
          const lIdx = parseInt(lIdxStr)
          const rIdx = parseInt(rIdxStr as any)

          const start = getRelativeCenter(
            leftDotsRef.current[lIdx],
            containerRef.current
          )
          const end = getRelativeCenter(
            rightDotsRef.current[rIdx],
            containerRef.current
          )

          if (start && end) {
            return { start, end, key: `${lIdx}-${rIdx}` }
          }
          return null
        })
        .filter(Boolean) as any[]

      setLines(newLines)
    }

    // Call initially and on resize
    updateLines()
    window.addEventListener('resize', updateLines)
    // Also use a ResizeObserver for the container if possible, but window resize is usually enough

    // Tiny delay to ensure DOM is painted
    const timer = setTimeout(updateLines, 100)

    return () => {
      window.removeEventListener('resize', updateLines)
      clearTimeout(timer)
    }
  }, [connections, leftItems, rightItems]) // Re-run when connections change

  // Handlers
  const handleDotPointerDown = (
    e: React.PointerEvent,
    side: 'left' | 'right',
    index: number
  ) => {
    e.preventDefault()
    // Stop propagation to avoid scrolling if on mobile?
    // e.stopPropagation();

    // If clicking a connected node, maybe we want to remove the connection?
    // For now, let's just start a new drag which overrides.

    setDragStart({ side, index })

    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStart && containerRef.current) {
      e.preventDefault() // User wants to drag
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStart) return

    // Check if we dropped on a target
    // We can check elements under cursor or use collision detection
    // Simple way: check if target is a dot
    const target = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement
    const dot = target?.closest('[data-match-dot]') as HTMLElement

    if (dot) {
      const side = dot.dataset.side as 'left' | 'right'
      const index = parseInt(dot.dataset.index || '-1')

      if (side && index !== -1 && side !== dragStart.side) {
        // Valid match!
        const newConnections = { ...connections }

        let lIdx, rIdx
        if (dragStart.side === 'left') {
          lIdx = dragStart.index
          rIdx = index
        } else {
          lIdx = index
          rIdx = dragStart.index
        }

        // Remove any existing connections for these nodes (1-to-1)
        // Remove any connection starting from lIdx
        // Remove any connection ending at rIdx

        // 1. Remove if lIdx is already key
        // 2. Remove if rIdx is already value
        const entries = Object.entries(newConnections)
        const filtered = entries.filter(([k, v]) => {
          return parseInt(k) !== lIdx && v !== rIdx
        })

        const nextConnections: Record<number, number> = {}
        filtered.forEach(
          ([k, v]) => (nextConnections[parseInt(k)] = v as number)
        )

        nextConnections[lIdx] = rIdx

        setConnections(nextConnections)
        saveToParent(nextConnections)
      }
    }

    setDragStart(null)
    setMousePos(null)
  }

  const handleReset = () => {
    setConnections({})
    saveToParent({})
  }

  const saveToParent = (conns: Record<number, number>) => {
    // Convert indices back to strings
    const result: Record<string, string> = {}
    Object.entries(conns).forEach(([l, r]) => {
      const lStr = leftItems[parseInt(l)]
      const rStr = rightItems[r as number]
      if (lStr && rStr) {
        result[lStr] = rStr
      }
    })
    onSave(result)
  }

  // Calculate temp line coordinates
  const tempLineCoords = useMemo(() => {
    if (!dragStart || !mousePos || !containerRef.current) return null

    let startPoint: Point | null = null
    const dotsRef = dragStart.side === 'left' ? leftDotsRef : rightDotsRef
    startPoint = getRelativeCenter(
      dotsRef.current[dragStart.index],
      containerRef.current
    )

    if (startPoint) {
      return {
        x1: startPoint.x,
        y1: startPoint.y,
        x2: mousePos.x,
        y2: mousePos.y,
      }
    }
    return null
  }, [dragStart, mousePos])

  return (
    <div className="select-none">
      {/* Instruction / Header */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 italic text-sm">
          Kéo từ điểm tròn bên trái sang điểm tròn bên phải để nối.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded"
        >
          <RotateCcw className="w-4 h-4" /> Làm lại
        </button>
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        className="relative flex justify-between gap-8 p-4 bg-white rounded-xl border border-blue-100 min-h-[300px]"
        style={{ touchAction: 'none' }} // Prevent scrolling while dragging
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        // Handle pointer leave to cancel drag? Maybe not needed if we want to allow dragging outside slightly
        onPointerLeave={() => {
          /* setDragStart(null); setMousePos(null); */
        }}
      >
        {/* SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Permanent Lines */}
          {lines.map((line) => (
            <line
              key={line.key}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke="#2563EB" // blue-600
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Temporary Drag Line */}
          {tempLineCoords && (
            <line
              x1={tempLineCoords.x1}
              y1={tempLineCoords.y1}
              x2={tempLineCoords.x2}
              y2={tempLineCoords.y2}
              stroke="#93C5FD" // blue-300
              strokeWidth="3"
              strokeDasharray="5,5"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Left Column */}
        <div className="flex flex-col justify-around w-5/12 space-y-4 z-20">
          {leftItems.map((text: string, idx: number) => {
            const isConnected = Object.prototype.hasOwnProperty.call(
              connections,
              idx
            )
            return (
              <div
                key={`left-${idx}`}
                className="flex items-center justify-end group"
              >
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mr-4 w-full text-right shadow-sm group-hover:shadow-md transition-shadow">
                  {text}
                </div>
                <div
                  ref={(el) => {
                    leftDotsRef.current[idx] = el
                  }}
                  data-match-dot="true"
                  data-side="left"
                  data-index={idx}
                  onPointerDown={(e) => handleDotPointerDown(e, 'left', idx)}
                  className={`w-6 h-6 rounded-full border-4 cursor-pointer transition-colors ${
                    isConnected
                      ? 'bg-blue-600 border-blue-200'
                      : 'bg-white border-blue-400 hover:bg-blue-100'
                  }`}
                />
              </div>
            )
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col justify-around w-5/12 space-y-4 z-20">
          {rightItems.map((text: string, idx: number) => {
            const isConnected = Object.values(connections).includes(idx)
            return (
              <div key={`right-${idx}`} className="flex items-center group">
                <div
                  ref={(el) => {
                    rightDotsRef.current[idx] = el
                  }}
                  data-match-dot="true"
                  data-side="right"
                  data-index={idx}
                  onPointerDown={(e) => handleDotPointerDown(e, 'right', idx)}
                  className={`w-6 h-6 rounded-full border-4 cursor-pointer transition-colors mr-4 ${
                    isConnected
                      ? 'bg-blue-600 border-blue-200'
                      : 'bg-white border-blue-400 hover:bg-blue-100'
                  }`}
                />
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg w-full shadow-sm group-hover:shadow-md transition-shadow">
                  {text}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
