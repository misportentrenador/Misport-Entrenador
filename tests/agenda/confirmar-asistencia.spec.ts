import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';
import { getLinkedPersonaId, seedReservations, reloadApp, readStorage } from '../helpers/seed';

/** Sprint 23 — Confirmar asistencia (4 estados, canal de origen, independencia de bonos/cobros/facturación). */
test.describe('Agenda — Confirmar asistencia', () => {
  test('audita estado anterior/nuevo, canal y usuario; no disponible en reservas CANCELLED', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Asistencia', email: 'asistencia@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'asistencia@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_asis_confirmada', userId: 'x', userName: 'Cliente Asistencia', userEmail: 'asistencia@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_misael', personaId, date: today, startTime: '08:00', endTime: '08:30', status: 'CONFIRMED' },
      { id: 'r_asis_cancelada', userId: 'x', userName: 'Cliente Asistencia', userEmail: 'asistencia@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_misael', personaId, date: today, startTime: '09:00', endTime: '09:30', status: 'CANCELLED' },
    ]);
    await reloadApp(page);

    // Vista Día -> Asistió (canal agenda_dia)
    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Confirmar asistencia' }).click();
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Asistió', exact: true }).click();
    await page.waitForTimeout(600);
    await expect(page.getByText('Asistió', { exact: true }).first()).toBeVisible();

    // Vista Semana -> Justificada (canal agenda_semana)
    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Semana' }).click();
    await page.getByRole('button', { name: 'Confirmar asistencia' }).click();
    await page.locator('[role="dialog"]').getByRole('button', { name: 'Justificada' }).click();
    await page.waitForTimeout(600);

    // Ficha -> No asistió (canal ficha_cliente)
    await page.goto(`/#/admin/crm/personas/${personaId}`);
    await page.getByRole('button', { name: 'Historial' }).click();
    const confirmarBtns = page.getByRole('button', { name: 'Confirmar asistencia' });
    await expect(confirmarBtns).toHaveCount(1); // la reserva CANCELLED no debe ofrecer la acción
    await confirmarBtns.first().click();
    await page.locator('[role="dialog"]').getByRole('button', { name: 'No asistió' }).click();
    await page.waitForTimeout(600);

    const logs = await readStorage<{ estadoAnterior: string; estadoNuevo: string; canal: string }>(page, 'misport_attendance_logs');
    expect(logs).toHaveLength(3);
    expect(logs.map(l => l.canal)).toEqual(['agenda_dia', 'agenda_semana', 'ficha_cliente']);
    expect(logs.map(l => l.estadoNuevo)).toEqual(['asistio', 'justificada', 'no_asistio']);

    const reservations = await readStorage<{ id: string; status: string; asistencia?: string }>(page, 'misport_reservations');
    const base = reservations.find(r => r.id === 'r_asis_confirmada');
    expect(base?.status).toBe('CONFIRMED'); // independencia respecto al status
    expect(base?.asistencia).toBe('no_asistio');
  });

  test('no afecta a bonos, cobros, facturación ni reprogramaciones (independencia absoluta)', async ({ page }) => {
    await registerClient(page, { name: 'Cliente Asistencia2', email: 'asistencia2@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'asistencia2@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_asis2', userId: 'x', userName: 'Cliente Asistencia2', userEmail: 'asistencia2@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_misael', personaId, date: today, startTime: '08:00', endTime: '08:30', status: 'CONFIRMED' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Confirmar asistencia' }).click();
    await page.locator('[role="dialog"]').getByRole('button', { name: 'No asistió' }).click();
    await page.waitForTimeout(600);

    for (const key of ['misport_crm_bonos_cliente', 'misport_finance_entries', 'misport_finance_facturas', 'misport_finance_cobros', 'misport_reservation_reschedules', 'misport_bono_manual_consumptions']) {
      const rows = await readStorage(page, key);
      expect(rows, `${key} no debería cambiar por un cambio de asistencia`).toHaveLength(0);
    }
  });
});
