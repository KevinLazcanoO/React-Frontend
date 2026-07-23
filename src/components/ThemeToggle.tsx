import { Button } from 'primereact/button';
import { useTheme } from '../theme/useTheme';

// Posiciones admitidas por el tooltip de PrimeReact.
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface ThemeToggleProps {
  // Posición del tooltip. En el login (botón en la esquina) usamos 'left' para
  // que no se salga del viewport; por defecto 'bottom' para el header.
  tooltipPosition?: TooltipPosition;
}

// Botón que alterna entre modo claro y oscuro.
// Muestra el icono del tema al que se cambiaría, con aria-label accesible.
export default function ThemeToggle({ tooltipPosition = 'bottom' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
      rounded
      text
      severity="secondary"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      tooltip={isDark ? 'Modo claro' : 'Modo oscuro'}
      tooltipOptions={{ position: tooltipPosition }}
    />
  );
}
