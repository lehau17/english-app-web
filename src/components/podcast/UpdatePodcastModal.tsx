import { ChevronDown, ChevronUp, Edit2, Plus, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useUpdatePodcast } from '../../hooks/podcast.hooks'
import type { PodcastGap, UpdatePodcastGapData } from '../../types/podcast.type'

interface UpdatePodcastModalProps {
  podcast: {
    id: string
    title: string
    description: string
    isPublic?: boolean
    gaps?: PodcastGap[]
    transcript?: string
  }
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const UpdatePodcastModal: React.FC<UpdatePodcastModalProps> = ({
  podcast,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(podcast.title)
  const [description, setDescription] = useState(podcast.description)
  const [isPublic, setIsPublic] = useState(podcast.isPublic ?? true)
  const [gaps, setGaps] = useState<UpdatePodcastGapData[]>([])
  const [isGapsExpanded, setIsGapsExpanded] = useState(false)
  const [editingGapIndex, setEditingGapIndex] = useState<number | null>(null)
  const [newGap, setNewGap] = useState<{
    startIndex: string
    endIndex: string
    answer: string
    orderNo: string
  }>({
    startIndex: '',
    endIndex: '',
    answer: '',
    orderNo: '',
  })
  const [selectedText, setSelectedText] = useState<{
    start: number
    end: number
    text: string
  } | null>(null)
  const [highlightedGapId, setHighlightedGapId] = useState<string | null>(null)

  const updateMutation = useUpdatePodcast()

  useEffect(() => {
    if (isOpen) {
      setTitle(podcast.title)
      setDescription(podcast.description)
      setIsPublic(podcast.isPublic ?? true)
      // Initialize gaps from podcast
      setGaps(
        podcast.gaps?.map((gap) => ({
          id: gap.id,
          startIndex: gap.startIndex,
          endIndex: gap.endIndex,
          answer: gap.answer,
          orderNo: gap.orderNo,
        })) || []
      )
      setIsGapsExpanded(false)
      setEditingGapIndex(null)
      setNewGap({ startIndex: '', endIndex: '', answer: '', orderNo: '' })
      setSelectedText(null)
      setHighlightedGapId(null)
    }
  }, [isOpen, podcast])

  // Handle text selection in transcript
  const handleTranscriptSelect = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setSelectedText(null)
      setHighlightedGapId(null)
      return
    }

    const range = selection.getRangeAt(0)
    const transcriptElement = document.getElementById('transcript-viewer')
    if (!transcriptElement || !range.intersectsNode(transcriptElement)) {
      setSelectedText(null)
      setHighlightedGapId(null)
      return
    }

    // Calculate start and end positions relative to transcript
    // const transcriptText = podcast.transcript || ''
    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(transcriptElement)
    preSelectionRange.setEnd(range.startContainer, range.startOffset)
    const start = preSelectionRange.toString().length

    const selectedText = selection.toString()
    const end = start + selectedText.length

    if (start === end || !selectedText.trim()) {
      setSelectedText(null)
      setHighlightedGapId(null)
      return
    }

    setSelectedText({ start, end, text: selectedText.trim() })

    // Check if selection overlaps with any existing gap
    const overlappingGap = gaps.find(
      (gap) =>
        (start >= gap.startIndex && start < gap.endIndex) ||
        (end > gap.startIndex && end <= gap.endIndex) ||
        (start <= gap.startIndex && end >= gap.endIndex)
    )

    if (overlappingGap && overlappingGap.id) {
      setHighlightedGapId(overlappingGap.id)
    } else {
      setHighlightedGapId(null)
    }
  }

  // Create gap from selected text
  const handleCreateGapFromSelection = () => {
    if (!selectedText) return

    const startIdx = selectedText.start
    const endIdx = selectedText.end
    const answer = selectedText.text

    // Validate
    if (podcast.transcript && endIdx > podcast.transcript.length) {
      alert('Vị trí chọn vượt quá độ dài transcript')
      return
    }

    // Check if already exists
    const existingGap = gaps.find(
      (gap) => gap.startIndex === startIdx && gap.endIndex === endIdx
    )
    if (existingGap) {
      alert('Gap tại vị trí này đã tồn tại')
      return
    }

    setGaps([
      ...gaps,
      {
        startIndex: startIdx,
        endIndex: endIdx,
        answer,
        orderNo: gaps.length + 1,
      },
    ])

    setSelectedText(null)
    setHighlightedGapId(null)
    // Clear selection
    window.getSelection()?.removeAllRanges()
  }

