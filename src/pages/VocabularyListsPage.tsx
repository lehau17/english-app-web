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
  console.log('📊 Vocabulary Page Data:', {
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
      <div className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo/Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Learn English Vocabulary
                </h1>
                <p className="text-blue-600 mt-1 font-medium">
                  Master English vocabulary with spaced repetition system
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/vocabulary/my-lists')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              My Vocabulary
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Learning Statistics - Parroto Style */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Learning Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Cards */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Cards
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalCards}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Reviews
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalReviews || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Due */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Due</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats?.dueToday || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Accuracy</p>
                  <p className="text-3xl font-bold text-green-600">
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Vocabulary Status
          </h2>
          <div className="grid grid-cols-4 gap-6 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-cyan-500 mb-1">
                {learning}
              </p>
              <p className="text-sm text-gray-600 font-medium">Learning</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500 mb-1">
                {reviewing}
              </p>
              <p className="text-sm text-gray-600 font-medium">Reviewing</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500 mb-1">
                {mastered}
              </p>
              <p className="text-sm text-gray-600 font-medium">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-400 mb-1">
                {totalCards}
              </p>
              <p className="text-sm text-gray-600 font-medium">Total Cards</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
