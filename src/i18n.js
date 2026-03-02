import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// استيراد ملفات JSON
import translationAR from './locales/ar.json';
import translationDE from './locales/de.json';
import translationEn from './locales/en.json';

const resources = {
  ar: {
    translation: translationAR
  },
  de: {
    translation: translationDE
  },
  en: {
    translation: translationEn
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;