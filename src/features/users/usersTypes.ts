// Usuario tal como lo necesitamos para la columna y el filtro (subconjunto de /users).
export interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}

// Forma del estado de usuarios en Redux.
export interface UsersState {
  items: AppUser[]; // Listado de usuarios.
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
