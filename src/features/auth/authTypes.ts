// Datos del usuario autenticado que devuelve DummyJSON tras el login.
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

// Respuesta completa del endpoint POST /auth/login.
// DummyJSON nuevo devuelve "accessToken"; el antiguo devolvía "token". Aceptamos ambos.
export interface LoginResponse extends AuthUser {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}

// Credenciales que enviamos en el body del login.
export interface LoginCredentials {
  username: string;
  password: string;
}

// Forma del estado de autenticación dentro de Redux.
export interface AuthState {
  user: AuthUser | null; // Usuario logueado (o null si no hay sesión).
  token: string | null; // Token JWT para autorizar las llamadas a la API.
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Estado de la petición de login.
  error: string | null; // Mensaje de error a mostrar en la UI.
}
