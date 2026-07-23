import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

// Severidad de un toast (coincide con las de PrimeReact).
export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

// Un mensaje de notificación en la cola.
export interface UiToast {
  id: string; // Identificador único para poder quitarlo luego.
  severity: ToastSeverity;
  summary: string;
  detail?: string;
}

interface UiState {
  toasts: UiToast[]; // Cola de notificaciones pendientes de mostrar.
  pendingCount: number; // Nº de peticiones asíncronas en curso (para el loading global).
}

const initialState: UiState = {
  toasts: [],
  pendingCount: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Añade un toast a la cola. "prepare" genera el id automáticamente con nanoid.
    showToast: {
      reducer: (state, action: PayloadAction<UiToast>) => {
        state.toasts.push(action.payload);
      },
      prepare: (toast: Omit<UiToast, 'id'>) => ({ payload: { id: nanoid(), ...toast } }),
    },
    // Quita un toast de la cola una vez mostrado.
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // addMatcher detecta CUALQUIER thunk en estado "pending" (auth, posts, users...).
      // Así el loading global funciona automáticamente sin tocar cada slice.
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.pendingCount += 1;
        },
      )
      // Cuando un thunk termina (éxito o error), decrementamos el contador.
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          state.pendingCount = Math.max(0, state.pendingCount - 1);
        },
      );
  },
});

export const { showToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
