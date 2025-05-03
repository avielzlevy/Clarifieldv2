import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend) // Load translations from /locales
  .use(initReactI18next)
  .init({
    // debug: true,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false, // React already escapes content
    },
  });

export default i18n;
