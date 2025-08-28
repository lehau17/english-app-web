import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Sparkles,
} from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../layouts/AuthLayout'

interface LoginFormData {
  email: string
  password: string
}

const inputBase =
  'w-full h-12 rounded-2xl border-2 pl-12 pr-12 text-gray-900 transition-all duration-300 focus:outline-none'
const ok = 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
const err = 'border-red-400 bg-red-50 focus:border-red-500'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({ mode: 'onChange' })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)
    try {
      await login(data.email, data.password)
      // No need for success alert, AuthProvider will redirect to protected routes
    } catch (error) {
      console.error('Login failed:', error)
      setApiError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title={t('login.title')}>
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
              <span>{t('login.email_label')}</span>
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
                required: t('login.validations.email_required'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('login.validations.email_invalid'),
                },
              })}
              className={`${inputBase} ${errors.email ? err : ok} pr-4`}
              placeholder={t('login.email_placeholder')}
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
              <span>{t('login.password_label')}</span>
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
                required: t('login.validations.password_required'),
                minLength: {
                  value: 6,
                  message: t('login.validations.password_minlength'),
                },
              })}
              className={`${inputBase} ${errors.password ? err : ok}`}
              placeholder={t('login.password_placeholder')}
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
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
              : 'cursor-not-allowed bg-gray-400'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('login.logging_in')}
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              <span>{t('login.submit_button')}</span>
              <Sparkles className="h-5 w-5" />
            </span>
          )}
        </button>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            {t('login.no_account')}{' '}
            <button
              type="button"
              className="inline-flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-800 hover:underline"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('login.join_adventure')}</span>
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
