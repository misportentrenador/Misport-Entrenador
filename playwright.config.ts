import { defineConfig, devices } from '@playwright/test';

/**
 * Framework de pruebas end-to-end versionado (Sprint 26, decisión de
 * arquitectura del Director General: Playwright Test como framework
 * principal). Sustituye a los scripts ad-hoc de sesiones anteriores
 * (vivían fuera del repositorio, en el scratchpad de cada sesión, y se
 * perdían al terminar) — desde este Sprint, toda prueba vive en `tests/`,
 * organizada por módulo, y se ejecuta con `npm run test:e2e`.
 *
 * Usa el Chromium ya preinstalado del entorno (nunca `playwright install`,
 * que intentaría descargar un navegador nuevo).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
