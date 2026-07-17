import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

const ADMIN_ROUTES = [
  '/admin/inicio', '/admin/crm', '/admin/clientes', '/admin/agenda', '/admin/reservas',
  '/admin/catalogo', '/admin/datos-maestros', '/admin/centros', '/admin/entrenadores', '/admin/finanzas',
];

// Ruido conocido e inofensivo del entorno (CDN de Tailwind bloqueado en el sandbox, etc.) — nunca un fallo real.
const IGNORED_PATTERNS = [/tailwind/i, /process is not defined/i, /ERR_TUNNEL_CONNECTION_FAILED/i];
const isIgnored = (text: string) => IGNORED_PATTERNS.some(p => p.test(text));

/**
 * Barrido de humo (smoke) de toda la app admin — reemplaza al script
 * ad-hoc `autonomous-full-sweep.mjs` de sesiones anteriores. No sustituye
 * a las pruebas de cada módulo; solo detecta que ninguna pantalla
 * principal rompe al cargar ni deja errores de consola reales.
 */
test.describe('Smoke — barrido completo de la app', () => {
  test('todas las rutas admin cargan sin errores de consola', async ({ page }) => {
    const issues: string[] = [];
    page.on('pageerror', e => { if (!isIgnored(e.message)) issues.push(`pageerror: ${e.message}`); });
    page.on('console', msg => {
      if (msg.type() !== 'error' && msg.type() !== 'warning') return;
      if (!isIgnored(msg.text())) issues.push(`console.${msg.type()}: ${msg.text()}`);
    });

    await loginAsAdmin(page);
    for (const path of ADMIN_ROUTES) {
      await page.goto(`/#${path}`);
      await page.waitForTimeout(400);
    }

    expect(issues, issues.join('\n')).toHaveLength(0);
  });
});
