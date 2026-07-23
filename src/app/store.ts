import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import uiReducer from '../features/ui/uiSlice';
import { loadPersistedState, persistState } from './persistence';

// Combinamos los reducers por separado para poder derivar RootState del propio
// rootReducer (y no de store.getState()). Así, el módulo de persistencia puede
// alimentar preloadedState sin crear una referencia circular de tipos.
const rootReducer = combineReducers({
  auth: authReducer, // Slice de autenticación.
  posts: postsReducer, // Slice de publicaciones (CRUD).
  users: usersReducer, // Slice de usuarios (listado para columna y filtro).
  ui: uiReducer, // Slice de interfaz (toasts globales y loading).
});

// Forma completa del estado global (derivada de los reducers).
export type RootState = ReturnType<typeof rootReducer>;

// configureStore arma el store con buenas prácticas por defecto (Redux DevTools, thunk, etc.).
export const store = configureStore({
  reducer: rootReducer,
  // Rehidratamos el estado guardado en localStorage al arrancar (persistencia global).
  preloadedState: loadPersistedState() as Partial<RootState>,
});

// Guardamos el estado en localStorage cada vez que cambia, con un pequeño throttle
// para no escribir en cada acción (mejor rendimiento).
let persistTimer: ReturnType<typeof setTimeout> | null = null;
store.subscribe(() => {
  if (persistTimer) return; // Ya hay un guardado programado.
  persistTimer = setTimeout(() => {
    persistState(store.getState());
    persistTimer = null;
  }, 500);
});

export type AppDispatch = typeof store.dispatch; // Tipo del dispatch (conoce los thunks).
