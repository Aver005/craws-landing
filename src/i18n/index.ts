import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import ru from './locales/ru'

// To add a language: create locales/<code>.ts typed as `typeof en`,
// register it here and in LANGS — that's the whole checklist.
export const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    // English for everyone until they flip the switch — detection reads only
    // the saved choice, never the browser language.
    fallbackLng: 'en',
    supportedLngs: LANGS.map((l) => l.code),
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'craws-lang',
    },
    interpolation: { escapeValue: false }, // React escapes on its own
  })

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng
}
i18n.on('languageChanged', syncHtmlLang)
syncHtmlLang(i18n.resolvedLanguage ?? 'en')

export default i18n