  const handleAddGap = () => {
    const startIdx = parseInt(newGap.startIndex)
    const endIdx = parseInt(newGap.endIndex)
    const orderNo = parseInt(newGap.orderNo) || gaps.length + 1

    if (
      isNaN(startIdx) ||
      isNaN(endIdx) ||
      !newGap.answer.trim() ||
      startIdx < 0 ||
      endIdx <= startIdx
    ) {
      alert('Vui lòng nhập đầy đủ thông tin gap hợp lệ')
      return
    }

    // Validate against transcript if available
    if (podcast.transcript && endIdx > podcast.transcript.length) {
      alert(
        `endIndex (${endIdx}) vượt quá độ dài transcript (${podcast.transcript.length})`
      )
      return
    }

    setGaps([
      ...gaps,
      {
        startIndex: startIdx,
        endIndex: endIdx,
        answer: newGap.answer.trim(),
        orderNo,
      },
    ])
    setNewGap({ startIndex: '', endIndex: '', answer: '', orderNo: '' })
  }

  const handleEditGap = (index: number) => {
    setEditingGapIndex(index)
  }

  const handleSaveGap = (index: number) => {
    const gap = gaps[index]
    const startIdx = gap.startIndex
    const endIdx = gap.endIndex

    if (
      startIdx < 0 ||
      endIdx <= startIdx ||
      !gap.answer.trim() ||
      (podcast.transcript && endIdx > podcast.transcript.length)
    ) {
      alert('Thông tin gap không hợp lệ')
      return
    }

    setEditingGapIndex(null)
  }

  const handleDeleteGap = (index: number) => {
    if (confirm('Bạn có chắc muốn xóa gap này?')) {
      setGaps(gaps.filter((_, i) => i !== index))
    }
  }

