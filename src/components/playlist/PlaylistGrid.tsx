import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import type { Playlist } from '../../services/playlist.api'
import PlaylistCard from './PlaylistCard'
import PlaylistModal from './PlaylistModal'

interface PlaylistGridProps {
  playlists: Playlist[]
  loading?: boolean
  onPlaylistCreate?: (playlist: Playlist) => void
  onPlaylistUpdate?: (playlist: Playlist) => void
  onPlaylistDelete?: (playlistId: string) => void
  showCreateButton?: boolean
  showOwner?: boolean
  className?: string
  emptyMessage?: string
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  loading = false,
  onPlaylistCreate,
  onPlaylistUpdate,
  onPlaylistDelete,
  showCreateButton = true,
  showOwner = true,
  className = '',
  emptyMessage = 'Chưa có playlist nào',
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)

  const handlePlaylistSuccess = (playlist: Playlist) => {
    if (editingPlaylist) {
      onPlaylistUpdate?.(playlist)
      setEditingPlaylist(null)
    } else {
      onPlaylistCreate?.(playlist)
    }
  }

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
  }

  const handleDelete = (playlistId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa playlist này không?')) {
      onPlaylistDelete?.(playlistId)
    }
  }

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
            </div>
            <div className="mb-4 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200" />
              <div className="h-6 w-20 rounded-full bg-gray-200" />
            </div>
            <div className="h-10 w-full rounded-lg bg-gray-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      >
        {/* Create Button */}
        {showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Plus className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="font-medium">Tạo playlist mới</p>
              <p className="text-sm">Tổ chức podcast theo chủ đề</p>
            </div>
          </button>
        )}

        {/* Playlists */}
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showOwner={showOwner}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && playlists.length === 0 && !showCreateButton && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Plus className="h-10 w-10" />
          </div>
          <p className="text-lg font-medium">{emptyMessage}</p>
          <p className="text-sm">Tạo playlist đầu tiên để bắt đầu</p>
        </div>
      )}

      {/* Create Modal */}
      <PlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePlaylistSuccess}
      />

      {/* Edit Modal */}
      <PlaylistModal
        isOpen={!!editingPlaylist}
        onClose={() => setEditingPlaylist(null)}
        onSuccess={handlePlaylistSuccess}
        playlist={editingPlaylist || undefined}
      />
    </>
  )
}

export default PlaylistGrid
