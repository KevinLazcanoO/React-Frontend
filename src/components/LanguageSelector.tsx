import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import { SUPPORTED_LANGUAGES, type Language } from '../i18n';

// Selector de idioma (Español / Inglés). Cambia el idioma en caliente y lo persiste
// (i18next-browser-languagedetector guarda la elección en localStorage).
export default function LanguageSelector() {
  const { t, i18n } = useTranslation();

  // Idioma activo normalizado (por si viene como "es-ES" lo reducimos a "es").
  const current = (i18n.resolvedLanguage ?? i18n.language).slice(0, 2) as Language;

  const options = SUPPORTED_LANGUAGES.map((lng) => ({
    label: lng === 'es' ? t('language.spanish') : t('language.english'),
    value: lng,
  }));

  return (
    <Dropdown
      value={current}
      options={options}
      onChange={(e) => i18n.changeLanguage(e.value)}
      aria-label={t('language.label')}
      className="w-10rem"
    />
  );
}
