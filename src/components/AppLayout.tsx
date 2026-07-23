import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

// Layout común de las páginas privadas: cabecera fija + contenido (Outlet).
export default function AppLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  // Clase dinámica: resalta el enlace de la ruta activa (NavLink expone isActive).
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `no-underline px-3 py-2 border-round ${isActive ? 'bg-primary text-white' : 'text-color'}`;

  return (
    <div className="min-h-screen surface-ground">
      {/* Cabecera superior */}
      <header className="flex align-items-center justify-content-between px-4 py-3 surface-card shadow-2">
        <div className="flex align-items-center gap-3">
          <span className="text-xl font-bold flex align-items-center gap-2">
            <i className="pi pi-clipboard" />
            App
          </span>
          {/* Navegación principal */}
          <nav className="flex gap-2">
            <NavLink to="/" end className={linkClass}>
              {t('nav.posts')}
            </NavLink>
            <NavLink to="/docs" className={linkClass}>
              {t('nav.help')}
            </NavLink>
          </nav>
        </div>

        <div className="flex align-items-center gap-3">
          {/* Selector de idioma */}
          <LanguageSelector />
          {/* Alternar modo claro/oscuro */}
          <ThemeToggle />
          {/* Avatar con la foto del usuario y su nombre */}
          <Avatar image={user?.image} shape="circle" />
          <span className="hidden sm:inline">
            {user?.firstName} {user?.lastName}
          </span>
          {/* Logout: limpia Redux + localStorage y la ruta protegida redirige a /login */}
          <Button
            label={t('actions.logout')}
            icon="pi pi-sign-out"
            severity="secondary"
            text
            onClick={() => dispatch(logout())}
          />
        </div>
      </header>

      {/* Aquí se renderiza la página activa (PostsPage, /docs, etc.) */}
      <main className="p-3 md:p-4">
        <Outlet />
      </main>
    </div>
  );
}
