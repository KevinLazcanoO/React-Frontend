/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Plugin que habilita JSX/TSX y Fast Refresh en React.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // Activamos el soporte de React en el build de Vite.
  test: {
    globals: true, // Permite usar describe/it/expect sin importarlos en cada test.
    environment: 'jsdom', // Simula el DOM del navegador para poder renderizar componentes en los tests.
    setupFiles: './src/test/setup.ts', // Archivo que se ejecuta antes de cada suite de tests.
  },
});
