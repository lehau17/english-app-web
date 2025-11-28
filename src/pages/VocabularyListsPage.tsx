import { BookOpen, Target, TrendingUp, Users } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import {
  useMyVocabularyLists,
  useReviewStats,
  useVocabularyLists,
} from '../hooks/vocabulary.hooks'
import type { VocabularyListFilters } from '../types/vocabulary.type'

const VocabularyListsPage: React.FC = () => {
  const navigate = useNavigate()
  const [filters] = useState<VocabularyListFilters>({
    page: 1,
    limit: 20,
  })

  const { data, isLoading } = useVocabularyLists(filters)
  const { data: myLists } = useMyVocabularyLists()
  const { data: stats } = useReviewStats()

  // DEBUG: Log data
  console.log('Vocabulary Page Data:', {
    isLoading,
    hasData: !!data,
    lists: data?.data,
    total: data?.total,
    myLists,
    stats,
  })

  const totalCards =
    myLists?.reduce((sum, list) => sum + list.totalTerms, 0) || 0
  const learning = stats?.learningCount || 0
  const reviewing = stats?.reviewCount || 0
  const mastered = stats?.masteredCount || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Parroto Style (Light Mode) */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Logo/Icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  Learn English Vocabulary
                </h1>
                <p className="text-sm sm:text-base text-blue-600 mt-1 font-medium">
                  Master English vocabulary with spaced repetition system
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/vocabulary/my-lists')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-md w-full sm:w-auto"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="text-sm sm:text-base">My Vocabulary</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Learning Statistics - Parroto Style */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            Learning Statistics
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Cards */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    Total Cards
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {totalCards}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    Total Reviews
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stats?.totalReviews || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Due */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    Due
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                    {stats?.dueToday || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                    Accuracy
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats && stats.totalTerms > 0
                      ? Math.round(
                          ((stats.masteredCount + stats.reviewCount) /
                            stats.totalTerms) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Status - Parroto Style */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Vocabulary Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-500 mb-1">
                {learning}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Learning
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-500 mb-1">
                {reviewing}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Reviewing
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500 mb-1">
                {mastered}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Mastered
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400 mb-1">
                {totalCards}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Total Cards
              </p>
            </div>
          </div>
          {/* Progress Bars */}
          <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-gray-100">
            <div
              className="bg-cyan-500 transition-all"
              style={{
                width: `${totalCards > 0 ? (learning / totalCards) * 100 : 0}%`,
              }}
            />
            <div
              className="bg-blue-500 transition-all"
              style={{
                width: `${totalCards > 0 ? (reviewing / totalCards) * 100 : 0}%`,
              }}
            />
            <div
              className="bg-green-500 transition-all"
              style={{
                width: `${totalCards > 0 ? (mastered / totalCards) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Vocabulary Decks Grid - Parroto Style */}
        {data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {data.data.map((list) => (
              <div
                key={list.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate(`/vocabulary/lists/${list.id}`)}
              >
                {/* Custom Thumbnail - Parroto Style (Light BG) */}
                <div className="h-52 relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-purple-500 flex items-center justify-center p-8">
                  {list.thumbnailUrl ? (
                    <img
                      src={list.thumbnailUrl}
                      alt={list.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center transform group-hover:scale-105 transition-transform">
                      <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-2xl">
                        <BookOpen className="w-14 h-14 text-white drop-shadow-lg" />
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl">
                        <p className="text-3xl font-black text-gray-900">
                          {list.totalTerms}
                        </p>
                        <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                          {list.title.includes('1000')
                            ? 'ENGLISH'
                            : list.title.includes('TOEIC')
                              ? 'ESSENTIAL WORDS'
                              : 'VOCABULARY'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 font-medium">
                          {list.category || 'Essential Words'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {list.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-blue-600 mb-4 font-medium">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{list.totalTerms} cards</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{list.userCount} students</span>
                    </div>
                  </div>

                  {/* Start Learning Button - Parroto Style */}
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg">
                    Start Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No vocabulary lists found</p>
            <p className="text-sm text-gray-500">
              Check browser console for debug info
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VocabularyListsPage
