import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  playlistApi,
  type GetPlaylistsQueryDto,
  type PageResponse,
  type Playlist,
} from '../services/playlist.api'

export const useUserPlaylists = (query?: GetPlaylistsQueryDto) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [pagination, setPagination] = useState({
    totalItems: 0,
    itemCount: 0,
    itemsPerPage: 10,
    totalPages: 0,
    currentPage: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylists = async (newQuery?: GetPlaylistsQueryDto) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = { ...query, ...newQuery }
      const response: PageResponse<Playlist> =
        await playlistApi.getUserPlaylists(queryParams)

      setPlaylists(response.items)
      setPagination(response.meta)
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Không thể tải danh sách playlist'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const refresh = () => {
    fetchPlaylists()
  }

  const addPlaylist = (newPlaylist: Playlist) => {
    setPlaylists((prev) => [newPlaylist, ...prev])
    setPagination((prev) => ({
      ...prev,
      totalItems: prev.totalItems + 1,
      itemCount: prev.itemCount + 1,
    }))
  }

  const updatePlaylist = (updatedPlaylist: Playlist) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
      )
    )
  }

  const removePlaylist = (playlistId: string) => {
    setPlaylists((prev) =>
      prev.filter((playlist) => playlist.id !== playlistId)
    )
    setPagination((prev) => ({
      ...prev,
      totalItems: prev.totalItems - 1,
      itemCount: prev.itemCount - 1,
    }))
  }

  return {
    playlists,
    pagination,
    loading,
    error,
    refresh,
    fetchPlaylists,
    addPlaylist,
    updatePlaylist,
    removePlaylist,
  }
}

export const usePlaylist = (playlistId: string | null) => {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlaylist = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await playlistApi.getById(id)
      setPlaylist(response)
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Không thể tải thông tin playlist'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist(playlistId)
    } else {
      setPlaylist(null)
      setError(null)
    }
  }, [playlistId])

  const refresh = () => {
    if (playlistId) {
      fetchPlaylist(playlistId)
    }
  }

  return {
    playlist,
    loading,
    error,
    refresh,
  }
}

export const usePlaylistActions = () => {
  const [loading, setLoading] = useState(false)

  const createPlaylist = async (
    data: Parameters<typeof playlistApi.create>[0]
  ) => {
    setLoading(true)
    try {
      const result = await playlistApi.create(data)
      toast.success('Tạo playlist thành công!')
      return result
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể tạo playlist'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePlaylist = async (
    id: string,
    data: Parameters<typeof playlistApi.update>[1]
  ) => {
    setLoading(true)
    try {
      const result = await playlistApi.update(id, data)
      toast.success('Cập nhật playlist thành công!')
      return result
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Không thể cập nhật playlist'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deletePlaylist = async (id: string) => {
    setLoading(true)
    try {
      await playlistApi.delete(id)
      toast.success('Xóa playlist thành công!')
      return true
    } catch (error: any) {
      const message = error.response?.data?.message || 'Không thể xóa playlist'
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const addPodcastToPlaylist = async (
    playlistId: string,
    podcastId: string
  ) => {
    setLoading(true)
    try {
      await playlistApi.addPodcast(playlistId, { podcastId })
      toast.success('Đã thêm podcast vào playlist!')
      return true
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Không thể thêm podcast vào playlist'
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const removePodcastFromPlaylist = async (
    playlistId: string,
    podcastId: string
  ) => {
    setLoading(true)
    try {
      await playlistApi.removePodcast(playlistId, podcastId)
      toast.success('Đã xóa podcast khỏi playlist!')
      return true
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Không thể xóa podcast khỏi playlist'
      toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addPodcastToPlaylist,
    removePodcastFromPlaylist,
  }
}
