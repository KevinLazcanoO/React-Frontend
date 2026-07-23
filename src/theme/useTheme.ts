import { useCallback, useState } from 'react';
import { applyTheme, getStoredTheme, type Theme } from './theme';

// Hook que expone el tema actual y una función para alternarlo.
// El estado inicial se lee de localStorage (o de la preferencia del sistema).
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next); // Cambia el <link> del tema y persiste la elección.
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
