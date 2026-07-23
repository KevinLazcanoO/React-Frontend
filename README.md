# 📋 SPA de Publicaciones — Examen Frontend Avanzado

Single Page Application desarrollada con **React + TypeScript + Redux Toolkit + PrimeReact**, que implementa autenticación JWT, un CRUD completo de publicaciones con tabla avanzada, formularios validados, visor de PDF y estado global.

La API de datos es la pública **[DummyJSON](https://dummyjson.com)**.

---

## 🚀 Stack técnico

| Herramienta                            | Uso                                  |
| -------------------------------------- | ------------------------------------ |
| **React 18 + TypeScript (estricto)**   | Base de la aplicación                |
| **Vite**                               | Build y servidor de desarrollo       |
| **Redux Toolkit + React Redux**        | Estado global (slices + thunks)      |
| **React Router DOM v6**                | Rutas públicas y privadas            |
| **PrimeReact + PrimeFlex + PrimeIcons**| Componentes UI y layout              |
| **Axios**                              | Peticiones HTTP (con interceptor)    |
| **react-hook-form**                    | Formularios y validaciones           |
| **react-pdf**                          | Renderizado de PDF                   |
| **Vitest + Testing Library**           | Tests unitarios                      |
| **ESLint + Prettier**                  | Calidad y formato de código          |

---

## 🔑 Credenciales de acceso

> ⚠️ **Importante:** el enunciado indica `kminchelle / 0lelplR`, pero **DummyJSON actualizó sus usuarios** y esas credenciales ya no funcionan. El usuario válido actual es:

```
usuario:    emilys
contraseña: emilyspass
```

(El formulario de login ya viene precargado con estas credenciales.)

---

## 📦 Instalación y scripts

```bash
npm install        # Instala dependencias

npm run dev        # Servidor de desarrollo (http://localhost:5173)
npm run build      # Build de producción (type-check + Vite build)
npm run preview    # Sirve el build de producción localmente

npm test           # Ejecuta los tests una vez
npm run test:watch # Tests en modo watch
npm run lint       # Analiza el código con ESLint
npm run format     # Formatea el código con Prettier
```

---

## 🧩 Funcionalidades (según la rúbrica)

1. **Autenticación** — Login con JWT, token guardado en Redux y persistido en `localStorage`, rutas protegidas (redirige a `/login` sin token) y logout que limpia todo.
2. **Tabla de publicaciones** — `DataTable` de PrimeReact con columnas ID/Título/Usuario/Tags/Reacciones/Acciones, búsqueda global, filtros por usuario (`Dropdown`) y tags (`MultiSelect`), paginación, y acciones Ver/Editar/Eliminar con `Toolbar`, `Toast` y `ConfirmDialog`.
3. **Formulario** — Crear y editar con `react-hook-form` + `Controller` (`InputText`, `InputTextarea`, `Dropdown`, `Chips`), validaciones, `POST /posts/add` y `PUT /posts/:id`.
4. **Visor de PDF** — Ruta `/docs` con `react-pdf`: ver, navegar entre páginas, zoom in/out y descargar. Controles con `Button` e `InputText`.
5. **Estado global** — Slices `auth`, `posts`, `users` y `ui` (toasts y loading global). Peticiones con `createAsyncThunk`.
6. **Calidad** — TypeScript estricto, ESLint + Prettier, accesibilidad básica y tests unitarios.

---

## 🗂️ Estructura del proyecto

```
src/
├── api/axiosClient.ts          # Instancia de axios + interceptor que inyecta el token
├── app/
│   ├── store.ts                # Configuración del store de Redux
│   └── hooks.ts                # Hooks tipados (useAppDispatch / useAppSelector)
├── features/                   # Un módulo por dominio (arquitectura por features)
│   ├── auth/                   # authSlice, tipos y tests
│   ├── posts/                  # postsSlice (CRUD), tipos y tests
│   ├── users/                  # usersSlice (listado)
│   └── ui/                     # uiSlice (toasts globales + loading), tests
├── components/
│   ├── AppLayout.tsx           # Cabecera común de páginas privadas
│   ├── GlobalToast.tsx         # Toast único alimentado por Redux
│   └── GlobalLoadingBar.tsx    # Barra de carga automática
├── routes/ProtectedRoute.tsx   # Guardia de rutas privadas
├── pages/                      # LoginPage, PostsPage, PostFormPage, DocsPage
├── App.tsx                     # Enrutado
└── main.tsx                    # Providers + estilos de PrimeReact
```

---

## 🏛️ Decisiones de arquitectura

- **Filtrado y paginación en cliente.** DummyJSON no permite combinar en una sola petición búsqueda + filtro por usuario + filtro por varios tags. Como el dataset es pequeño (~251 posts), se cargan todos una vez y el `DataTable` gestiona búsqueda, filtros y paginación de forma que **se combinan correctamente entre sí**. El thunk `fetchPosts` acepta `{ limit, skip }` para migrar a modo _lazy_ (server-side) si el dataset creciera.
- **Caché de carga.** `PostsPage` sólo consulta la API la primera vez (`status === 'idle'`), de modo que al volver del formulario se conservan en pantalla los cambios locales (altas/bajas/ediciones).
- **Notificaciones y loading centralizados.** El slice `ui` mantiene una cola de toasts y un contador de peticiones. Un único `GlobalToast` muestra los mensajes y una `GlobalLoadingBar` aparece automáticamente ante cualquier thunk en curso (vía `addMatcher` sobre las acciones `/pending` y `/fulfilled|/rejected`).

---

## 🧪 Tests

12 tests en 3 archivos con Vitest (`npm test`):

- `authSlice.test.ts` — reducers (`logout`, `login.fulfilled`/`rejected`) y thunk de **login** (éxito y fallo) con axios mockeado.
- `postsSlice.test.ts` — reducers del CRUD y thunk **fetchPosts**.
- `uiSlice.test.ts` — toasts y contador de carga.

---

## ♿ Accesibilidad

- `label` asociado (`htmlFor`) a cada campo de formulario.
- `aria-label` en botones de sólo icono y `aria-invalid` en campos con error.
- Estructura semántica (`banner`, `nav`, `main`) y navegación por teclado en los componentes de PrimeReact.

---

## ⚠️ Nota sobre DummyJSON

DummyJSON **simula** las escrituras: el `POST`, `PUT` y `DELETE` devuelven una respuesta correcta pero **no persisten** en el servidor. Por eso los cambios viven en el estado de Redux durante la sesión; una recarga completa del navegador (F5) restaura los datos originales de la API. Es el comportamiento esperado de esta API de pruebas.

---

## 🌟 Posibles mejoras (bonus)

- Migrar los thunks a **RTK Query**.
- **Optimistic UI** en editar/eliminar.
- Skeletons de carga en la tabla.
- Tests E2E (Cypress/Playwright) y Dockerfile.