  const handleUpdateGap = (
    index: number,
    field: keyof UpdatePodcastGapData,
    value: string | number
  ) => {
    const updatedGaps = [...gaps]
    updatedGaps[index] = { ...updatedGaps[index], [field]: value }
    setGaps(updatedGaps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        id: podcast.id,
        data: {
          title,
          description,
          isPublic,
          gaps: gaps.length > 0 ? gaps : undefined,
        },
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to update podcast:', error)
      alert('Cập nhật thất bại. Vui lòng thử lại.')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Cập nhật Podcast
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tiêu đề
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Công khai (Public)
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              {isPublic
                ? 'Podcast này sẽ hiển thị cho tất cả người dùng'
                : 'Podcast này chỉ hiển thị cho bạn'}
            </p>
          </div>

          {/* Gaps Management Section */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setIsGapsExpanded(!isGapsExpanded)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Quản lý Gaps (Điền từ) ({gaps.length})
              </h3>
              {isGapsExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {isGapsExpanded && (
              <div className="space-y-4">
                {/* Transcript Viewer with Selection */}
                {podcast.transcript && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Transcript (Bôi đen text để tạo gap):
                    </h4>
                    <div
                      id="transcript-viewer"
                      onMouseUp={handleTranscriptSelect}
                      onKeyUp={handleTranscriptSelect}
                      className="relative p-4 bg-white border border-gray-300 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto text-sm leading-relaxed select-text whitespace-pre-wrap"
                      style={{ userSelect: 'text' }}
                    >
                      {(() => {
                        const transcript = podcast.transcript
                        const parts: Array<{
                          text: string
                          start: number
                          end: number
                          className: string
                          title: string
                        }> = []

                        let currentIndex = 0
                        const sortedGaps = [...gaps].sort(
                          (a, b) => a.startIndex - b.startIndex
                        )

                        if (sortedGaps.length === 0) {
                          // No gaps - just add entire transcript
                          parts.push({
                            text: transcript,
                            start: 0,
                            end: transcript.length,
                            className: '',
                            title: '',
                          })
                        } else {
                          sortedGaps.forEach((gap) => {
                            // Add text before gap
                            if (currentIndex < gap.startIndex) {
                              const beforeText = transcript.substring(
                                currentIndex,
                                gap.startIndex
                              )
                              if (beforeText) {
                                parts.push({
                                  text: beforeText,
                                  start: currentIndex,
                                  end: gap.startIndex,
                                  className: '',
                                  title: '',
                                })
                              }
                            }

                            // Add gap text
                            const gapText = transcript.substring(
                              gap.startIndex,
                              gap.endIndex
                            )
                            const isHighlighted = gap.id === highlightedGapId
                            parts.push({
                              text: gapText,
                              start: gap.startIndex,
                              end: gap.endIndex,
                              className: isHighlighted
                                ? 'bg-yellow-300 font-semibold'
                                : 'bg-blue-200',
                              title: `Gap: "${gap.answer}"`,
                            })

                            currentIndex = gap.endIndex
                          })

                          // Add remaining text
                          if (currentIndex < transcript.length) {
                            const remainingText =
                              transcript.substring(currentIndex)
                            if (remainingText) {
                              parts.push({
                                text: remainingText,
                                start: currentIndex,
                                end: transcript.length,
                                className: '',
                                title: '',
                              })
                            }
                          }
                        }

                        // Handle selected text overlay
                        if (selectedText) {
                          return parts.map((part, partIndex) => {
                            const partStart = part.start
                            const partEnd = part.end
                            const selStart = selectedText.start
                            const selEnd = selectedText.end

                            // No overlap
                            if (partEnd <= selStart || partStart >= selEnd) {
                              return (
                                <span
                                  key={partIndex}
                                  className={part.className}
                                  title={part.title}
                                >
                                  {part.text}
                                </span>
                              )
                            }

                            // Full overlap
                            if (partStart >= selStart && partEnd <= selEnd) {
                              return (
                                <span
                                  key={partIndex}
                                  className={`${part.className} bg-green-200`}
                                  title={part.title}
                                >
                                  {part.text}
                                </span>
                              )
                            }

                            // Partial overlap - split
                            const beforeSel = Math.max(partStart, selStart)
                            const afterSel = Math.min(partEnd, selEnd)

                            return (
                              <span key={partIndex}>
                                {partStart < selStart && (
                                  <span
                                    className={part.className}
                                    title={part.title}
                                  >
                                    {part.text.substring(
                                      0,
                                      selStart - partStart
                                    )}
                                  </span>
                                )}
                                <span
                                  className={`${part.className} bg-green-200`}
                                  title={part.title}
                                >
                                  {part.text.substring(
                                    beforeSel - partStart,
                                    afterSel - partStart
                                  )}
                                </span>
                                {partEnd > selEnd && (
                                  <span
                                    className={part.className}
                                    title={part.title}
                                  >
                                    {part.text.substring(afterSel - partStart)}
                                  </span>
                                )}
                              </span>
                            )
                          })
                        }

                        // No selection - render normally
                        return parts.map((part, index) => (
                          <span
                            key={index}
                            className={part.className}
                            title={part.title}
                          >
                            {part.text}
                          </span>
                        ))
                      })()}
                    </div>
                    {selectedText && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Đã chọn:</strong> "{selectedText.text}"
                          <br />
                          <span className="text-xs text-gray-500">
                            Vị trí: {selectedText.start} - {selectedText.end}
                          </span>
                        </div>
                        {highlightedGapId ? (
                          <div className="text-sm text-yellow-700 mb-2">
                            ⚠️ Vị trí này đã có gap. Vui lòng chọn vị trí khác.
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCreateGapFromSelection}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Tạo Gap từ vùng chọn
                          </button>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Bôi đen text trong transcript để tạo gap mới. Gaps hiện
                      có được highlight màu xanh.
                    </div>
                  </div>
                )}

                {/* Existing Gaps List */}
                {gaps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Gaps hiện có:
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {gaps.map((gap, index) => (
                        <div
                          key={gap.id || index}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                        >
                          {editingGapIndex === index ? (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    Start Index
                                  </label>
                                  <input
                                    type="number"
                                    value={gap.startIndex}
                                    onChange={(e) =>
                                      handleUpdateGap(
                                        index,
                                        'startIndex',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">
                                    End Index
                                  </label>
                                  <input
                                    type="number"
                                    value={gap.endIndex}
                                    onChange={(e) =>
                                      handleUpdateGap(
                                        index,
                                        'endIndex',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Đáp án
                                </label>
                                <input
                                  type="text"
                                  value={gap.answer}
                                  onChange={(e) =>
                                    handleUpdateGap(
                                      index,
                                      'answer',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveGap(index)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingGapIndex(null)}
                                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  Hủy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="text-sm text-gray-700">
                                  <span className="font-medium">
                                    #{gap.orderNo || index + 1}:
                                  </span>{' '}
                                  <span className="text-blue-600">
                                    "{gap.answer}"
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    ({gap.startIndex}-{gap.endIndex})
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditGap(index)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Sửa"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGap(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Gap Form */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Thêm Gap mới:
                  </h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Start Index
                        </label>
                        <input
                          type="number"
                          value={newGap.startIndex}
                          onChange={(e) =>
                            setNewGap({ ...newGap, startIndex: e.target.value })
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          End Index
                        </label>
                        <input
                          type="number"
                          value={newGap.endIndex}
                          onChange={(e) =>
                            setNewGap({ ...newGap, endIndex: e.target.value })
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Order No
                        </label>
                        <input
                          type="number"
                          value={newGap.orderNo}
                          onChange={(e) =>
                            setNewGap({ ...newGap, orderNo: e.target.value })
                          }
                          placeholder="Auto"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Đáp án
                      </label>
                      <input
                        type="text"
                        value={newGap.answer}
                        onChange={(e) =>
                          setNewGap({ ...newGap, answer: e.target.value })
                        }
                        placeholder="Nhập đáp án..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGap}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus size={16} />
                      Thêm Gap
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
