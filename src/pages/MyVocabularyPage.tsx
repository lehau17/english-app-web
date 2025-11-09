import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Target,
  TrendingUp,
} from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useMyVocabularyLists, useReviewStats } from '../hooks/vocabulary.hooks'

const MyVocabularyPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: myLists, isLoading } = useMyVocabularyLists()
  const { data: overallStats } = useReviewStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate('/vocabulary')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm sm:text-base">Back to Browse</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Vocabulary Collection
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Track your progress and review vocabulary
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Overall Stats */}
        {overallStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Total Terms
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {overallStats.totalTerms}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Mastered
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">
                    {overallStats.masteredCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Due Today
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">
                    {overallStats.dueToday}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    Streak
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    {overallStats.currentStreak}{' '}
                    <span className="text-sm sm:text-base">days</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Review Button */}
        {overallStats && overallStats.dueToday > 0 && (
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  Ready to review?
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  You have {overallStats.dueToday} cards due for review today
                </p>
              </div>
              <Button
                onClick={() => navigate('/vocabulary/review')}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Start Review</span>
              </Button>
            </div>
          </Card>
        )}

        {/* My Lists */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            My Lists
          </h2>
          <span className="text-xs sm:text-sm text-gray-600">
            {myLists?.length || 0} lists
          </span>
        </div>

        {myLists && myLists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {myLists.map((list) => (
              <Card
                key={list.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/vocabulary/lists/${list.id}`)}
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {list.thumbnailUrl ? (
                    <img
                      src={list.thumbnailUrl}
                      alt={list.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-white opacity-80" />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {list.title}
                  </h3>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{list.totalTerms} terms</span>
                    <span className="capitalize">{list.difficulty}</span>
                  </div>

                  {/* Progress */}
                  {list.userProgress && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>
                          {list.userProgress.completedTerms}/
                          {list.userProgress.totalTerms}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${(list.userProgress.completedTerms / list.userProgress.totalTerms) * 100}%`,
                          }}
                        />
                      </div>
                      {list.userProgress.lastStudiedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last studied:{' '}
                          {new Date(
                            list.userProgress.lastStudiedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/vocabulary/review/${list.id}`)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Review
                    <ChevronRight className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No vocabulary lists yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your vocabulary collection by adding lists
            </p>
            <Button
              onClick={() => navigate('/vocabulary')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Lists
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}

export default MyVocabularyPage
