import { Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@misport.es';
export const ADMIN_PASSWORD = 'Misport123!';
export const ADMIN_USER_ID = 'u_admin_master';
export const ADMIN_USER_NAME = 'Admin MISPORT';

/**
 * Entra como el admin fijo de MISPORT OS. No limpia localStorage — cada
 * test de Playwright Test ya arranca con un contexto/página nuevos
 * (localStorage aislado por test, empieza vacío); limpiarlo aquí borraría
 * cualquier dato sembrado antes de llamar a esta función (p. ej. un
 * cliente ya registrado con `registerClient`).
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/#/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/#/admin/**', { timeout: 5000 });
}

/**
 * Registra un cliente nuevo (crea su sesión de CLIENT y, vía el puente del
 * Sprint 4, su Persona vinculada en Datos Maestros). Al terminar, cierra
 * esa sesión y recarga — necesario porque el estado de sesión vive tanto
 * en localStorage como en memoria de React (AppContext); sin recargar, la
 * SPA seguiría "viendo" al cliente logueado aunque se borre su clave de
 * localStorage. El llamador decide qué hacer después (normalmente:
 * loginAsAdmin, o volver a loguear como ese mismo cliente).
 */
export async function registerClient(page: Page, { name, email, password = 'Test1234!' }: { name: string; email: string; password?: string }) {
  await page.goto('/#/register');
  await page.waitForTimeout(250);
  await page.fill('input[type="text"]', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !location.hash.includes('register'), null, { timeout: 5000 });
  await page.waitForTimeout(250);
  await page.evaluate(() => localStorage.removeItem('misport_session'));
  await page.reload();
  await page.waitForTimeout(300);
}
