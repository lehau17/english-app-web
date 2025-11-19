import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector/cjs'
import { initReactI18next } from '../node_modules/react-i18next'
import en from './locales/en/translation.json'
import vi from './locales/vi/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
    },
    fallbackLng: 'vi',
    lng: 'vi',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
