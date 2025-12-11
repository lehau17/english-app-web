import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState, type JSX } from 'react'
import type { MatchingContent } from '../../../types/learn.type'

export function MatchingActivity({
  data,
  onPass,
}: {
  data: MatchingContent
  onPass: () => void
}): JSX.Element {
  const pairs = useMemo(() => data.pairs ?? [], [data.pairs])
  const rights = useMemo(() => pairs.map((p) => p.right), [pairs])
  const shuffledRights = useMemo(() => {
    const arr = [...rights]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [rights])

  // State for connections - simpler approach with click-to-connect
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [connections, setConnections] = useState<
    Array<{ leftIndex: number; rightIndex: number }>
  >([])
  const [checked, setChecked] = useState(false)

  const handleLeftClick = (leftIndex: number) => {
    if (checked) return

    // If this item is already connected, disconnect it
    const existingConnection = connections.find(
      (conn) => conn.leftIndex === leftIndex
    )
    if (existingConnection) {
      setConnections((prev) =>
        prev.filter((conn) => conn.leftIndex !== leftIndex)
      )
      return
    }

    setSelectedLeft(leftIndex)
  }

  const handleRightClick = (rightIndex: number) => {
    if (checked || selectedLeft === null) return

    // Remove any existing connection to this right item
    setConnections((prev) =>
      prev.filter((conn) => conn.rightIndex !== rightIndex)
    )

    // Add new connection
    setConnections((prev) => [...prev, { leftIndex: selectedLeft, rightIndex }])
    setSelectedLeft(null)
  }

  const handleCheck = () => {
    setChecked(true)
    const correctAll =
      connections.length === pairs.length &&
      connections.every((conn) => {
        const leftItem = pairs[conn.leftIndex]
        const rightItem = shuffledRights[conn.rightIndex]
        return leftItem.right === rightItem
      })
    if (correctAll) onPass()
  }

  const handleRetry = () => {
    setConnections([])
    setSelectedLeft(null)
    setChecked(false)
  }

  // Hotkeys for Matching: Space = check, Escape = clear selection
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && !checked && connections.length === pairs.length) {
        e.preventDefault()
        handleCheck()
      } else if (e.key === 'Escape' && selectedLeft !== null) {
        e.preventDefault()
        setSelectedLeft(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, connections, pairs, selectedLeft])

  const getConnectionResult = (leftIndex: number) => {
    if (!checked) return null
    const connection = connections.find((conn) => conn.leftIndex === leftIndex)
    if (!connection) return null
    const leftItem = pairs[leftIndex]
    const rightItem = shuffledRights[connection.rightIndex]
    return leftItem.right === rightItem
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold mb-4">Nhấn để ghép cặp tương ứng</h3>
        <p className="text-sm text-gray-600 mb-6">
          Nhấn vào một từ bên trái, sau đó nhấn vào nghĩa tương ứng bên phải để
          tạo kết nối.
        </p>

        <div className="relative">
          {/* Main content grid */}
          <div className="grid grid-cols-2 gap-24">
            {/* Left column */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">
                Từ/Cụm từ
              </h4>
              {pairs.map((pair, leftIndex) => {
                const isConnected = connections.some(
                  (conn) => conn.leftIndex === leftIndex
                )
                const isSelected = selectedLeft === leftIndex
                const connectionResult = getConnectionResult(leftIndex)

                return (
                  <div
                    key={leftIndex}
                    onClick={() => handleLeftClick(leftIndex)}
                    className={`relative rounded-lg border-2 px-4 py-4 text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                      checked
                        ? connectionResult === true
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : connectionResult === false
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 bg-gray-50 text-gray-500'
                        : isSelected
                          ? 'border-blue-500 bg-blue-100 text-blue-800 ring-2 ring-blue-200'
                          : isConnected
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <span>{pair.left}</span>

                    {/* Connection indicator */}
                    <div className="flex items-center gap-2">
                      {isSelected && !checked && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <span className="animate-pulse">Chọn nghĩa →</span>
                        </div>
                      )}

                      {isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            checked
                              ? connectionResult === true
                                ? 'bg-green-500'
                                : connectionResult === false
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                              : 'bg-blue-500'
                          }`}
                        />
                      )}

                      {!isConnected && !isSelected && (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    {/* Connection line endpoint */}
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />
                  </div>
                )
              })}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Nghĩa</h4>
              {shuffledRights.map((rightItem, rightIndex) => {
                const connection = connections.find(
                  (conn) => conn.rightIndex === rightIndex
                )
                const isConnected = !!connection
                const canConnect = selectedLeft !== null && !isConnected
                const connectionResult = connection
                  ? getConnectionResult(connection.leftIndex)
                  : null

                return (
                  <div
                    key={rightIndex}
                    onClick={() => handleRightClick(rightIndex)}
                    className={`relative rounded-lg border-2 px-4 py-4 text-sm cursor-pointer transition-all flex items-center justify-between ${
                      checked
                        ? connectionResult === true
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : connectionResult === false
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-gray-300 bg-gray-50 text-gray-500'
                        : canConnect
                          ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500 hover:bg-yellow-100'
                          : isConnected
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    {/* Connection line startpoint */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full" />

                    <div className="flex items-center gap-2">
                      {/* Connection indicator */}
                      {isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            checked
                              ? connectionResult === true
                                ? 'bg-green-500'
                                : connectionResult === false
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                              : 'bg-blue-500'
                          }`}
                        />
                      )}

                      {!isConnected && (
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            canConnect
                              ? 'border-yellow-400 bg-yellow-100'
                              : 'border-gray-300'
                          }`}
                        />
                      )}
                    </div>

                    <span className="flex-1">{rightItem}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Visual connection lines */}
          <div className="absolute inset-0 pointer-events-none">
            {connections.map((conn, index) => {
              const leftY = 73 + conn.leftIndex * 68 // Approximate positioning
              const rightY = 73 + conn.rightIndex * 68
              const connectionResult = getConnectionResult(conn.leftIndex)
              const lineColor = checked
                ? connectionResult === true
                  ? '#10b981'
                  : connectionResult === false
                    ? '#ef4444'
                    : '#6b7280'
                : '#3b82f6'

              return (
                <div key={index} className="absolute inset-0">
                  <svg className="w-full h-full">
                    {/* Dotted connection line */}
                    <line
                      x1="42%"
                      y1={leftY}
                      x2="58%"
                      y2={rightY}
                      stroke={lineColor}
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeDasharray="4,6"
                      className="drop-shadow-sm"
                    />

                    {/* Multiple connection dots along the line */}
                    {Array.from({ length: 7 }).map((_, dotIndex) => {
                      const progress = dotIndex / 6 // 0 to 1
                      const dotX = 42 + (58 - 42) * progress // Interpolate X
                      const dotY = leftY + (rightY - leftY) * progress // Interpolate Y
                      const dotSize = dotIndex === 0 || dotIndex === 6 ? 8 : 4 // Larger dots at ends

                      return (
                        <circle
                          key={dotIndex}
                          cx={`${dotX}%`}
                          cy={dotY}
                          r={dotSize}
                          fill={lineColor}
                          className="drop-shadow-sm"
                        />
                      )
                    })}
                  </svg>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action buttons and results */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
          <div className="flex items-center gap-2">
            {!checked ? (
              <button
                onClick={handleCheck}
                disabled={connections.length !== pairs.length}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition ${
                  connections.length !== pairs.length
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Kiểm tra
              </button>
            ) : (
              <>
                {connections.every((conn) => {
                  const leftItem = pairs[conn.leftIndex]
                  const rightItem = shuffledRights[conn.rightIndex]
                  return leftItem.right === rightItem
                }) ? (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
                    <CheckCircle2 className="h-4 w-4" /> Chính xác!
                  </div>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700"
                  >
                    <RotateCcw className="h-4 w-4" /> Làm lại
                  </button>
                )}
              </>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Đã nối: {connections.length}/{pairs.length} cặp
          </div>
        </div>

        {/* Results */}
        {checked && (
          <div className="mt-4 p-4 rounded-lg border-l-4 border-blue-500 bg-blue-50">
            <div className="text-sm">
              <span className="font-semibold text-blue-800">Kết quả: </span>
              <span
                className={`font-bold ${
                  connections.every((conn) => {
                    const leftItem = pairs[conn.leftIndex]
                    const rightItem = shuffledRights[conn.rightIndex]
                    return leftItem.right === rightItem
                  })
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {
                  connections.filter((conn) => {
                    const leftItem = pairs[conn.leftIndex]
                    const rightItem = shuffledRights[conn.rightIndex]
                    return leftItem.right === rightItem
                  }).length
                }
                /{pairs.length} đúng
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
          <p>
            <strong>Hướng dẫn:</strong>
          </p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Nhấn vào một từ bên trái để chọn</li>
            <li>Sau đó nhấn vào nghĩa tương ứng bên phải để tạo kết nối</li>
            <li>Nhấn lại vào từ đã kết nối để hủy kết nối</li>
            <li>Đường nối sẽ hiển thị khi bạn ghép cặp thành công</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
