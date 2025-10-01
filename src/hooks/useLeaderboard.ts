import { useQuery } from '@tanstack/react-query'
import {
  fetchClassroomLeaderboard,
  fetchMonthlyLeaderboard,
  fetchYearlyLeaderboard,
} from '../services/home.api'
import type {
  LeaderboardApiResponse,
  LeaderboardEntry,
} from '../types/leaderboard.type'

interface ClassroomLeaderboardParams {
  classroomId?: string
  year?: number
  month?: number
  from?: string
  to?: string
  enabled?: boolean
}

interface TimeLeaderboardParams {
  year: number
  month?: number
  classroomId?: string
  enabled?: boolean
}

const mapResponseToResult = (
  response?: LeaderboardApiResponse
): { entries: LeaderboardEntry[] } => {
  if (!response?.data?.entries) {
    return { entries: [] }
  }
  return {
    entries: response.data.entries,
  }
}

export const useClassroomLeaderboard = (params: ClassroomLeaderboardParams) => {
  const { classroomId, year, month, from, to, enabled = true } = params

  return useQuery({
    queryKey: [
      'leaderboard',
      'classroom',
      classroomId ?? null,
      year ?? null,
      month ?? null,
      from ?? null,
      to ?? null,
    ],
    queryFn: () =>
      fetchClassroomLeaderboard(classroomId!, {
        year,
        month,
        from,
        to,
      }),
    enabled: Boolean(classroomId) && enabled,
    select: mapResponseToResult,
  })
}

export const useMonthlyLeaderboard = (params: TimeLeaderboardParams) => {
  const { year, month, classroomId, enabled = true } = params

  return useQuery({
    queryKey: [
      'leaderboard',
      'monthly',
      year,
      month ?? null,
      classroomId ?? null,
    ],
    queryFn: () =>
      fetchMonthlyLeaderboard({
        year,
        month: month ?? new Date().getUTCMonth() + 1,
        classroomId,
      }),
    enabled: enabled && Boolean(year) && Boolean(month),
    select: mapResponseToResult,
  })
}

export const useYearlyLeaderboard = (params: TimeLeaderboardParams) => {
  const { year, classroomId, enabled = true } = params

  return useQuery({
    queryKey: ['leaderboard', 'yearly', year, classroomId ?? null],
    queryFn: () =>
      fetchYearlyLeaderboard({
        year,
        classroomId,
      }),
    enabled: enabled && Boolean(year),
    select: mapResponseToResult,
  })
}
