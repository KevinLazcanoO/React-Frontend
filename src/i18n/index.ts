import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

// Idiomas soportados por la aplicación.
export const SUPPORTED_LANGUAGES = ['es', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  // Detecta el idioma: primero el guardado en localStorage, luego el del navegador.
  .use(LanguageDetector)
  // Conecta i18next con React (hook useTranslation, etc.).
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    load: 'languageOnly', // 'es-ES' o 'en-US' se reducen a 'es' / 'en'.
    fallbackLng: 'es', // Si no se detecta un idioma soportado, usamos español.
    interpolation: { escapeValue: false }, // React ya escapa los valores (evita doble escape).
    detection: {
      order: ['localStorage', 'navigator'], // Prioridad de detección.
      caches: ['localStorage'], // Persistimos la elección en localStorage.
      lookupLocalStorage: 'language', // Clave usada en localStorage.
    },
  });

export default i18n;
