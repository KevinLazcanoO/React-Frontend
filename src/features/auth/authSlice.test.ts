import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout } from './authSlice';
import type { AuthState, AuthUser } from './authTypes';

// Mockeamos el cliente axios para NO llamar a la API real en los tests.
vi.mock('../../api/axiosClient', () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));
import axiosClient from '../../api/axiosClient';
const mockedPost = axiosClient.post as unknown as Mock;

// Usuario de ejemplo reutilizable.
const user: AuthUser = {
  id: 1,
  username: 'emilys',
  email: 'emily@x.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  gender: 'female',
  image: '',
};

const initialState: AuthState = { user: null, token: null, status: 'idle', error: null };

describe('authSlice (reducers)', () => {
  beforeEach(() => localStorage.clear()); // Limpiamos el almacenamiento entre tests.

  it('logout limpia usuario y token', () => {
    const logged: AuthState = { user, token: 'abc', status: 'succeeded', error: null };
    const next = authReducer(logged, logout());
    expect(next.token).toBeNull();
    expect(next.user).toBeNull();
    expect(next.status).toBe('idle');
  });

  it('login.fulfilled guarda token y usuario (acepta accessToken)', () => {
    const payload = { ...user, accessToken: 'jwt-token' };
    const next = authReducer(initialState, login.fulfilled(payload, 'reqId', { username: '', password: '' }));
    expect(next.token).toBe('jwt-token');
    expect(next.user?.username).toBe('emilys');
    expect(next.status).toBe('succeeded');
    expect(localStorage.getItem('token')).toBe('jwt-token'); // Verifica la persistencia.
  });

  it('login.rejected guarda el mensaje de error', () => {
    const next = authReducer(
      initialState,
      login.rejected(null, 'reqId', { username: '', password: '' }, 'Credenciales inválidas'),
    );
    expect(next.status).toBe('failed');
    expect(next.error).toBe('Credenciales inválidas');
  });
});

describe('authSlice (thunk login)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedPost.mockReset();
  });

  it('login exitoso almacena el token en el estado', async () => {
    mockedPost.mockResolvedValue({ data: { ...user, accessToken: 'jwt-token' } });
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(login({ username: 'emilys', password: 'emilyspass' }));
    expect(store.getState().auth.token).toBe('jwt-token');
    expect(store.getState().auth.status).toBe('succeeded');
  });

  it('login inválido deja el estado en "failed" sin token', async () => {
    mockedPost.mockRejectedValue(new Error('401'));
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(login({ username: 'x', password: 'y' }));
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.status).toBe('failed');
  });
});
