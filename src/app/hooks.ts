import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Hook tipado para despachar acciones/thunks (evita usar "any" en cada componente).
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook tipado para leer el estado global con autocompletado y seguridad de tipos.
export const useAppSelector = useSelector.withTypes<RootState>();
