// Learning Path WebSocket Hook - Phase 5 Student UX
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'

interface UseLearningPathWebSocketOptions {
  pathId: string
  onStepAdded?: (step: any) => void
  onDifficultyAdjusted?: (data: {
    newDifficulty: number
    reason: string
    activityId?: string
  }) => void
  onMasteryAchieved?: (data: {
    skillId: string
    skillName: string
    masteryLevel: number
    timestamp: string
  }) => void
  onMilestoneReached?: (data: {
    percentage: number
    badge: string
    unlockedAt: string
    message: string
  }) => void
  onProgressUpdate?: (data: {
    completedSteps: number
    totalSteps: number
    percentage: number
  }) => void
  enabled?: boolean
}

export const useLearningPathWebSocket = ({
  pathId,
  onStepAdded,
  onDifficultyAdjusted,
  onMasteryAchieved,
  onMilestoneReached,
  onProgressUpdate,
  enabled = true,
}: UseLearningPathWebSocketOptions) => {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()

  const handleStepAdded = useCallback(
    (step: any) => {
      queryClient.invalidateQueries({ queryKey: ['learning-path', pathId] })
      toast.success('New activity available!')
      onStepAdded?.(step)
    },
    [pathId, queryClient, onStepAdded]
  )

  const handleDifficultyAdjusted = useCallback(
    (data: any) => {
      toast.custom(`Difficulty adjusted: ${data.reason}`)
      onDifficultyAdjusted?.(data)
    },
    [onDifficultyAdjusted]
  )

  const handleMasteryAchieved = useCallback(
    (data: any) => {
      toast.success(`Mastered: ${data.skillName}!`)
      queryClient.invalidateQueries({ queryKey: ['learning-path', pathId] })
      onMasteryAchieved?.(data)
    },
    [pathId, queryClient, onMasteryAchieved]
  )

  const handleMilestoneReached = useCallback(
    (data: any) => {
      toast.success(`${data.badge} badge unlocked!`)
      onMilestoneReached?.(data)
    },
    [onMilestoneReached]
  )

  const handleProgressUpdate = useCallback(
    (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['learning-path', pathId] })
      onProgressUpdate?.(data)
    },
    [pathId, queryClient, onProgressUpdate]
  )

  useEffect(() => {
    if (!enabled || !pathId) return

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3334/api'
    const baseUrl = apiUrl.replace('/api', '')

    socketRef.current = io(`${baseUrl}/learning-path`, {
      auth: { pathId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Learning path WebSocket connected')
      socket.emit('subscribe', { pathId })
    })

    socket.on('subscribed', () => {
      console.log(`Subscribed to learning path ${pathId}`)
    })

    socket.on('step-added', handleStepAdded)
    socket.on('difficulty-adjusted', handleDifficultyAdjusted)
    socket.on('mastery-achieved', handleMasteryAchieved)
    socket.on('milestone-reached', handleMilestoneReached)
    socket.on('progress-update', handleProgressUpdate)

    socket.on('disconnect', () => {
      console.log('Learning path WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Learning path WebSocket error:', error)
    })

    return () => {
      socket.emit('unsubscribe', { pathId })
      socket.disconnect()
      socketRef.current = null
    }
  }, [
    pathId,
    enabled,
    handleStepAdded,
    handleDifficultyAdjusted,
    handleMasteryAchieved,
    handleMilestoneReached,
    handleProgressUpdate,
  ])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  }
}
