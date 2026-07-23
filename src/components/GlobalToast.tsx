import { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { removeToast } from '../features/ui/uiSlice';

// Toast único y global: observa la cola del slice "ui" y muestra cada mensaje nuevo.
export default function GlobalToast() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();
  const ref = useRef<Toast>(null);

  useEffect(() => {
    // Por cada toast en la cola: lo mostramos y lo quitamos del estado.
    toasts.forEach((t) => {
      ref.current?.show({ severity: t.severity, summary: t.summary, detail: t.detail, life: 3000 });
      dispatch(removeToast(t.id)); // PrimeReact ya tiene su copia; podemos limpiar el store.
    });
  }, [toasts, dispatch]);

  return <Toast ref={ref} />;
}
