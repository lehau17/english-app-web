import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { resolveSocketUrl } from '../lib/socket'
import { useAuth } from '../context/AuthContext'

export type GradingStatus = 'idle' | 'grading' | 'complete' | 'error'

export type ActivityGradingResult = {
  activityId: string
  activityIndex: number
  activityType: string
  activityTitle: string
  score: number
  maxScore: number
}

export type GradingProgress = {
  status: GradingStatus
  totalActivities: number
  gradedActivities: number
  currentActivityType?: string
  activityResults: Record<string, ActivityGradingResult>
  totalScore?: number
  feedback?: string
  error?: string
}

export function useGradingSocket(submissionId: string | null) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [progress, setProgress] = useState<GradingProgress>({
    status: 'idle',
    totalActivities: 0,
    gradedActivities: 0,
    activityResults: {},
  })

  const connect = useCallback(() => {
    if (!user?.id || socketRef.current) return

    const socketUrl = resolveSocketUrl()
    console.log('🔌 Connecting to grading socket:', socketUrl)

    const socket = io(socketUrl, {
      transports: ['websocket'],
      query: { userId: user.id },
    })

    socket.on('connect', () => {
      console.log('✅ Grading socket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Grading socket disconnected')
      setIsConnected(false)
    })

    // Grading started
    socket.on(
      'grading:start',
      (data: { submissionId: string; totalActivities: number }) => {
        if (data.submissionId !== submissionId) return
        console.log('📝 Grading started:', data)
        setProgress({
          status: 'grading',
          totalActivities: data.totalActivities,
          gradedActivities: 0,
          activityResults: {},
        })
      }
    )

    // Activity graded
    socket.on(
      'grading:activity',
      (data: {
        submissionId: string
        activityId: string
        activityIndex: number
        activityType: string
        activityTitle: string
        score: number
        maxScore: number
        totalGraded: number
        totalActivities: number
      }) => {
        if (data.submissionId !== submissionId) return
        console.log('✅ Activity graded:', data)

        setProgress((prev) => ({
          ...prev,
          gradedActivities: data.totalGraded,
          currentActivityType: data.activityType,
          activityResults: {
            ...prev.activityResults,
            [data.activityId]: {
              activityId: data.activityId,
              activityIndex: data.activityIndex,
              activityType: data.activityType,
              activityTitle: data.activityTitle,
              score: data.score,
              maxScore: data.maxScore,
            },
          },
        }))
      }
    )

    // Grading complete
    socket.on(
      'grading:complete',
      (data: {
        submissionId: string
        totalScore: number
        earnedPoints: number
        totalPoints: number
        feedback: string
        activityScores: Record<string, { score: number; maxScore: number }>
      }) => {
        if (data.submissionId !== submissionId) return
        console.log('🎉 Grading complete:', data)

        setProgress((prev) => ({
          ...prev,
          status: 'complete',
          totalScore: data.totalScore,
          feedback: data.feedback,
        }))
      }
    )

    // Grading error
    socket.on(
      'grading:error',
      (data: { submissionId: string; error: string }) => {
        if (data.submissionId !== submissionId) return
        console.error('❌ Grading error:', data)

        setProgress((prev) => ({
          ...prev,
          status: 'error',
          error: data.error,
        }))
      }
    )

    socketRef.current = socket
  }, [user?.id, submissionId])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    if (submissionId) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [submissionId, connect, disconnect])

  return {
    isConnected,
    progress,
    connect,
    disconnect,
  }
}
