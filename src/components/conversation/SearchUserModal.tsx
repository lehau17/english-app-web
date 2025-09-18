import { Loader2, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateConversation } from '../../hooks/conversation.hooks'
import { searchUsers } from '../../services/user.api'

interface User {
  id: string
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
  avatarUrl?: string
}

interface SearchUserModalProps {
  isOpen: boolean
  onClose: () => void
  classroomId?: string
  onConversationCreated: (conversation: any) => void
}

export const SearchUserModal: React.FC<SearchUserModalProps> = ({
  isOpen,
  onClose,
  classroomId,
  onConversationCreated,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const createConversationMutation = useCreateConversation()

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isOpen])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const results = await searchUsers(searchQuery.trim())
      setSearchResults(results.data)
    } catch (error) {
      toast.error('Không thể tìm kiếm người dùng')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateConversation = async (targetUserId: string) => {
    if (!classroomId) return

    try {
      await createConversationMutation.mutateAsync({
        classroomId,
        payload: {
          type: 'personal',
          participantIds: [targetUserId],
        },
      })
      toast.success('Đã tạo cuộc trò chuyện')
      onConversationCreated(createConversationMutation.data)
      onClose()
    } catch (error) {
      toast.error('Không thể tạo cuộc trò chuyện')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
      <div className="w-96 max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Tìm kiếm người dùng
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto">
            {searchResults.length === 0 && searchQuery && !loading && (
              <p className="text-center text-sm text-slate-500">
                Không tìm thấy người dùng nào
              </p>
            )}
            {searchResults.map((userResult) => (
              <div
                key={userResult.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 mb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                    {userResult.avatarUrl ? (
                      <img
                        src={userResult.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-slate-600">
                        {(
                          userResult.displayName ||
                          userResult.firstName ||
                          userResult.email
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {userResult.displayName ||
                        `${userResult.firstName} ${userResult.lastName}`.trim() ||
                        'Ẩn danh'}
                    </p>
                    <p className="text-xs text-slate-500">{userResult.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCreateConversation(userResult.id)}
                  disabled={createConversationMutation.isPending}
                  className="rounded-lg bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:bg-green-300"
                >
                  {createConversationMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Chat'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
