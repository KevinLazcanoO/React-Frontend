import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosClient from '../../api/axiosClient';
import type { AppUser, UsersState } from './usersTypes';

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
};

// Thunk que trae los usuarios. limit=0 devuelve TODOS (así resolvemos el autor de cualquier post).
// Con "select" pedimos solo los campos que usamos (payload más ligero).
export const fetchUsers = createAsyncThunk<AppUser[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get<{ users: AppUser[] }>(
        '/users?limit=0&select=firstName,lastName,username',
      );
      return data.users; // Guardamos solo el array de usuarios.
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Error al cargar usuarios')
        : 'Error inesperado';
      return rejectWithValue(message);
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Error al cargar usuarios';
      });
  },
});

export default usersSlice.reducer;
