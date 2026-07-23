import type { PostsState } from '../features/posts/postsTypes';

// Persistencia del estado global en localStorage (sin dependencias externas).
// Guardamos un subconjunto del store y lo rehidratamos al arrancar como preloadedState.
// Nota: `auth` ya persiste su token por su cuenta; aquí persistimos las publicaciones
// para que las creadas/editadas en la app sobrevivan a un refresco de página.
//
// Usamos tipos concretos (no RootState) a propósito: si este módulo dependiera de
// RootState, y RootState se infiere del store que usa este módulo en su preloadedState,
// TypeScript entraría en una referencia circular.

// Forma del estado que persistimos (un subconjunto del store).
export interface PersistedState {
  posts?: PostsState;
}

const PERSIST_KEY = 'app:state';

// Lee el estado persistido. Devuelve undefined si no hay nada o si está corrupto.
export function loadPersistedState(): PersistedState | undefined {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return undefined; // JSON inválido, etc. → arrancamos con el estado por defecto.
  }
}

// Guarda solo la parte relevante del estado.
export function persistState(state: { posts: PostsState }): void {
  try {
    // Solo persistimos las publicaciones cuando se cargaron correctamente:
    // así evitamos guardar estados de "loading"/"failed" que dejarían la tabla colgada.
    if (state.posts.status !== 'succeeded') return;

    const toPersist: PersistedState = {
      posts: {
        items: state.posts.items,
        total: state.posts.total,
        status: 'succeeded',
        error: null,
        optimisticBackups: {}, // Los backups son transitorios: no se persisten.
      },
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(toPersist));
  } catch {
    // Ignoramos errores de cuota o de serialización: la persistencia es "best effort".
  }
}

// Limpia el estado persistido (útil al cerrar sesión).
export function clearPersistedState(): void {
  try {
    localStorage.removeItem(PERSIST_KEY);
  } catch {
    // Sin acción.
  }
}
