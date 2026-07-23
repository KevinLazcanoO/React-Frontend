// Reacciones: DummyJSON nuevo usa un objeto; el antiguo usaba un número. Aceptamos ambos.
export interface PostReactions {
  likes: number;
  dislikes: number;
}

// Entidad Publicación tal como la devuelve la API.
export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: PostReactions | number;
  views?: number;
  userId: number;
  isLocal?: boolean; // true si se creó en la app (no existe en el servidor DummyJSON).
}

// Respuesta paginada del endpoint GET /posts.
export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

// Parámetros de paginación server-side (los dejamos preparados para modo lazy).
export interface FetchPostsParams {
  limit?: number;
  skip?: number;
}

// Datos que maneja el formulario (crear/editar). Es lo que enviamos a la API.
export interface PostFormData {
  title: string;
  body: string;
  userId: number;
  tags: string[];
}

// Argumento del thunk de edición: id del post + los cambios.
export interface UpdatePostArg {
  id: number;
  changes: PostFormData;
  isLocal?: boolean; // Si es local, no llamamos a la API (el servidor no lo conoce).
}

// Argumento del thunk de borrado.
export interface DeletePostArg {
  id: number;
  isLocal?: boolean; // Si es local, lo quitamos solo del estado sin llamar a la API.
}

// Copia de seguridad de una publicación para poder revertir un cambio optimista.
export interface OptimisticBackup {
  post: Post; // Estado del post ANTES del cambio.
  index: number; // Posición que ocupaba en la lista (para restaurarlo en su sitio).
}

// Forma del estado de publicaciones en Redux.
export interface PostsState {
  items: Post[]; // Publicaciones cargadas.
  total: number; // Total de registros en el servidor (útil para paginación server-side).
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // Backups por id para revertir editar/eliminar si la API falla (Optimistic UI).
  optimisticBackups: Record<number, OptimisticBackup>;
}
