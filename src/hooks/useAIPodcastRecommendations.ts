import { useQuery } from '@tanstack/react-query'
import { podcastApi } from '../services/podcast.api'

export interface AIInsights {
  difficultyMatch: string
  topicRelevance: string
  learningGoalAlignment: string
}

export interface PodcastRecommendation {
  podcastId: string
  podcast: any // Full podcast object
  reason: string
  matchScore: number
  aiInsights: AIInsights
}

export interface RecommendationResponse {
  recommendations: PodcastRecommendation[]
  userProfile: {
    currentLevel: string
    recentTopics: string[]
    strengths: string[]
    areasToImprove: string[]
  }
  generatedAt: string
}

export function useAIPodcastRecommendations(enabled: boolean = true) {
  return useQuery<RecommendationResponse>({
    queryKey: ['ai-podcast-recommendations'],
    queryFn: () => podcastApi.getAIRecommendations(10),
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Don't retry too many times for AI calls
  })
}
