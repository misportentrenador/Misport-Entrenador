import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';
import { getLinkedPersonaId, seedReservations, reloadApp } from '../helpers/seed';

/**
 * Regresión del registro `sessionActions` completo (Sprints 15-23): una
 * reserva CONFIRMED con Persona vinculada debe ofrecer las 8 acciones que
 * le corresponden (todas menos "Consumir bono", que exige COMPLETED +
 * bonoStatus pending_regularization). Cualquier acción rápida futura se
 * añade aquí para que esta regresión la cubra desde el primer commit.
 */
test.describe('Agenda — registro de acciones rápidas (regresión)', () => {
  test('una reserva CONFIRMED con Persona ofrece las 8 acciones esperadas', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Acciones', email: 'acciones@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'acciones@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_acciones', userId: 'x', userName: 'Cliente Acciones', userEmail: 'acciones@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_misael', personaId, date: today, startTime: '08:00', endTime: '08:30', status: 'CONFIRMED' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    for (const label of ['Marcar completada', 'Cancelar', 'Ver ficha', 'Registrar pago', 'Añadir nota', 'Crear incidencia', 'Nueva reserva', 'Reprogramar', 'Confirmar asistencia']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }
    // "Consumir bono" NO debe aparecer para una reserva CONFIRMED (solo para COMPLETED + pending_regularization).
    await expect(page.getByRole('button', { name: 'Consumir bono' })).toHaveCount(0);
  });
});
