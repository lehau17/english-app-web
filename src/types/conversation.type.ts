export type ConversationType = 'class' | 'personal'

export type MessageType = 'text' | 'image' | 'file' | 'system'

export interface ConversationParticipant {
  id: string
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  role?: string
  avatarUrl?: string | null
  isPinned?: boolean
  isMuted?: boolean
  lastReadAt?: string | null
}

export interface ConversationSummary {
  id: string
  classroomId: string
  type: ConversationType
  name?: string | null
  scopeKey: string
  lastMessageAt?: string | null
  lastMessagePreview?: string | null
  lastMessageSenderId?: string | null
  metadata?: Record<string, any> | null
  messageCount?: number
  unreadCount?: number
  participants: ConversationParticipant[]
}

export interface ConversationMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: MessageType
  metadata?: Record<string, any> | null
  attachments?: Record<string, any> | null
  isEdited: boolean
  editedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface SendMessageResponse {
  conversation: ConversationSummary
  message: ConversationMessage
}

export interface CreateConversationPayload {
  type: ConversationType
  name?: string
  participantIds?: string[]
  metadata?: Record<string, any>
}

export interface SendConversationMessagePayload {
  content: string
  type?: MessageType
  metadata?: Record<string, any>
  attachments?: Record<string, any>
}

export interface MarkConversationReadPayload {
  readAt?: string
}
