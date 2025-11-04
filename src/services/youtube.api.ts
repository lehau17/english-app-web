import api from '../lib/api'

export interface YouTubeTranscriptSegment {
  text: string
  offset: number // seconds
  duration: number // seconds
}

export interface YouTubeTranscriptResponse {
  transcript: string
  segments: YouTubeTranscriptSegment[]
}

export const youtubeApi = {
  /**
   * Extract transcript from YouTube video
   * @param videoUrl YouTube URL or video ID
   * @returns Transcript text and segments with timestamps
   */
  extractTranscript: async (
    videoUrl: string
  ): Promise<YouTubeTranscriptResponse> => {
    const response = await api.post(
      '/private/v1/podcasts/youtube/extract-transcript',
      { videoUrl }
    )
    return response.data.data
  },
}
