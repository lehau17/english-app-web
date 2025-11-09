import { Bot, Loader2, MessageCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useConversation } from '../../context/useConversation'
import {
  useConversationList,
  useConversationMessages,
  useConversationRealtime,
  useMarkConversationReadMutation,
  useSendConversationMessage,
} from '../../hooks/conversation.hooks'
import { useMyClassrooms } from '../../hooks/useMyClassrooms'
import type { ConversationSummary } from '../../types/conversation.type'
import { AiAgentPanel } from '../ai-assistant/AiAgentPanel'
import { ConversationPanel } from './ConversationPanel'
import { SearchUserModal } from './SearchUserModal'

const DEFAULT_LIMIT = 20

type ChatMode = 'classroom' | 'ai-agent'

export const ConversationWidget = () => {
  const { user } = useAuth()
  const { registerOpenWidget } = useConversation()
  const [isOpen, setIsOpen] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('classroom')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedClassroomId, setSelectedClassroomId] = useState<
    string | undefined
  >(undefined)
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(undefined)
  const [showSearchModal, setShowSearchModal] = useState(false)

  // Register openWidget function với context
  useEffect(() => {
    registerOpenWidget((classroomId: string, conversationId?: string) => {
      setSelectedClassroomId(classroomId)
      if (conversationId) {
        setSelectedConversationId(conversationId)
      }
      setIsOpen(true)
    })
  }, [registerOpenWidget])

  const classroomsQuery = useMyClassrooms(user?.role, !!user)
  const classroomOptions = useMemo(
    () =>
      (classroomsQuery.data ?? []).map((cls) => ({
        id: cls.id,
        name: cls.name,
      })),
    [classroomsQuery.data]
  )

  useEffect(() => {
    if (!selectedClassroomId && classroomOptions.length > 0) {
      setSelectedClassroomId(classroomOptions[0].id)
    }
  }, [selectedClassroomId, classroomOptions])

  const conversationsQuery = useConversationList(selectedClassroomId, isOpen, {
    limit: DEFAULT_LIMIT,
    page: 1,
  })
  const conversations = useMemo(
    () => conversationsQuery.data?.data ?? [],
    [conversationsQuery.data?.data]
  )

  console.log('conversations', conversations)

  useEffect(() => {
    if (!isOpen) return
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id)
      return
    }
    if (
      selectedConversationId &&
      conversations.findIndex((item) => item.id === selectedConversationId) ===
        -1
    ) {
      setSelectedConversationId(conversations[0]?.id)
    }
  }, [isOpen, conversations, selectedConversationId])

  const messagesQuery = useConversationMessages(
    selectedClassroomId,
    selectedConversationId,
    isOpen
  )

  const sendMessageMutation = useSendConversationMessage()
  const markReadMutation = useMarkConversationReadMutation()

  useConversationRealtime(isOpen)

  const activeConversation: ConversationSummary | undefined = useMemo(
    () =>
      conversations.find(
        (conversation) => conversation.id === selectedConversationId
      ),
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    if (!isOpen) return
    if (!selectedClassroomId || !selectedConversationId) return
    if (!activeConversation) return
    const unread = activeConversation.unreadCount ?? 0
    if (unread > 0 && !markReadMutation.isPending) {
      markReadMutation.mutate({
        classroomId: selectedClassroomId,
        conversationId: selectedConversationId,
      })
    }
  }, [
    isOpen,
    selectedClassroomId,
    selectedConversationId,
    activeConversation,
    markReadMutation,
  ])

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedClassroomId || !selectedConversationId) return

    // Tạm thời chỉ gửi text message, có thể mở rộng để upload files sau
    if (attachments && attachments.length > 0) {
      toast('Chức năng gửi hình ảnh đang được phát triển')
      return
    }

    await sendMessageMutation.mutateAsync({
      classroomId: selectedClassroomId,
      conversationId: selectedConversationId,
      payload: {
        content,
      },
    })
  }

  const handleToggle = () => setIsOpen((value) => !value)
  const handleToggleFullscreen = () => setIsFullscreen((value) => !value)

  const handleAiClick = () => {
    setChatMode('ai-agent')
    setIsOpen(true)
  }

  const handleClassroomClick = () => {
    setChatMode('classroom')
    setIsOpen(true)
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      {isOpen && (
        <>
          {chatMode === 'classroom' ? (
            <ConversationPanel
              onClose={handleToggle}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              classrooms={classroomOptions}
              selectedClassroomId={selectedClassroomId}
              onSelectClassroom={(id) => {
                setSelectedClassroomId(id)
                setSelectedConversationId(undefined)
              }}
              conversations={conversations}
              loadingConversations={conversationsQuery.isFetching}
              selectedConversation={activeConversation}
              onSelectConversation={setSelectedConversationId}
              messages={messagesQuery.messages}
              loadingMessages={
                messagesQuery.isLoading || messagesQuery.isInitialLoading
              }
              onSendMessage={handleSendMessage}
              sendingMessage={sendMessageMutation.isPending}
              hasMoreMessages={Boolean(messagesQuery.hasNextPage)}
              onLoadMoreMessages={() => messagesQuery.fetchNextPage()}
              loadingMoreMessages={messagesQuery.isFetchingNextPage}
              currentUserId={user.id}
            />
          ) : (
            <AiAgentPanel
              onClose={handleToggle}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              userRole={user?.role || 'student'}
              onSwitchToClassroom={() => setChatMode('classroom')}
            />
          )}
        </>
      )}

      <div className="flex flex-col items-start gap-3">
        {/* <button
          type="button"
          onClick={() => setShowSearchModal(true)}
          className="group flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg transition-all duration-200 hover:bg-white hover:px-4 hover:py-2"
          title="Tìm kiếm người dùng"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white shadow">
            <Users className="h-5 w-5" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:max-w-xs">
            Tìm kiếm người dùng
          </span>
        </button> */}
        <button
          type="button"
          onClick={handleAiClick}
          className={`group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition-all duration-200 hover:px-4 hover:py-2 ${
            isOpen && chatMode === 'ai-agent'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-white/90 text-slate-700 hover:bg-white'
          }`}
          title="Chat với AI"
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow ${
              isOpen && chatMode === 'ai-agent'
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
            }`}
          >
            <Bot className="h-5 w-5" />
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:max-w-xs">
            {isOpen && chatMode === 'ai-agent' ? 'Trợ lý AI' : 'Chat với AI'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (isOpen && chatMode === 'classroom') {
              handleToggle()
            } else {
              handleClassroomClick()
            }
          }}
          className={`group flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:px-4 hover:py-2 ${
            isOpen && chatMode === 'classroom'
              ? 'bg-slate-700 hover:bg-slate-800'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={
            isOpen && chatMode === 'classroom' ? 'Đóng chat lớp' : 'Chat lớp'
          }
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            {conversationsQuery.isFetching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </span>
          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:max-w-xs">
            {isOpen && chatMode === 'classroom' ? 'Đóng chat lớp' : 'Chat lớp'}
          </span>
        </button>
      </div>

      {showSearchModal && (
        <SearchUserModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          classroomId={selectedClassroomId}
          onConversationCreated={(conversation) => {
            setSelectedConversationId(conversation.id)
            setIsOpen(true) // Mở panel chat nếu chưa mở
          }}
        />
      )}
    </div>
  )
}

export default ConversationWidget
