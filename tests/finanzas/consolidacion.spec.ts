import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { seedPersona, reloadApp, readStorage } from '../helpers/seed';

/**
 * Sprint 25 — Consolidación de Finanzas: PagoFormFields como único
 * formulario de alta de sesiones/pagos, compartido entre el "Registro"
 * general de Finanzas y la Ficha del cliente.
 */
test.describe('Finanzas — Consolidación del registro de pagos', () => {
  test('el "Registro" general ofrece un selector de cliente opcional y overrides manuales', async ({ page }) => {
    await loginAsAdmin(page);
    await seedPersona(page, { id: 'per_consolidacion', name: 'Cliente Consolidacion', email: 'consolidacion@test.es' });
    await reloadApp(page);

    await page.goto('/#/admin/finanzas');
    await page.getByRole('button', { name: 'Registrar sesión' }).click();

    const form = page.locator('form').filter({ hasText: 'Nueva sesión' });
    await expect(form.getByText('Cliente (opcional)')).toBeVisible();
    await expect(form.getByText('Overrides manuales')).toBeVisible();

    await form.locator('select').nth(3).selectOption({ label: 'Cliente Consolidacion' });
    await form.locator('input[type="number"]').first().fill('1');
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    const entries = await readStorage<{ personaId?: string }>(page, 'misport_finance_entries');
    expect(entries.some(e => e.personaId === 'per_consolidacion')).toBe(true);

    // Debe aparecer ahora en el Historial de pagos de su Ficha (antes era invisible).
    await page.goto('/#/admin/crm/personas/per_consolidacion');
    await page.getByRole('button', { name: 'Económica' }).click();
    await expect(page.locator('table').filter({ hasText: 'Fecha' }).locator('tbody tr')).toHaveCount(1);
  });

  test('sin cliente seleccionado, el "Registro" general se comporta igual que antes', async ({ page }) => {
    await loginAsAdmin(page);
    await reloadApp(page);

    await page.goto('/#/admin/finanzas');
    await page.getByRole('button', { name: 'Registrar sesión' }).click();
    const form = page.locator('form').filter({ hasText: 'Nueva sesión' });
    await form.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    const entries = await readStorage<{ personaId?: string }>(page, 'misport_finance_entries');
    expect(entries).toHaveLength(1);
    expect(entries[0].personaId).toBeUndefined();
  });

  test('la Ficha del cliente no muestra un selector de cliente redundante', async ({ page }) => {
    await loginAsAdmin(page);
    await seedPersona(page, { id: 'per_consolidacion2', name: 'Cliente Consolidacion2', email: 'consolidacion2@test.es' });
    await reloadApp(page);

    await page.goto('/#/admin/crm/personas/per_consolidacion2');
    await page.getByRole('button', { name: 'Económica' }).click();
    const form = page.locator('form').filter({ hasText: 'Registrar pago' });
    await expect(form.getByText('Cliente (opcional)')).toHaveCount(0);
    await expect(form.getByText('Overrides manuales')).toBeVisible();
  });
});
