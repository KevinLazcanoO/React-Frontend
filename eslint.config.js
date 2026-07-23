import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// Config "flat" de ESLint 9 (el formato moderno, sin .eslintrc).
export default tseslint.config(
  { ignores: ['dist', 'coverage'] }, // Carpetas que no se analizan.
  {
    // Reglas base de JS + TypeScript recomendadas.
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser, // Variables globales del navegador (window, document...).
    },
    plugins: {
      'react-hooks': reactHooks, // Reglas de los hooks de React.
      'react-refresh': reactRefresh, // Compatibilidad con Fast Refresh de Vite.
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // exhaustive-deps, rules-of-hooks, etc.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  prettier, // Desactiva reglas de estilo que chocarían con Prettier (debe ir al final).
);
