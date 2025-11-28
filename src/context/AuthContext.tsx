/* eslint react-refresh/only-export-components: "off" */
import { useQueryClient } from '@tanstack/react-query'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  refreshAccessTokenFn,
  useLoginMutation,
  useMeQuery,
  useParentLoginMutation,
} from '../hooks/auth.queries'
import api from '../lib/api'
import type { User } from '../types/user.type'

type AuthCtx = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  parentLogin: (email: string, password: string) => Promise<void>
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
  const navigate = useNavigate()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [rehydrated, setRehydrated] = useState(false)

  const refreshPromiseRef = useRef<Promise<string> | null>(null)

  // Rehydrate từ localStorage ĐỒNG BỘ (trước khi render)
  // Dùng useState initial function để chạy TRƯỚC render đầu tiên
  const [initialAuth] = useState(() => {
    const a = localStorage.getItem(ACCESS_KEY)
    const r = localStorage.getItem(REFRESH_KEY)
    const u = localStorage.getItem(USER_KEY)

    let parsedUser: User | null = null
    if (u) {
      try {
        parsedUser = JSON.parse(u)
      } catch {
        console.log('Failed to parse user from localStorage')
      }
    }

    return { a, r, parsedUser }
  })

  // Set token và user từ initial state
  useEffect(() => {
    if (initialAuth.a) {
      setAccessToken(initialAuth.a)
      // Set header NGAY LẬP TỨC để request đầu tiên có token
      api.defaults.headers.common['Authorization'] = `Bearer ${initialAuth.a}`
    }
    if (initialAuth.r) setRefreshToken(initialAuth.r)
    if (initialAuth.parsedUser) {
      queryClient.setQueryData(['me'], initialAuth.parsedUser)
    }
    setRehydrated(true)
  }, [queryClient, initialAuth])

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
  const login = useCallback(
    async (email: string, password: string) => {
      const data = await loginMutation.mutateAsync({ email, password })
      setAccessToken(data.accessToken)
      setRefreshToken(data.refreshToken ?? null)
      queryClient.setQueryData(['me'], data.user)
    },
    [loginMutation, queryClient]
  )

  // Parent login mutation (TanStack)
  const parentLoginMutation = useParentLoginMutation()
  const parentLogin = useCallback(
    async (email: string, password: string) => {
      try {
        console.log('Starting parent login...')
        const data = await parentLoginMutation.mutateAsync({ email, password })
        console.log('Parent login successful, user data:', data.user)

        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken ?? null)
        queryClient.setQueryData(['me'], data.user)

        console.log('User data set to query cache, navigating to /parent-home')

        // Redirect parent to parent home page
        navigate('/parent-home')
      } catch (error) {
        console.error('Parent login failed:', error)
        throw error
      }
    },
    [navigate, parentLoginMutation, queryClient]
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    queryClient.removeQueries({ queryKey: ['me'] })
    localStorage.removeItem(USER_KEY)

    // Redirect về login nếu không đang ở trang login
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      const currentPath = window.location.pathname + window.location.search
      const next =
        currentPath !== '/' ? `?next=${encodeURIComponent(currentPath)}` : ''
      navigate(`/login${next}`)
    }
  }, [navigate, queryClient])

  // Refresh token flow (dùng fn từ hooks)
  const refreshAccessToken = useCallback(async (): Promise<string> => {
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
  }, [refreshToken])

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
  }, [accessToken, logout, refreshAccessToken, refreshToken])

  const user = meQuery.data ?? null
  const isAuthenticated = !!accessToken && !!user
  const loading = !rehydrated || (meEnabled && meQuery.isFetching)

  // setUser thao tác trên query cache
  const setUser = useCallback<
    React.Dispatch<React.SetStateAction<User | null>>
  >(
    (updater) => {
      const current =
        (queryClient.getQueryData(['me']) as User | undefined) ?? null
      const next =
        typeof updater === 'function'
          ? (updater as (prev: User | null) => User | null)(current)
          : updater
      if (next) queryClient.setQueryData(['me'], next)
      else queryClient.removeQueries({ queryKey: ['me'] })
    },
    [queryClient]
  )

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      parentLogin,
      logout,
      setUser,
    }),
    [
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      loading,
      login,
      parentLogin,
      logout,
      setUser,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
