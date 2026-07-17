import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { seedPersona, seedFinanceEntry, seedFiscalConfig, reloadApp, readStorage } from '../helpers/seed';

/** Sprint 19 (Facturación fase 1) + Sprint 20/24 (Tesorería — cobros parciales, formas de pago). */
test.describe('Finanzas — Facturación y Cobros', () => {
  test('bloquea "Generar factura" sin datos fiscales y genera con numeración correlativa', async ({ page }) => {
    await loginAsAdmin(page);
    await seedPersona(page, { id: 'per_fact', name: 'Cliente Facturacion', email: 'facturacion@test.es', docId: '11111111H' });
    await seedFinanceEntry(page, { id: 'fe_fact', date: '2026-07-10', trainerName: 'Misael', centerName: 'COWORKGYM', service: 'Electroestimulación', personaId: 'per_fact' });
    await reloadApp(page);

    await page.goto('/#/admin/crm/personas/per_fact');
    await page.getByRole('button', { name: 'Económica' }).click();

    await expect(page.getByRole('button', { name: 'Generar factura' })).toBeDisabled();

    // Los datos fiscales se guardan vía seedFiscalConfig — comprobamos que el aviso desaparece tras recargar.
    await seedFiscalConfig(page, { razonSocial: 'Misport SL', nif: 'B12345678', direccion: 'Calle Falsa 1' });
    await reloadApp(page);

    await page.goto('/#/admin/crm/personas/per_fact');
    await page.getByRole('button', { name: 'Económica' }).click();
    await expect(page.getByRole('button', { name: 'Generar factura' })).toBeEnabled();

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.getByRole('button', { name: 'Generar factura' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^factura-\d{4}-\d{4}\.pdf$/);

    const facturas = await readStorage<{ personaId: string; usuarioId?: string; usuarioNombre?: string }>(page, 'misport_finance_facturas');
    expect(facturas).toHaveLength(1);
    expect(facturas[0]).toMatchObject({ personaId: 'per_fact', usuarioId: 'u_admin_master', usuarioNombre: 'Admin MISPORT' });
  });

  test('admite cobros parciales, exige forma de pago y no permite sobre-cobrar', async ({ page }) => {
    await loginAsAdmin(page);
    await seedPersona(page, { id: 'per_cobros', name: 'Cliente Cobros', email: 'cobros@test.es', docId: '22222222J' });
    await seedFinanceEntry(page, { id: 'fe_cobros', date: '2026-07-10', trainerName: 'Misael', centerName: 'COWORKGYM', service: 'Electroestimulación', personaId: 'per_cobros' });
    await seedFiscalConfig(page, { razonSocial: 'Misport SL', nif: 'B1', direccion: 'Dir 1' });
    await reloadApp(page);

    await page.goto('/#/admin/crm/personas/per_cobros');
    await page.getByRole('button', { name: 'Económica' }).click();
    await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.getByRole('button', { name: 'Generar factura' }).click(),
    ]);
    await page.waitForTimeout(400);

    const facturaTotal = (await readStorage<{ total: number }>(page, 'misport_finance_facturas'))[0].total;
    const mitad = Math.round((facturaTotal / 2) * 100) / 100;

    // --- Filtro "Con deuda" y panel Dashboard, antes de cobrar ---
    await page.goto('/#/admin/crm');
    await page.getByRole('button', { name: 'Con deuda' }).click();
    await expect(page.getByText('Cliente Cobros')).toBeVisible();
    await page.goto('/#/admin/inicio');
    await expect(page.getByText('Cobros pendientes')).toBeVisible();

    // --- Cobro parcial ---
    await page.goto('/#/admin/crm/personas/per_cobros');
    await page.getByRole('button', { name: 'Económica' }).click();
    await page.getByRole('button', { name: 'Registrar cobro' }).click();
    let modal = page.locator('[role="dialog"]');
    await modal.locator('input[type="number"]').fill(String(mitad));
    await modal.locator('select').selectOption('transferencia');
    await modal.locator('input[type="text"]').fill('ref-001');
    await modal.getByRole('button', { name: 'Registrar cobro' }).click();
    await page.waitForTimeout(900);

    await expect(page.getByText('Cobrado parcialmente')).toBeVisible();
    await expect(page.getByText('Emitida', { exact: true })).toBeVisible(); // sin nuevo FacturaEstado

    let cobros = await readStorage<{ importe: number; formaPago: string; referencia: string; usuarioId: string }>(page, 'misport_finance_cobros');
    expect(cobros).toHaveLength(1);
    expect(cobros[0]).toMatchObject({ formaPago: 'transferencia', referencia: 'ref-001', usuarioId: 'u_admin_master' });
    expect(cobros[0].importe).toBeCloseTo(mitad, 2);

    // --- Bloqueo de sobre-cobro ---
    await page.getByRole('button', { name: 'Registrar cobro' }).click();
    modal = page.locator('[role="dialog"]');
    await modal.locator('input[type="number"]').fill(String(facturaTotal)); // ya se cobró la mitad
    await modal.getByRole('button', { name: 'Registrar cobro' }).click();
    await page.waitForTimeout(400);
    await expect(modal).toBeVisible(); // el modal no se cierra, se bloquea con un mensaje
    await expect(modal.locator('p.text-red-400')).toContainText(/pendiente/i);
    await page.keyboard.press('Escape');

    // --- Completar el cobro ---
    await page.getByRole('button', { name: 'Registrar cobro' }).click();
    modal = page.locator('[role="dialog"]');
    await modal.locator('select').selectOption('tarjeta');
    await modal.getByRole('button', { name: 'Registrar cobro' }).click();
    await page.waitForTimeout(900);

    await expect(page.getByText('Cobrada', { exact: true })).toBeVisible();
    cobros = await readStorage(page, 'misport_finance_cobros');
    expect(cobros).toHaveLength(2);

    // --- Desaparece de "Con deuda" y del Dashboard ---
    await page.goto('/#/admin/crm');
    await page.getByRole('button', { name: 'Con deuda' }).click();
    await expect(page.getByText('Cliente Cobros')).toHaveCount(0);
    await page.goto('/#/admin/inicio');
    await expect(page.getByText('Sin cobros pendientes')).toBeVisible();

    // --- Historial de la Ficha muestra ambos cobros ---
    await page.goto('/#/admin/crm/personas/per_cobros');
    await page.getByRole('button', { name: 'Historial' }).click();
    const eventos = await readStorage<{ tipo: string }>(page, 'misport_crm_eventos');
    expect(eventos.filter(e => e.tipo === 'Cobro registrado')).toHaveLength(2);
  });
});
