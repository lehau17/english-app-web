import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
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

const VocabularyListDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [showWordsModal, setShowWordsModal] = useState(false)
  const [reviewUnitId, setReviewUnitId] = useState<string | null>(null)

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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <BookOpen className="h-5 w-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Units List */}
        <div className="w-72 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Deck Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {list.title}
            </h2>

            {/* Add to Collection */}
            {!isInMyCollection ? (
              <Button
                onClick={handleToggleCollection}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl mb-4"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to My Collection
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleToggleCollection}
                variant="outline"
                className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-2.5 rounded-xl mb-4"
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2 fill-current" />
                    In My Collection
                  </>
                )}
              </Button>
            )}

            {/* Units List Heading */}
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              Units List
            </h3>

            {/* Units */}
            <div className="space-y-2">
              {units?.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedUnit?.id === unit.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Unit Icon/Emoji */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        selectedUnit?.id === unit.id
                          ? 'bg-white/20'
                          : 'bg-blue-100'
                      }`}
                    >
                      📚
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{unit.title}</p>
                      <p
                        className={`text-xs ${
                          selectedUnit?.id === unit.id
                            ? 'text-blue-100'
                            : 'text-blue-600'
                        }`}
                      >
                        {unit.userProgress?.completedTerms ?? 0}/
                        {unit.termCount} cards
                      </p>
                    </div>
                  </div>
                  {selectedUnit?.id !== unit.id && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Preview/Start */}
        <div className="flex-1 bg-white overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
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
                        🎉 Great Job!
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
