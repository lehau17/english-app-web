import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  RotateCcw,
  Settings,
  Star,
} from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { VocabularyWordsModal } from '../components/vocabulary'
import {
  useAddListToCollection,
  useRemoveListFromCollection,
  useResetUnitProgress,
  useVocabularyList,
  useVocabularyUnit,
  useVocabularyUnits,
} from '../hooks/vocabulary.hooks'
import { getVocabularyUnit } from '../services/vocabulary.api'
import type { VocabularyUnit } from '../types/vocabulary.type'

const VocabularyListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [showWordsModal, setShowWordsModal] = useState(false)
  const [reviewUnitId, setReviewUnitId] = useState<string | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set())
  const [unitsWithTerms, setUnitsWithTerms] = useState<
    Map<string, VocabularyUnit>
  >(new Map())
  const [loadingUnits, setLoadingUnits] = useState<Set<string>>(new Set())

  const { data: list, isLoading: listLoading } = useVocabularyList(listId!)
  const { data: units, isLoading: unitsLoading } = useVocabularyUnits(listId!)
  const { data: reviewUnitData } = useVocabularyUnit(listId!, reviewUnitId!)

  const addMutation = useAddListToCollection()
  const removeMutation = useRemoveListFromCollection()
  const resetProgressMutation = useResetUnitProgress()

  const isInMyCollection = !!list?.userProgress

  const handleToggleCollection = async () => {
    if (!listId) return
    if (isInMyCollection) {
      await removeMutation.mutateAsync(listId)
    } else {
      await addMutation.mutateAsync(listId)
    }
  }

  const handleStartLearning = (unitId?: string) => {
    if (unitId) {
      setSelectedUnitId(unitId)
    }
    navigate(`/vocabulary/review/${listId}${unitId ? `?unitId=${unitId}` : ''}`)
  }

  const handleOpenWordsModal = (unitId: string) => {
    setReviewUnitId(unitId)
    setShowWordsModal(true)
  }

  const handleCloseWordsModal = () => {
    setShowWordsModal(false)
    setReviewUnitId(null)
  }

  const handleToggleUnit = async (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // Check current state before updating
    const isCurrentlyExpanded = expandedUnits.has(unitId)
    const isExpanding = !isCurrentlyExpanded

    // Update expanded state
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      if (isCurrentlyExpanded) {
        next.delete(unitId)
      } else {
        next.add(unitId)
      }
      return next
    })

    // Fetch terms if expanding and not already cached
    if (isExpanding && !unitsWithTerms.has(unitId) && listId) {
      setLoadingUnits((loading) => new Set(loading).add(unitId))
      getVocabularyUnit(listId, unitId)
        .then((unitWithTerms) => {
          setUnitsWithTerms((prev) => {
            const next = new Map(prev)
            next.set(unitId, unitWithTerms)
            return next
          })
        })
        .catch((error) => {
          console.error('Failed to fetch unit terms:', error)
        })
        .finally(() => {
          setLoadingUnits((loading) => {
            const next = new Set(loading)
            next.delete(unitId)
            return next
          })
        })
    }
  }

  const handleStartOver = async (unitId: string) => {
    if (
      !confirm(
        'Are you sure you want to reset your progress? This will delete all your learning history for this unit.'
      )
    ) {
      return
    }

    try {
      await resetProgressMutation.mutateAsync(unitId)
      // Navigate to review page to start fresh
      handleStartLearning(unitId)
    } catch (error) {
      console.error('Failed to reset progress:', error)
      alert('Failed to reset progress. Please try again.')
    }
  }

  if (listLoading || unitsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500" />
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">List not found</p>
          <Button onClick={() => navigate('/vocabulary')} className="mt-4">
            Back to Lists
          </Button>
        </div>
      </div>
    )
  }

  const selectedUnit = units?.find((u) => u.id === selectedUnitId) || units?.[0]

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Light Mode */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-65px)]">
        {/* Left Sidebar - Units List */}
        <div className="w-full lg:w-72 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto max-h-96 lg:max-h-none">
          <div className="p-3 sm:p-4">
            {/* Deck Title */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-2">
              {list.title}
            </h2>

            {/* Add to Collection */}
            {!isInMyCollection ? (
              <Button
                onClick={handleToggleCollection}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-2.5 rounded-xl mb-3 sm:mb-4 text-sm sm:text-base"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Add to My Collection</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleToggleCollection}
                variant="outline"
                className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-2 sm:py-2.5 rounded-xl mb-3 sm:mb-4 text-sm sm:text-base"
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2 fill-current" />
                    <span>In My Collection</span>
                  </>
                )}
              </Button>
            )}

            {/* Units List Heading */}
            <h3 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3">
              Units List
            </h3>

            {/* Units */}
            <div className="space-y-2">
              {units?.map((unit) => {
                const isExpanded = expandedUnits.has(unit.id)
                const isSelected = selectedUnit?.id === unit.id
                const isLoading = loadingUnits.has(unit.id)
                const unitWithTerms = unitsWithTerms.get(unit.id)
                return (
                  <div key={unit.id}>
                    <div
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {/* Unit Icon/Emoji */}
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0 ${
                            isSelected ? 'bg-white/20' : 'bg-blue-100'
                          }`}
                        >
                          📚
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">
                            {unit.title}
                          </p>
                          <p
                            className={`text-xs ${
                              isSelected ? 'text-blue-100' : 'text-blue-600'
                            }`}
                          >
                            {unit.userProgress?.completedTerms ?? 0}/
                            {unit.termCount} cards
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleUnit(unit.id, e)}
                          className={`p-1 rounded transition-transform duration-200 ${
                            isSelected
                              ? 'text-white hover:bg-white/20'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded ? 'Collapse unit' : 'Expand unit'
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {/* Expanded Terms Area */}
                    {isExpanded && (
                      <div
                        className="mt-2 ml-2 pl-4 border-l-2 border-blue-200 overflow-hidden transition-all duration-300"
                        style={{
                          maxHeight: isExpanded ? '1000px' : '0',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        {isLoading ? (
                          <div className="p-4 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            <span className="ml-2 text-sm text-gray-600">
                              Loading terms...
                            </span>
                          </div>
                        ) : unitWithTerms?.terms &&
                          unitWithTerms.terms.length > 0 ? (
                          <div className="space-y-2 py-2 max-h-96 overflow-y-auto">
                            {unitWithTerms.terms.map((term) => (
                              <div
                                key={term.id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-gray-900">
                                        {term.word}
                                      </span>
                                      {term.partOfSpeech && (
                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                          {term.partOfSpeech}
                                        </span>
                                      )}
                                    </div>
                                    {(term.ipaUs || term.pronunciation) && (
                                      <p className="text-gray-600 text-xs mb-1">
                                        /{term.ipaUs || term.pronunciation}/
                                      </p>
                                    )}
                                    {term.translationVi && (
                                      <p className="text-blue-600 font-medium text-xs mb-1">
                                        {term.translationVi}
                                      </p>
                                    )}
                                    {term.definition && (
                                      <p className="text-gray-700 text-xs line-clamp-2">
                                        {term.definition}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-sm text-gray-500">
                            No terms available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main Content - Preview/Start */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {selectedUnit ? (
              (() => {
                const totalCards = selectedUnit.termCount || 0
                const completedCards =
                  selectedUnit.userProgress?.completedTerms || 0
                const isCompleted =
                  completedCards >= totalCards && totalCards > 0
                const currentUnitIndex =
                  units?.findIndex((u) => u.id === selectedUnit.id) ?? 0
                const nextUnit = units?.[currentUnitIndex + 1]

                if (isCompleted) {
                  // Completion Screen
                  return (
                    <div className="text-center py-8">
                      {/* Bird Icon */}
                      <div className="mb-6">
                        <span className="text-8xl">🐦</span>
                      </div>

                      {/* Title */}
                      <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Great Job!
                      </h1>

                      <p className="text-blue-600 text-lg mb-2">
                        You've finished learning new words in this group
                      </p>
                      <p className="text-blue-500 text-sm mb-8 italic">
                        Remember to review regularly for long-term retention!
                      </p>

                      {/* Stats */}
                      <p className="text-blue-600 text-2xl font-bold mb-6">
                        {completedCards} / {totalCards} words studied
                      </p>

                      {/* Status Boxes */}
                      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
                          <p className="text-4xl font-bold text-orange-600">
                            0
                          </p>
                          <p className="text-orange-700 text-sm">Learning</p>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
                          <p className="text-4xl font-bold text-blue-600">0</p>
                          <p className="text-blue-700 text-sm">Reviewing</p>
                        </div>
                        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                          <p className="text-4xl font-bold text-green-600">0</p>
                          <p className="text-green-700 text-sm">Mastered</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-4 mb-4 max-w-2xl mx-auto">
                        <button
                          onClick={() => handleOpenWordsModal(selectedUnit.id)}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 rounded-xl transition-colors"
                        >
                          Review Words
                        </button>
                        {nextUnit ? (
                          <button
                            onClick={() => {
                              setSelectedUnitId(nextUnit.id)
                              handleStartLearning(nextUnit.id)
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
                          >
                            Learn next group
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/vocabulary')}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-xl transition-colors"
                          >
                            Back to Lists
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleStartOver(selectedUnit.id)}
                        disabled={resetProgressMutation.isPending}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-xl transition-colors inline-flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {resetProgressMutation.isPending
                          ? 'Resetting...'
                          : 'Start Over'}
                      </button>

                      {/* Learning group info */}
                      <p className="text-gray-500 text-sm mt-6">
                        Learning group {currentUnitIndex + 1}/
                        {units?.length || 0} • {list?.totalTerms || 0} cards in
                        total deck
                      </p>
                    </div>
                  )
                }

                // Normal Preview Screen
                return (
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-blue-600 font-medium mb-2">
                        Progress - {selectedUnit.title}
                      </p>
                      <p className="text-gray-600">
                        {completedCards} / {totalCards} cards
                      </p>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 mb-8 max-w-2xl mx-auto shadow-xl">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to Learn?
                      </h2>
                      <p className="text-gray-600 mb-2">
                        {totalCards} vocabulary words waiting for you
                      </p>
                      <p className="text-sm text-gray-500">
                        Click "Start Learning" to begin your vocabulary journey
                      </p>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={() => handleStartLearning(selectedUnit.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-12 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Start Learning
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                      Learning group {currentUnitIndex + 1}/{units?.length || 0}{' '}
                      • {list?.totalTerms || 0} cards in total deck
                    </p>
                  </div>
                )
              })()
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600">Select a unit to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Words Review Modal */}
      <VocabularyWordsModal
        unit={reviewUnitData}
        isOpen={showWordsModal}
        onClose={handleCloseWordsModal}
      />
    </div>
  )
}

export default VocabularyListDetailPage
