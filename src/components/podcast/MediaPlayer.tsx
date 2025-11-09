import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { PodcastMediaType } from '../../types/podcast.type'

interface MediaPlayerProps {
  mediaType: PodcastMediaType
  audioUrl?: string
  videoUrl?: string
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLMediaElement>) => void
  onLoadedMetadata?: () => void
  className?: string
}

export interface MediaPlayerRef {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  setPlaybackRate: (rate: number) => void
}

export const MediaPlayer = forwardRef<MediaPlayerRef, MediaPlayerProps>(
  (
    {
      mediaType,
      audioUrl,
      videoUrl,
      onPlay,
      onPause,
      onTimeUpdate,
      onLoadedMetadata,
      className = '',
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Expose unified API for both audio and video
    useImperativeHandle(ref, () => ({
      play: () => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        media?.play()
      },
      pause: () => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        media?.pause()
      },
      seek: (time: number) => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        if (media) media.currentTime = time
      },
      getCurrentTime: () => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        return media?.currentTime || 0
      },
      getDuration: () => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        return media?.duration || 0
      },
      setPlaybackRate: (rate: number) => {
        const media =
          mediaType === PodcastMediaType.AUDIO
            ? audioRef.current
            : videoRef.current
        if (media) media.playbackRate = rate
      },
    }))

    if (mediaType === PodcastMediaType.VIDEO) {
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          className={`w-full h-full bg-black ${className}`}
          style={{ objectFit: 'contain' }}
          onPlay={onPlay}
          onPause={onPause}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          controls={false} // Custom controls
          playsInline
        />
      )
    }

    // Audio mode (default)
    return (
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        className={className}
      />
    )
  }
)

MediaPlayer.displayName = 'MediaPlayer'
