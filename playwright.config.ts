import { defineConfig, devices } from '@playwright/test';

// Configuración de Playwright para los tests end-to-end.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173', // URL del servidor de desarrollo.
    trace: 'on-first-retry', // Guarda un trace si un test falla al reintentar.
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta (o reutiliza) el servidor de Vite antes de correr los tests.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
