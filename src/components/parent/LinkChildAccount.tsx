import { AlertCircle, CheckCircle, Loader2, Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useCreateLinkRequestMutation } from '../../hooks/parent.queries'

export const LinkChildAccount = () => {
  const [studentIdentifier, setStudentIdentifier] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const createLinkRequestMutation = useCreateLinkRequestMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentIdentifier.trim()) {
      setErrorMessage('Vui lòng nhập email của học sinh')
      return
    }

    setErrorMessage('')
    setShowSuccess(false)

    try {
      await createLinkRequestMutation.mutateAsync(studentIdentifier.trim())
      setShowSuccess(true)
      setStudentIdentifier('')

      // Auto hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể gửi yêu cầu. Vui lòng thử lại.'
      setErrorMessage(message)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <UserPlus className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Liên kết tài khoản con
          </h2>
          <p className="text-sm text-gray-500">
            Gửi yêu cầu liên kết với tài khoản học sinh
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Field */}
        <div>
          <label
            htmlFor="studentIdentifier"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email của học sinh
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="studentIdentifier"
              type="email"
              value={studentIdentifier}
              onChange={(e) => setStudentIdentifier(e.target.value)}
              placeholder="student@example.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={createLinkRequestMutation.isPending}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            Nhập email của tài khoản học sinh bạn muốn liên kết
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Lỗi</h4>
              <p className="text-sm text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">
                Thành công!
              </h4>
              <p className="text-sm text-green-700 mt-0.5">
                Yêu cầu liên kết đã được gửi. Vui lòng đợi quản trị viên duyệt.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            createLinkRequestMutation.isPending || !studentIdentifier.trim()
          }
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createLinkRequestMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              Gửi yêu cầu liên kết
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <h4 className="text-sm font-medium text-blue-900 mb-1">📌 Lưu ý</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Yêu cầu cần được quản trị viên hoặc giáo viên duyệt</li>
          <li>• Bạn sẽ nhận được thông báo khi yêu cầu được xử lý</li>
          <li>• Không thể gửi yêu cầu trùng lặp cho cùng một học sinh</li>
        </ul>
      </div>
    </div>
  )
}
