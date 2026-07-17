import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';
import { getLinkedPersonaId, seedReservations, reloadApp, readStorage } from '../helpers/seed';

/** Sprint 18 — Nueva reserva desde la Agenda (reutiliza el Booking Wizard con onBehalfOfPersonaId). */
test.describe('Agenda — Nueva reserva', () => {
  test('reserva una segunda sesión para el mismo cliente sin fuga de identidad', async ({ page }) => {
    await registerClient(page, { name: 'Cliente NuevaReserva', email: 'nuevareserva@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'nuevareserva@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_nr_base', userId: 'x', userName: 'Cliente NuevaReserva', userEmail: 'nuevareserva@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_ruben', personaId, date: today, startTime: '09:00', endTime: '09:30', status: 'CONFIRMED' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Nueva reserva' }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toContainText('Selecciona tu Centro');

    await modal.locator('.cursor-pointer').first().click();
    await expect(modal).toContainText('Elige tu Entrenamiento');
    await modal.locator('.cursor-pointer').first().click();

    // Según el servicio, el siguiente paso es "Selecciona Entrenador" o directamente "Fecha y Hora".
    await expect(modal.getByText(/Selecciona Entrenador|Fecha y Hora/)).toBeVisible();
    if (await modal.getByText('Selecciona Entrenador').isVisible()) {
      await modal.locator('.cursor-pointer').first().click();
      await expect(modal).toContainText('Fecha y Hora');
    }
    await modal.locator('button:has-text(":"):not([disabled])').first().click();
    await modal.getByRole('button', { name: 'Siguiente' }).click();

    await expect(modal).toContainText('Resumen de Reserva');
    await modal.getByRole('button', { name: 'CONFIRMAR RESERVA' }).click();
    await page.waitForTimeout(1200);

    const reservations = await readStorage<{ id: string; personaId: string | null; userId: string }>(page, 'misport_reservations');
    const forPersona = reservations.filter(r => r.personaId === personaId);
    expect(forPersona).toHaveLength(2); // la base + la nueva
    const nueva = forPersona.find(r => r.id !== 'r_nr_base');
    expect(nueva).toBeTruthy();

    const users = await readStorage<{ id: string; email: string }>(page, 'misport_db_users');
    const client = users.find(u => u.email === 'nuevareserva@test.es');
    expect(nueva?.userId).toBe(client?.id); // atribuida al cliente, no al admin
  });
});
