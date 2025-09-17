import api from '../lib/api'
import type { BaseResponse } from '../types/base-response.type'
import type {
  PodcastRating,
  PodcastRatingAggregate,
} from '../types/podcast-rating.type'

export const createOrUpdateRating = async (payload: any) => {
  const res = await api.post('/private/v1/podcast-ratings', payload)
  return res.data
}

export const getAggregateRating = async (podcastId: string) => {
  const res = await api.get<BaseResponse<PodcastRatingAggregate>>(
    `/private/v1/podcast-ratings/public/${podcastId}/aggregate`
  )
  return res.data
}

export const getMyRating = async (podcastId: string) => {
  const res = await api.get<BaseResponse<PodcastRating>>(
    `/private/v1/podcast-ratings/${podcastId}/me`
  )
  return res.data
}

export const deleteMyRating = async (podcastId: string) => {
  const res = await api.delete(`/private/v1/podcast-ratings/${podcastId}`)
  return res.data
}

export const listRatings = async (podcastId: string, page = 1, limit = 10) => {
  const res = await api.get(`/private/v1/podcast-ratings/public/${podcastId}`, {
    params: { page, limit },
  })
  return res.data
}

export const hasUserRated = async (podcastId: string) => {
  const res = await api.get(
    `/private/v1/podcast-ratings/${podcastId}/has-rated`
  )
  return res.data
}
