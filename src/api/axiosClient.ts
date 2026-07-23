import axios from 'axios';

// URL base de la API pública DummyJSON: todas las peticiones cuelgan de aquí.
export const API_BASE_URL = 'https://dummyjson.com';

// Creamos UNA sola instancia de axios reutilizable en toda la app.
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de PETICIÓN: se ejecuta antes de enviar cada request.
axiosClient.interceptors.request.use((config) => {
  // Leemos el token guardado en localStorage (persistencia entre recargas).
  const token = localStorage.getItem('token');
  // Si hay token, lo adjuntamos en el header Authorization como Bearer.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; // Devolvemos la config (posiblemente modificada) para que continúe.
});

export default axiosClient;
