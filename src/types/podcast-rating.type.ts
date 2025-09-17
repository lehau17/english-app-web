export type PodcastRating = {
  id: string
  userId: string
  podcastId: string
  overallRating: number
  difficultyRating?: number
  qualityRating?: number
  createdAt: string
}

export type PodcastRatingAggregate = {
  averageOverall: number | null
  averageDifficulty: number | null
  averageQuality: number | null
  total: number
}
