import { Check, Globe, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from '../../../node_modules/react-i18next'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
]

interface LanguageSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LanguageSettingsModal({
  isOpen,
  onClose,
}: LanguageSettingsModalProps) {
  const { i18n } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLanguageChange = async (languageCode: string) => {
    setLoading(true)
    try {
      await i18n.changeLanguage(languageCode)
      setSelectedLanguage(languageCode)

      // Save to localStorage for persistence
      localStorage.setItem('preferredLanguage', languageCode)

      toast.success(
        languageCode === 'vi'
          ? 'Đã chuyển sang Tiếng Việt'
          : 'Language changed to English'
      )

      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Error changing language:', error)
      toast.error(
        languageCode === 'vi'
          ? 'Có lỗi khi thay đổi ngôn ngữ'
          : 'Error changing language'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Ngôn ngữ / Language</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={loading}
              className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                selectedLanguage === language.code
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <p className="font-medium">{language.nativeName}</p>
                  <p className="text-sm text-gray-500">{language.name}</p>
                </div>
              </div>

              {selectedLanguage === language.code && (
                <Check className="h-5 w-5 text-blue-500" />
              )}

              {loading && selectedLanguage === language.code && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <strong>Lưu ý:</strong> Thay đổi ngôn ngữ sẽ được áp dụng ngay lập
            tức và lưu trong trình duyệt của bạn.
          </p>
        </div>
      </div>
    </div>
  )
}
