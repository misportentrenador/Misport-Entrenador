import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';

/**
 * Regresión del Booking Wizard (Sprint 5, con `computeTimeSlots` extraído
 * en el Sprint 21 a `shared/lib/scheduling.ts` y compartido con
 * ReprogramarModal) — el propio flujo de autorreserva del cliente no debe
 * cambiar de comportamiento.
 */
test.describe('Reservas — Booking Wizard', () => {
  test('completa el flujo de autorreserva de un cliente de principio a fin', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Wizard', email: 'wizard@test.es' });
    // registerClient ya deja al cliente logueado hasta borrar la sesión; aquí queremos permanecer como ese cliente.
    await page.goto('/#/login');
    await page.fill('input[type="email"]', 'wizard@test.es');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/#/**', { timeout: 5000 });

    await page.goto('/#/book');
    await expect(page.getByText('Selecciona tu Centro')).toBeVisible();

    await page.locator('.cursor-pointer').first().click();
    await expect(page.getByText('Elige tu Entrenamiento')).toBeVisible();
    await page.locator('.cursor-pointer').first().click();

    // Según el servicio, el siguiente paso es "Selecciona Entrenador" o directamente "Fecha y Hora".
    await expect(page.getByText(/Selecciona Entrenador|Fecha y Hora/)).toBeVisible();
    if (await page.getByText('Selecciona Entrenador').isVisible()) {
      await page.locator('.cursor-pointer').first().click();
      await expect(page.getByText('Fecha y Hora')).toBeVisible();
    }
    const slotCount = await page.locator('button:has-text(":")').count();
    expect(slotCount).toBeGreaterThan(0);

    await page.locator('button:has-text(":"):not([disabled])').first().click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    await expect(page.getByText('Resumen de Reserva')).toBeVisible();
    await page.getByRole('button', { name: 'CONFIRMAR RESERVA' }).click();
    await expect(page.getByText('Reserva Confirmada')).toBeVisible({ timeout: 3000 });
  });
});
