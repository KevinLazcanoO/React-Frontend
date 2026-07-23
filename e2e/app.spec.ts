import { test, expect } from '@playwright/test';

// Tests E2E del flujo principal: rutas protegidas, login y tabla de publicaciones.
// El login usa la API real de DummyJSON (requiere conexión).

test.describe('Flujo principal', () => {
  test('redirige a /login si no hay sesión (ruta protegida)', async ({ page }) => {
    await page.goto('/'); // Intentamos entrar al panel sin token.
    await expect(page).toHaveURL(/\/login$/); // ProtectedRoute nos manda a login.
    await expect(page.getByText('Iniciar sesión')).toBeVisible();
  });

  test('login correcto muestra la tabla de publicaciones', async ({ page }) => {
    await page.goto('/login');
    // Las credenciales vienen precargadas; solo pulsamos "Entrar".
    await page.getByRole('button', { name: 'Acceder' }).click();

    // Tras autenticar, se ve la cabecera del usuario y el listado.
    await expect(page.getByText('Listado de publicaciones')).toBeVisible();
    await expect(page.getByText('Emily')).toBeVisible();
    // La tabla trae datos reales (buscamos un título conocido del dataset de DummyJSON).
    await expect(page.getByText('His mother had always taught him')).toBeVisible();
  });

  test('la búsqueda global filtra la tabla', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Acceder' }).click();
    await expect(page.getByText('Listado de publicaciones')).toBeVisible();

    // Escribimos en el buscador y comprobamos que se filtra.
    await page.getByPlaceholder('Buscar por título, autor o etiqueta…').fill('candy bar');
    await expect(page.getByText('All he wanted was a candy bar.')).toBeVisible();
    await expect(page.getByText('His mother had always taught him')).toHaveCount(0);
  });
});
