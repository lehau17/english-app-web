import { ListMusic, Search, SortAsc } from 'lucide-react'
import React, { useState } from 'react'
import PlaylistGrid from '../components/playlist/PlaylistGrid'
import { useUserPlaylists } from '../hooks/playlist.hooks'
import { playlistApi } from '../services/playlist.api'

type SortOption = 'newest' | 'oldest' | 'name' | 'updated'
type PrivacyFilter = 'all' | 'public' | 'private'

const PlaylistsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('all')

  const {
    playlists,
    loading,
    error,
    addPlaylist,
    updatePlaylist,
    removePlaylist,
    fetchPlaylists,
  } = useUserPlaylists()

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    fetchPlaylists({
      search: value || undefined,
      sortBy,
      privacy: privacyFilter === 'all' ? undefined : privacyFilter,
    })
  }

  const handleSortChange = (value: SortOption) => {
    setSortBy(value)
    fetchPlaylists({
      search: searchTerm || undefined,
      sortBy: value,
      privacy: privacyFilter === 'all' ? undefined : privacyFilter,
    })
  }

  const handlePrivacyFilterChange = (value: PrivacyFilter) => {
    setPrivacyFilter(value)
    fetchPlaylists({
      search: searchTerm || undefined,
      sortBy,
      privacy: value === 'all' ? undefined : value,
    })
  }

  const handlePlaylistDelete = async (playlistId: string) => {
    try {
      await playlistApi.delete(playlistId)
      removePlaylist(playlistId)
    } catch (error) {
      // Error is already handled by the API and shown via toast
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <ListMusic className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Playlist của tôi</h1>
              <p className="mt-1 text-lg opacity-90">
                Quản lý và tổ chức podcast yêu thích
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">{playlists?.length}</p>
              <p className="text-sm opacity-75">Playlist</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">
                {playlists?.reduce((total, p) => total + p.podcastCount, 0)}
              </p>
              <p className="text-sm opacity-75">Podcast</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-2xl font-bold">
                {playlists?.filter((p) => p.isPublic).length}
              </p>
              <p className="text-sm opacity-75">Công khai</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm playlist..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <SortAsc className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="updated">Cập nhật gần đây</option>
            </select>
          </div>

          {/* Privacy Filter */}
          <div className="flex rounded-lg border border-gray-200 bg-white p-1">
            {(
              [
                { value: 'all', label: 'Tất cả' },
                { value: 'public', label: 'Công khai' },
                { value: 'private', label: 'Riêng tư' },
              ] as Array<{ value: PrivacyFilter; label: string }>
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handlePrivacyFilterChange(value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  privacyFilter === value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          <p className="font-medium">Có lỗi xảy ra</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Playlists Grid */}
      <PlaylistGrid
        playlists={playlists}
        loading={loading}
        onPlaylistCreate={addPlaylist}
        onPlaylistUpdate={updatePlaylist}
        onPlaylistDelete={handlePlaylistDelete}
        showOwner={false} // Don't show owner in personal playlists page
        emptyMessage="Bạn chưa có playlist nào"
      />
    </div>
  )
}

export default PlaylistsPage
