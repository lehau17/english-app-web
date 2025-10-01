import { Clock, Globe, Lock, MoreHorizontal, Music, Play } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Playlist } from '../../services/playlist.api'
import { formatDuration } from '../../utils/dateUtils'
import PlaylistActionMenu from './PlaylistActionMenu'

interface PlaylistCardProps {
  playlist: Playlist
  onEdit?: (playlist: Playlist) => void
  onDelete?: (playlistId: string) => void
  onAddToPodcast?: (playlistId: string) => void
  className?: string
  showOwner?: boolean
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  onEdit,
  onDelete,
  onAddToPodcast,
  className = '',
  showOwner = true,
}) => {
  const [showMenu, setShowMenu] = useState(false)

  const handleMenuAction = (action: string) => {
    setShowMenu(false)
    switch (action) {
      case 'edit':
        onEdit?.(playlist)
        break
      case 'delete':
        onDelete?.(playlist.id)
        break
      case 'add-podcast':
        onAddToPodcast?.(playlist.id)
        break
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Music className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-gray-900">
              {playlist.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {playlist.isPublic ? (
                <>
                  <Globe className="h-4 w-4" />
                  <span>Công khai</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Riêng tư</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {showMenu && (
            <PlaylistActionMenu
              playlist={playlist}
              onAction={handleMenuAction}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Description */}
      {playlist.description && (
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">
          {playlist.description}
        </p>
      )}

      {/* Tags */}
      {playlist.tags && playlist.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {playlist.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {tag}
            </span>
          ))}
          {playlist.tags.length > 3 && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              +{playlist.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Music className="h-4 w-4" />
          <span>
            {playlist.podcastCount} podcast
            {playlist.podcastCount !== 1 ? 's' : ''}
          </span>
        </div>
        {playlist.totalDuration > 0 && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(playlist.totalDuration)}</span>
          </div>
        )}
        {playlist.playCount > 0 && (
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            <span>{playlist.playCount} lượt nghe</span>
          </div>
        )}
      </div>

      {/* Owner */}
      {showOwner && playlist.user && (
        <div className="mb-4 flex items-center gap-3">
          <img
            src={playlist.user.avatarUrl || '/api/placeholder/32/32'}
            alt={playlist.user.displayName}
            className="h-8 w-8 rounded-full"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {playlist.user.displayName ||
                `${playlist.user.firstName} ${playlist.user.lastName}`}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(playlist.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/playlists/${playlist.id}`}
          className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Xem playlist
        </Link>
        {playlist.podcastCount > 0 && (
          <Link
            to={`/playlists/${playlist.id}/play`}
            className="rounded-lg border border-gray-200 p-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Play className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

export default PlaylistCard
