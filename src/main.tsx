import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';
import App from './App';
import { store } from './app/store';

// --- Estilos de PrimeReact (orden recomendado por la evaluación) ---
import 'primereact/resources/themes/lara-light-blue/theme.css'; // Tema visual (colores, tipografía).
import 'primereact/resources/primereact.min.css'; // Estilos base de los componentes.
import 'primeicons/primeicons.css'; // Iconos (pi pi-*).
import 'primeflex/primeflex.css'; // Utilidades de layout tipo Tailwind (flex, gap, etc.).
import './index.css'; // Nuestros estilos globales.

// createRoot monta la app de React en el div#root del index.html.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Provider inyecta el store de Redux en TODA la app */}
    <Provider store={store}>
      {/* PrimeReactProvider permite configuración global de los componentes de PrimeReact */}
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </Provider>
  </StrictMode>,
);
