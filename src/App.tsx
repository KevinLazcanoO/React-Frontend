import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';
import GlobalToast from './components/GlobalToast';
import GlobalLoadingBar from './components/GlobalLoadingBar';
import LoginPage from './pages/LoginPage';
import PostsPage from './pages/PostsPage';
import PostFormPage from './pages/PostFormPage';
import DocsPage from './pages/DocsPage';

export default function App() {
  return (
    // BrowserRouter habilita el enrutado basado en la URL del navegador.
    <BrowserRouter>
      {/* Componentes globales: notificaciones y barra de carga en toda la app */}
      <GlobalToast />
      <GlobalLoadingBar />
      <Routes>
        {/* Ruta pública: cualquiera puede acceder al login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas: ProtectedRoute verifica el token antes de renderizar */}
        <Route element={<ProtectedRoute />}>
          {/* AppLayout aporta la cabecera común a todas las páginas privadas */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<PostsPage />} />
            <Route path="/posts/new" element={<PostFormPage />} />
            <Route path="/posts/:id/edit" element={<PostFormPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>
        </Route>

        {/* Cualquier ruta desconocida redirige a la principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
