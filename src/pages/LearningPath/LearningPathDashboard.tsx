// Learning Path Dashboard - Phase 5 Student UX
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useLearningPathWebSocket } from '../../hooks/useLearningPathWebSocket'
import {
  DynamicActivityFeed,
  SkillProgressChart,
  PerformanceTrends,
  MilestoneBadges,
  ActivityExplanation,
} from './components'

interface LearningPathData {
  id: string
  name: string
  description: string
  skills: Array<{
    name: string
    mastery: number
    trend: 'improving' | 'stable' | 'declining'
  }>
  milestones: Array<{
    percentage: number
    achieved: boolean
    unlockedAt?: string
  }>
  recentScores: number[]
  trendAnalysis: {
    trend: 'improving' | 'declining' | 'stable'
    avgScore: number
    message: string
  }
}

interface Activity {
  id: string
  title: string
  type: string
  difficulty: number
  estimatedTime: number
  status: 'pending' | 'in_progress' | 'completed'
  isAIGenerated?: boolean
}

interface ActivityExplanationData {
  reason: string
  skillTargets: string[]
  difficulty: number
  estimatedTime: number
}

export const LearningPathDashboard: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>()
  const [selectedActivity, setSelectedActivity] = useState<{
    activity: Activity
    explanation: ActivityExplanationData
  } | null>(null)

  const { data: pathData, isLoading } = useQuery<LearningPathData>({
    queryKey: ['learning-path', pathId],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return {
        id: pathId || '',
        name: 'Your Learning Path',
        description: 'Personalized learning journey',
        skills: [
          { name: 'Vocabulary', mastery: 0.75, trend: 'improving' },
          { name: 'Grammar', mastery: 0.65, trend: 'stable' },
          { name: 'Listening', mastery: 0.55, trend: 'improving' },
          { name: 'Speaking', mastery: 0.45, trend: 'declining' },
          { name: 'Reading', mastery: 0.8, trend: 'improving' },
        ],
        milestones: [
          { percentage: 25, achieved: true, unlockedAt: '2025-01-10' },
          { percentage: 50, achieved: false },
          { percentage: 75, achieved: false },
          { percentage: 100, achieved: false },
        ],
        recentScores: [75, 80, 78, 85, 82, 88, 90],
        trendAnalysis: {
          trend: 'improving',
          avgScore: 82.6,
          message: 'Great progress! Keep up the good work.',
        },
      }
    },
    enabled: !!pathId,
  })

  useLearningPathWebSocket({
    pathId: pathId || '',
    enabled: !!pathId,
  })

  const handleActivityClick = (activity: Activity) => {
    // Fetch explanation for the activity
    // TODO: Replace with actual API call
    const explanation: ActivityExplanationData = {
      reason:
        'This activity targets your weaker skills and helps improve overall balance.',
      skillTargets: ['Speaking', 'Vocabulary'],
      difficulty: activity.difficulty,
      estimatedTime: activity.estimatedTime,
    }
    setSelectedActivity({ activity, explanation })
  }

  const handleCloseExplanation = () => {
    setSelectedActivity(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your learning path...
          </p>
        </div>
      </div>
    )
  }

  if (!pathData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-600 mb-4 text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Learning path not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please check the URL or create a new learning path.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {pathData.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {pathData.description}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity Feed (2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <DynamicActivityFeed
              pathId={pathId || ''}
              onActivityClick={handleActivityClick}
            />
            <PerformanceTrends
              recentScores={pathData.recentScores}
              trendAnalysis={pathData.trendAnalysis}
            />
          </div>

          {/* Right Column - Stats & Progress (1/3 on large screens) */}
          <div className="space-y-6">
            <MilestoneBadges milestones={pathData.milestones} />
            <SkillProgressChart skills={pathData.skills} />
          </div>
        </div>

        {/* Activity Explanation Modal */}
        {selectedActivity && (
          <ActivityExplanation
            activity={selectedActivity.activity}
            explanation={selectedActivity.explanation}
            onClose={handleCloseExplanation}
          />
        )}
      </div>
    </div>
  )
}

export default LearningPathDashboard
