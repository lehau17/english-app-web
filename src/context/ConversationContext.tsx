import React, { useCallback, useMemo, useRef } from 'react'
import {
  ConversationContext,
  type ConversationContextValue,
} from './conversation-context'

interface ConversationProviderProps {
  children: React.ReactNode
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({
  children,
}) => {
  const openWidgetRef = useRef<
    ((classroomId: string, conversationId?: string) => void) | null
  >(null)

  const openWidget = useCallback(
    (classroomId: string, conversationId?: string) => {
      if (openWidgetRef.current) {
        openWidgetRef.current(classroomId, conversationId)
      }
    },
    []
  )

  const registerOpenWidget = useCallback(
    (fn: (classroomId: string, conversationId?: string) => void) => {
      openWidgetRef.current = fn
    },
    []
  )

  const value = useMemo<ConversationContextValue>(
    () => ({
      openWidget,
      registerOpenWidget,
    }),
    [openWidget, registerOpenWidget]
  )

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  )
}
