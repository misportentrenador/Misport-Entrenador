import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';
import { getLinkedPersonaId, seedReservations, reloadApp, readStorage } from '../helpers/seed';

/**
 * Sprint 21 — Reprogramar reserva. Usa trn_ruben (Electroestimulación,
 * Lunes-Viernes 09:00-14:00, ver SCHEDULE_RULES) en vez de trn_misael,
 * cuya disponibilidad depende del día de la semana concreto — así el test
 * no depende de en qué día se ejecuta.
 */
test.describe('Agenda — Reprogramar reserva', () => {
  test('valida disponibilidad, conserva el id y audita usuario/horario anterior/nuevo', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Reprogramar', email: 'reprogramar@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'reprogramar@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_repro_base', userId: 'x', userName: 'Cliente Reprogramar', userEmail: 'reprogramar@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_ruben', personaId, date: today, startTime: '09:00', endTime: '09:30', status: 'CONFIRMED' },
      { id: 'r_repro_blocker', userId: 'y', userName: 'Blocker', userEmail: 'blocker@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_ruben', personaId: null, date: today, startTime: '10:00', endTime: '10:30', status: 'CONFIRMED' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    // El bloqueador también es CONFIRMED (reprogramar no exige personaId) — se distinguen por tarjeta.
    const card = page.locator('div.rounded-lg', { hasText: 'Cliente Reprogramar' });
    await expect(card.getByRole('button', { name: 'Reprogramar' })).toBeVisible();
    await card.getByRole('button', { name: 'Reprogramar' }).click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toContainText('09:00 - 09:30');

    // El horario ocupado (10:00) debe estar deshabilitado y mostrar el motivo.
    const fullSlot = modal.getByRole('button', { name: '10:00', exact: false });
    await expect(fullSlot).toBeDisabled();
    await expect(fullSlot).toContainText('COMPLETO');

    // Reprogramar a un horario libre.
    await modal.getByRole('button', { name: '11:00', exact: false }).click();
    await modal.getByRole('button', { name: 'Confirmar reprogramación' }).click();
    await page.waitForTimeout(1200);

    const reservations = await readStorage<{ id: string; startTime: string; endTime: string; date: string }>(page, 'misport_reservations');
    const base = reservations.find(r => r.id === 'r_repro_base');
    expect(base?.startTime).toBe('11:00');
    expect(base?.endTime).toBe('11:30');
    expect(reservations).toHaveLength(2); // ninguna reserva nueva creada

    const logs = await readStorage<{ reservationId: string; horaInicioAnterior: string; horaInicioNueva: string; usuarioId: string; usuarioNombre: string }>(page, 'misport_reservation_reschedules');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      reservationId: 'r_repro_base',
      horaInicioAnterior: '09:00',
      horaInicioNueva: '11:00',
      usuarioId: 'u_admin_master',
      usuarioNombre: 'Admin MISPORT',
    });

    const eventos = await readStorage<{ personaId: string; tipo: string }>(page, 'misport_crm_eventos');
    expect(eventos.some(e => e.personaId === personaId && e.tipo === 'Reprogramación')).toBe(true);
  });

  test('disponible también desde la vista Semana y desde la Ficha del cliente', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Reprogramar2', email: 'reprogramar2@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'reprogramar2@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_repro2_base', userId: 'x', userName: 'Cliente Reprogramar2', userEmail: 'reprogramar2@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_ruben', personaId, date: today, startTime: '09:00', endTime: '09:30', status: 'CONFIRMED' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Semana' }).click();
    await expect(page.getByRole('button', { name: 'Reprogramar' })).toBeVisible();

    await page.goto(`/#/admin/crm/personas/${personaId}`);
    await page.getByRole('button', { name: 'Historial' }).click();
    await expect(page.getByRole('button', { name: 'Reprogramar' })).toBeVisible();
  });
});
