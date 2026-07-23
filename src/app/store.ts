import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import uiReducer from '../features/ui/uiSlice';

// configureStore arma el store con buenas prácticas por defecto (Redux DevTools, thunk, etc.).
export const store = configureStore({
  reducer: {
    auth: authReducer, // Slice de autenticación.
    posts: postsReducer, // Slice de publicaciones (CRUD).
    users: usersReducer, // Slice de usuarios (listado para columna y filtro).
    ui: uiReducer, // Slice de interfaz (toasts globales y loading).
  },
});

// Tipos derivados del store para usarlos en toda la app con TypeScript estricto.
export type RootState = ReturnType<typeof store.getState>; // Forma completa del estado global.
export type AppDispatch = typeof store.dispatch; // Tipo del dispatch (conoce los thunks).
