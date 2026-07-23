import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';
import type {
  DeletePostArg,
  FetchPostsParams,
  Post,
  PostFormData,
  PostsResponse,
  PostsState,
  UpdatePostArg,
} from './postsTypes';

const initialState: PostsState = {
  items: [],
  total: 0,
  status: 'idle',
  error: null,
  optimisticBackups: {},
};

// Helper para uniformar el manejo de errores de axios en todos los thunks.
const getErrorMessage = (err: unknown, fallback: string): string =>
  axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback;

// Thunk de carga. limit=0 en DummyJSON devuelve TODOS los posts (filtramos/paginamos en cliente).
// Para modo lazy (server-side) bastaría con pasar { limit: 10, skip: page*10 }.
export const fetchPosts = createAsyncThunk<PostsResponse, FetchPostsParams | void, { rejectValue: string }>(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const { limit = 0, skip = 0 } = params ?? {};
      const { data } = await axiosClient.get<PostsResponse>(`/posts?limit=${limit}&skip=${skip}`);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Error al cargar publicaciones'));
    }
  },
);

// Thunk de creación. POST /posts/add: DummyJSON simula el alta y devuelve el post con un id nuevo.
export const createPost = createAsyncThunk<Post, PostFormData, { rejectValue: string }>(
  'posts/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post<Post>('/posts/add', formData);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Error al crear la publicación'));
    }
  },
);

// Thunk de edición. PUT /posts/:id: envía solo los cambios y devuelve el post actualizado.
export const updatePost = createAsyncThunk<Post, UpdatePostArg, { rejectValue: string }>(
  'posts/updatePost',
  async ({ id, changes, isLocal }, { rejectWithValue }) => {
    try {
      // Los posts creados en la app no existen en el servidor: los actualizamos solo en local.
      // El reducer fusiona con el post existente, así que conserva reactions/views.
      if (isLocal) return { id, ...changes, isLocal: true } as Post;
      const { data } = await axiosClient.put<Post>(`/posts/${id}`, changes);
      return data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Error al editar la publicación'));
    }
  },
);

// Thunk de borrado. DummyJSON simula el DELETE y devuelve el post con isDeleted:true.
export const deletePost = createAsyncThunk<number, DeletePostArg, { rejectValue: string }>(
  'posts/deletePost',
  async ({ id, isLocal }, { rejectWithValue }) => {
    try {
      // Solo llamamos a la API para posts reales; los locales (id inexistente) darían 404.
      if (!isLocal) await axiosClient.delete<Post>(`/posts/${id}`);
      return id; // Devolvemos el id para quitarlo del estado local.
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Error al eliminar la publicación'));
    }
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Carga de publicaciones ---
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.posts;
        state.total = action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Error al cargar publicaciones';
      })
      // --- Creación: insertamos el nuevo post al principio de la lista ---
      .addCase(createPost.fulfilled, (state, action) => {
        // La API no devuelve reactions/views al crear; los normalizamos para evitar errores en la tabla.
        const created: Post = {
          ...action.payload,
          reactions: action.payload.reactions ?? { likes: 0, dislikes: 0 },
          tags: action.payload.tags ?? [],
          views: action.payload.views ?? 0,
          isLocal: true, // Marca: solo existe en la app, no en el servidor.
        };
        state.items.unshift(created); // unshift = añadir al inicio (aparece arriba en la tabla).
        state.total += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload ?? 'Error al crear la publicación';
      })
      // --- Edición (Optimistic UI) ---
      // pending: aplicamos los cambios YA en pantalla y guardamos un backup para revertir.
      .addCase(updatePost.pending, (state, action) => {
        if (!state.optimisticBackups) state.optimisticBackups = {}; // Defensa por rehidratación.
        const { id, changes } = action.meta.arg;
        const index = state.items.findIndex((post) => post.id === id);
        if (index !== -1) {
          state.optimisticBackups[id] = { post: state.items[index], index }; // Backup previo.
          state.items[index] = { ...state.items[index], ...changes }; // Cambio optimista.
        }
      })
      // fulfilled: confirmamos con lo que devuelve la API y descartamos el backup.
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex((post) => post.id === action.payload.id);
        if (index !== -1) state.items[index] = { ...state.items[index], ...action.payload };
        delete state.optimisticBackups[action.payload.id];
      })
      // rejected: revertimos al backup (el post vuelve a su estado anterior).
      .addCase(updatePost.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const backup = state.optimisticBackups?.[id];
        if (backup) {
          const index = state.items.findIndex((post) => post.id === id);
          if (index !== -1) state.items[index] = backup.post; // Restauramos.
          delete state.optimisticBackups[id];
        }
        state.error = action.payload ?? 'Error al editar la publicación';
      })
      // --- Borrado (Optimistic UI) ---
      // pending: quitamos el post YA de la lista y guardamos backup (post + posición).
      .addCase(deletePost.pending, (state, action) => {
        if (!state.optimisticBackups) state.optimisticBackups = {}; // Defensa por rehidratación.
        const { id } = action.meta.arg;
        const index = state.items.findIndex((post) => post.id === id);
        if (index !== -1) {
          state.optimisticBackups[id] = { post: state.items[index], index }; // Backup previo.
          state.items.splice(index, 1); // Borrado optimista.
          state.total = Math.max(0, state.total - 1);
        }
      })
      // fulfilled: el borrado se confirmó, descartamos el backup.
      .addCase(deletePost.fulfilled, (state, action) => {
        delete state.optimisticBackups[action.payload];
      })
      // rejected: reinsertamos el post en su posición original.
      .addCase(deletePost.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const backup = state.optimisticBackups?.[id];
        if (backup) {
          state.items.splice(backup.index, 0, backup.post); // Restauramos en su sitio.
          state.total += 1;
          delete state.optimisticBackups[id];
        }
        state.error = action.payload ?? 'Error al eliminar la publicación';
      });
  },
});

export default postsSlice.reducer;
