import type en from './locales/en'

// Makes every t('…') key type-checked and autocompleted against en.ts.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
    }
  }
}
