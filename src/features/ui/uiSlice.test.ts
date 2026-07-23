import { describe, it, expect } from 'vitest';
import uiReducer, { showToast, removeToast } from './uiSlice';

describe('uiSlice', () => {
  const initial = { toasts: [], pendingCount: 0 };

  it('showToast añade un toast con id autogenerado', () => {
    const next = uiReducer(initial, showToast({ severity: 'success', summary: 'Ok' }));
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBeTruthy(); // nanoid generó un id.
    expect(next.toasts[0].summary).toBe('Ok');
  });

  it('removeToast quita el toast por id', () => {
    const withToast = uiReducer(initial, showToast({ severity: 'info', summary: 'Hola' }));
    const id = withToast.toasts[0].id;
    const next = uiReducer(withToast, removeToast(id));
    expect(next.toasts).toHaveLength(0);
  });

  it('pendingCount sube con cualquier acción /pending y baja al terminar', () => {
    const p1 = uiReducer(initial, { type: 'posts/fetchPosts/pending' });
    const p2 = uiReducer(p1, { type: 'users/fetchUsers/pending' });
    expect(p2.pendingCount).toBe(2); // Dos peticiones en curso.
    const done = uiReducer(p2, { type: 'posts/fetchPosts/fulfilled' });
    expect(done.pendingCount).toBe(1); // Una terminó.
  });
});
