import { ProgressBar } from 'primereact/progressbar';
import { useAppSelector } from '../app/hooks';

// Barra fina en la parte superior que se muestra mientras haya thunks en curso.
export default function GlobalLoadingBar() {
  // pendingCount > 0 significa que al menos una petición asíncrona está activa.
  const loading = useAppSelector((state) => state.ui.pendingCount > 0);

  if (!loading) return null; // No renderizamos nada si no hay cargas.

  return (
    <ProgressBar
      mode="indeterminate" // Animación continua (no sabemos el % exacto).
      style={{ height: '3px', borderRadius: 0 }}
      className="fixed top-0 left-0 w-full z-5"
    />
  );
}
