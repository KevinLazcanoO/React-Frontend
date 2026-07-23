import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';
import { clearPersistedState } from '../../app/persistence';
import type { AuthState, LoginCredentials, LoginResponse } from './authTypes';

// Claves con las que guardamos la sesión en localStorage (persistencia).
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Estado inicial: intentamos rehidratar la sesión desde localStorage al arrancar.
// Así, si el usuario recarga la página, sigue logueado.
const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem(USER_KEY);

const initialState: AuthState = {
  token: storedToken, // Token recuperado (o null).
  user: storedUser ? JSON.parse(storedUser) : null, // Usuario recuperado y parseado.
  status: 'idle',
  error: null,
};

// THUNK de login: acción asíncrona que llama a la API.
// createAsyncThunk genera automáticamente 3 acciones: pending, fulfilled y rejected.
export const login = createAsyncThunk<
  LoginResponse, // Tipo de lo que devuelve si tiene éxito.
  LoginCredentials, // Tipo del argumento que recibe.
  { rejectValue: string } // Tipo del valor de error personalizado.
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // POST /auth/login con username y password; expiresInMins define la vida del token.
    const { data } = await axiosClient.post<LoginResponse>('/auth/login', {
      ...credentials,
      expiresInMins: 60,
    });
    return data; // Se convierte en el payload de la acción "fulfilled".
  } catch (err) {
    // Si axios devuelve un error HTTP (ej. 400 credenciales inválidas), lo capturamos.
    if (axios.isAxiosError(err)) {
      const message = err.response?.data?.message ?? 'Error de autenticación';
      return rejectWithValue(message); // Payload de la acción "rejected".
    }
    return rejectWithValue('Error inesperado en el login');
  }
});

const authSlice = createSlice({
  name: 'auth', // Prefijo para las acciones de este slice.
  initialState,
  reducers: {
    // Acción síncrona de logout: limpia estado y almacenamiento.
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(TOKEN_KEY); // Borramos el token persistido.
      localStorage.removeItem(USER_KEY); // Borramos el usuario persistido.
      clearPersistedState(); // Borramos el estado global persistido (ej. publicaciones cacheadas).
    },
    // Permite limpiar el error (ej. al cerrar un Toast o reintentar).
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  // extraReducers responde a las acciones generadas por el thunk asíncrono.
  extraReducers: (builder) => {
    builder
      // Mientras la petición está en curso: mostramos spinner y limpiamos errores.
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // Login correcto: guardamos usuario y token en el estado Y en localStorage.
      .addCase(login.fulfilled, (state, action) => {
        const { accessToken, token, ...user } = action.payload;
        const finalToken = accessToken ?? token ?? null; // Compatibilidad con ambas versiones de la API.
        state.status = 'succeeded';
        state.user = user;
        state.token = finalToken;
        if (finalToken) localStorage.setItem(TOKEN_KEY, finalToken); // Persistimos el token.
        localStorage.setItem(USER_KEY, JSON.stringify(user)); // Persistimos el usuario.
      })
      // Login fallido: guardamos el mensaje de error para mostrarlo en la UI.
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Error de autenticación';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions; // Exportamos las acciones síncronas.
export default authSlice.reducer; // Exportamos el reducer para registrarlo en el store.
