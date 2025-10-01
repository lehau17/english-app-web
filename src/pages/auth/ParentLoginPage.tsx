import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'

interface ParentLoginFormData {
  email: string
  password: string
}

const inputBase =
  'w-full h-12 rounded-2xl border-2 pl-12 pr-12 text-gray-900 transition-all duration-300 focus:outline-none'
const ok = 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
const err = 'border-red-400 bg-red-50 focus:border-red-500'

const ParentLoginPage: React.FC = () => {
  const { parentLogin, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Redirect to parent home if already authenticated as parent
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'parent') {
      console.log('Parent already authenticated, redirecting to /parent-home')
      navigate('/parent-home', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ParentLoginFormData>({ mode: 'onChange' })

  const onSubmit = async (data: ParentLoginFormData) => {
    setIsLoading(true)
    setApiError(null)
    try {
      console.log('Calling parentLogin...')
      await parentLogin(data.email, data.password)
      console.log('parentLogin completed, should redirect now')
      // Redirect will be handled by useEffect above or AuthContext
    } catch (error) {
      console.error('Parent login failed:', error)
      setApiError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Đăng nhập Phụ huynh">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {apiError && (
          <div
            className="flex items-center rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{apiError}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </span>
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type="email"
              id="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              })}
              className={`${inputBase} ${errors.email ? err : ok} pr-4`}
              placeholder="Nhập email của bạn"
            />
          </div>

          {errors.email && (
            <p className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Mật khẩu</span>
            </span>
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              })}
              className={`${inputBase} ${errors.password ? err : ok}`}
              placeholder="Nhập mật khẩu"
            />

            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full transform rounded-2xl px-4 py-3 font-semibold text-white transition-all duration-300 ${
            isValid && !isLoading
              ? 'bg-gradient-to-r from-green-500 to-blue-600 shadow-lg hover:scale-105 hover:from-green-600 hover:to-blue-700 hover:shadow-xl'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang đăng nhập...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              <span>Đăng nhập Phụ huynh</span>
              <Sparkles className="h-5 w-5" />
            </span>
          )}
        </button>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Bạn là học sinh?{' '}
            <a
              href="/login"
              className="inline-flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-800 hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              <span>Đăng nhập Học sinh</span>
            </a>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ParentLoginPage
