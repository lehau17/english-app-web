import { createContext } from 'react'

export interface ConversationContextValue {
  openWidget: (classroomId: string, conversationId?: string) => void
  registerOpenWidget: (
    fn: (classroomId: string, conversationId?: string) => void
  ) => void
}

export const ConversationContext =
  createContext<ConversationContextValue | null>(null)
