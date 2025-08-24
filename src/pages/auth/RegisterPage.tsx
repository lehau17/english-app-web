import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import AuthLayout from '../../layouts/AuthLayout'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const inputBase =
  'w-full h-12 rounded-2xl border-2 pl-12 pr-12 text-gray-900 transition-all duration-300 focus:outline-none'
const ok = 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
const err = 'border-red-400 bg-red-50 focus:border-red-500'

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({ mode: 'onChange' })

  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    console.log('Register data:', data)
    await new Promise((r) => setTimeout(r, 2000))
    setIsLoading(false)
  }

  return (
    <AuthLayout title="Join the Fun!">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            <span className="inline-flex items-center gap-2">Your Name</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              autoComplete="name"
              {...register('name', {
                required: 'Please tell us your name',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
              className={`${inputBase} ${errors.name ? err : ok} pr-4`}
              placeholder="What should we call you?"
            />
          </div>
          {errors.name && (
            <p className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            <span className="inline-flex items-center gap-2">
              Email Address
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
                required: 'Please enter your email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`${inputBase} ${errors.email ? err : ok} pr-4`}
              placeholder="your-email@example.com"
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
              Create Password
            </span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Please create a password',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={`${inputBase} ${errors.password ? err : ok}`}
              placeholder="Make it secure!"
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            <span className="inline-flex items-center gap-2">
              Confirm Password
            </span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
              className={`${inputBase} ${errors.confirmPassword ? err : ok}`}
              placeholder="Type it again!"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition-colors hover:text-gray-600"
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 flex items-center text-sm text-red-600">
              <AlertCircle className="mr-1 h-4 w-4" />
              {errors.confirmPassword.message}
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
              Creating Account...
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Start My Adventure!</span>
            </span>
          )}
        </button>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              className="inline-flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-800 hover:underline"
            >
              <LogIn className="h-4 w-4" />
              <span>Welcome Back!</span>
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
