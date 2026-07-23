import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

// Componente "guardia" que envuelve las rutas privadas.
export default function ProtectedRoute() {
  // Leemos el token del estado global de Redux.
  const token = useAppSelector((state) => state.auth.token);

  // Si NO hay token, redirigimos al login (replace evita volver atrás con el botón del navegador).
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizamos la ruta hija anidada (Outlet = "hueco" donde va la página protegida).
  return <Outlet />;
}
