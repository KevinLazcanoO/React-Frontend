import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { createPost, deletePost, fetchPosts } from './postsSlice';
import type { Post, PostsState } from './postsTypes';

// Mockeamos axios para no golpear la API real.
vi.mock('../../api/axiosClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
import axiosClient from '../../api/axiosClient';
const mockedGet = axiosClient.get as unknown as Mock;

// Posts de ejemplo.
const post = (id: number): Post => ({
  id,
  title: `Post ${id}`,
  body: 'body',
  tags: ['a'],
  reactions: { likes: 2, dislikes: 1 },
  userId: id,
});

const initialState: PostsState = { items: [], total: 0, status: 'idle', error: null };

describe('postsSlice (reducers)', () => {
  it('fetchPosts.fulfilled carga items y total', () => {
    const payload = { posts: [post(1), post(2)], total: 2, skip: 0, limit: 0 };
    const next = postsReducer(initialState, fetchPosts.fulfilled(payload, 'req', undefined));
    expect(next.items).toHaveLength(2);
    expect(next.total).toBe(2);
    expect(next.status).toBe('succeeded');
  });

  it('deletePost.fulfilled elimina el post por id', () => {
    const state: PostsState = { ...initialState, items: [post(1), post(2)], total: 2 };
    const next = postsReducer(state, deletePost.fulfilled(1, 'req', { id: 1 }));
    expect(next.items.map((p) => p.id)).toEqual([2]);
    expect(next.total).toBe(1);
  });

  it('createPost.fulfilled inserta al inicio y normaliza reactions', () => {
    const state: PostsState = { ...initialState, items: [post(1)], total: 1 };
    // Simulamos la respuesta de DummyJSON al crear: SIN reactions.
    const created = { id: 99, title: 'Nuevo', body: 'x', tags: ['n'], userId: 1 } as unknown as Post;
    const next = postsReducer(
      state,
      createPost.fulfilled(created, 'req', { title: 'Nuevo', body: 'x', userId: 1, tags: ['n'] }),
    );
    expect(next.items[0].id).toBe(99); // Aparece al principio.
    expect(next.items[0].reactions).toEqual({ likes: 0, dislikes: 0 }); // Normalizado.
    expect(next.total).toBe(2);
  });
});

describe('postsSlice (thunk fetchPosts)', () => {
  beforeEach(() => mockedGet.mockReset());

  it('carga los posts desde la API', async () => {
    mockedGet.mockResolvedValue({
      data: { posts: [post(1), post(2), post(3)], total: 3, skip: 0, limit: 0 },
    });
    const store = configureStore({ reducer: { posts: postsReducer } });
    await store.dispatch(fetchPosts());
    expect(store.getState().posts.items).toHaveLength(3);
    expect(store.getState().posts.status).toBe('succeeded');
  });
});
