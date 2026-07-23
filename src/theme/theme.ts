// Gestión del tema (claro/oscuro) de PrimeReact.
// Importamos las hojas de estilo de cada tema como URL (?url). Vite las incluye en el
// build y nos da la ruta final del asset, para poder intercambiarlas en caliente.
import lightThemeUrl from 'primereact/resources/themes/lara-light-blue/theme.css?url';
import darkThemeUrl from 'primereact/resources/themes/lara-dark-blue/theme.css?url';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'theme'; // Clave en localStorage para persistir la preferencia.
const LINK_ID = 'app-theme-link'; // Id del <link> que sostiene el tema activo.

// Devuelve el tema guardado; si no hay ninguno, respeta la preferencia del sistema.
export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

// Aplica el tema: crea (o reutiliza) el <link> del tema y persiste la elección.
export function applyTheme(theme: Theme): void {
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = theme === 'dark' ? darkThemeUrl : lightThemeUrl;
  // Marca en <html> por si queremos afinar estilos propios según el tema.
  document.documentElement.classList.toggle('app-dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}
