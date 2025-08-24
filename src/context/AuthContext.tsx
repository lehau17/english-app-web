/* eslint react-refresh/only-export-components: "off" */
import { useQueryClient } from '@tanstack/react-query'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  refreshAccessTokenFn,
  useLoginMutation,
  useMeQuery,
} from '../hooks/auth.queries'
import api from '../lib/api'
import type { User } from '../types/auth'

type AuthCtx = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const AuthContext = createContext<AuthCtx | undefined>(undefined)

const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [rehydrated, setRehydrated] = useState(false)

  const refreshPromiseRef = useRef<Promise<string> | null>(null)

  // Rehydrate từ localStorage
  useEffect(() => {
    const a = localStorage.getItem(ACCESS_KEY)
    const r = localStorage.getItem(REFRESH_KEY)
    const u = localStorage.getItem(USER_KEY)
    if (a) setAccessToken(a)
    if (r) setRefreshToken(r)
    if (u) {
      try {
        const parsed: User = JSON.parse(u)
        queryClient.setQueryData(['me'], parsed)
      } catch {
        console.log('Failed to parse user from localStorage')
      }
    }
    setRehydrated(true)
  }, [queryClient])

  // Sync header + persist access
  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      localStorage.setItem(ACCESS_KEY, accessToken)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem(ACCESS_KEY)
    }
  }, [accessToken])

  // Persist refresh
  useEffect(() => {
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    else localStorage.removeItem(REFRESH_KEY)
  }, [refreshToken])

  // Query me (TanStack)
  const meEnabled = !!accessToken && rehydrated
  const meQuery = useMeQuery(!!accessToken && rehydrated)

  // Lưu user vào localStorage khi thay đổi
  useEffect(() => {
    const u = meQuery.data ?? null
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
  }, [meQuery.data])

  // Login mutation (TanStack)
  const loginMutation = useLoginMutation()
  const login = async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password })
    setAccessToken(data.accessToken)
    setRefreshToken(data.refreshToken ?? null)
    queryClient.setQueryData(['me'], data.user)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    queryClient.removeQueries({ queryKey: ['me'] })
    localStorage.removeItem(USER_KEY)
  }

  // Refresh token flow (dùng fn từ hooks)
  const refreshAccessToken = async (): Promise<string> => {
    if (!refreshToken) throw new Error('No refresh token')
    if (refreshPromiseRef.current) return refreshPromiseRef.current
    const p = refreshAccessTokenFn(refreshToken).then((newToken) => {
      setAccessToken(newToken)
      return newToken
    })
    refreshPromiseRef.current = p
    try {
      return await p
    } finally {
      refreshPromiseRef.current = null
    }
  }

  // Axios interceptors
  useEffect(() => {
    const reqId = api.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    })

    const resId = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config || {}
        if (error?.response?.status === 401 && !original.__isRetry) {
          try {
            const newToken = await refreshAccessToken()
            original.__isRetry = true
            original.headers = original.headers ?? {}
            original.headers.Authorization = `Bearer ${newToken}`
            return api.request(original)
          } catch {
            logout()
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(reqId)
      api.interceptors.response.eject(resId)
    }
  }, [accessToken, refreshToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const user = meQuery.data ?? null
  const isAuthenticated = !!accessToken && !!user
  const loading = !rehydrated || (meEnabled && meQuery.isFetching)

  // setUser thao tác trên query cache
  const setUser: React.Dispatch<React.SetStateAction<User | null>> = (
    updater
  ) => {
    const current =
      (queryClient.getQueryData(['me']) as User | undefined) ?? null
    const next =
      typeof updater === 'function'
        ? (updater as (prev: User | null) => User | null)(current)
        : updater
    if (next) queryClient.setQueryData(['me'], next)
    else queryClient.removeQueries({ queryKey: ['me'] })
  }

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      logout,
      setUser,
    }),
    [user, accessToken, refreshToken, isAuthenticated, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
