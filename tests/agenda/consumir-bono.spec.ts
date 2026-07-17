import { test, expect } from '@playwright/test';
import { loginAsAdmin, registerClient } from '../helpers/auth';
import { getLinkedPersonaId, seedReservations, seedCatalogBono, seedBonoCliente, reloadApp, readStorage } from '../helpers/seed';

/** Sprint 22 — Consumir bono manual (regulariza una reserva COMPLETED con bonoStatus 'pending_regularization'). */
test.describe('Agenda — Consumir bono manual', () => {
  test('solo ofrece bonos compatibles con el servicio y descuenta correctamente', async ({ page }) => {
    await registerClient(page, { name: 'Cliente ConsumirBono', email: 'consumirbono@test.es' });
    await loginAsAdmin(page);
    const personaId = await getLinkedPersonaId(page, 'consumirbono@test.es');
    const today = new Date().toISOString().split('T')[0];

    await seedReservations(page, [
      { id: 'r_cb_pendiente', userId: 'x', userName: 'Cliente ConsumirBono', userEmail: 'consumirbono@test.es', centerId: 'ctr_cowork', serviceId: 'svc_electro', trainerId: 'trn_misael', personaId, date: today, startTime: '08:00', endTime: '08:30', status: 'COMPLETED', bonoStatus: 'pending_regularization' },
    ]);
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Consumir bono' }).click();
    let modal = page.locator('[role="dialog"]');
    await expect(modal).toContainText('no tiene ningún bono compatible');
    await page.keyboard.press('Escape');

    await seedCatalogBono(page, { id: 'bono_test', name: '5 sesiones Electro', serviceId: 'svc_electro', sessionsIncluded: 5, price: 150 });
    await seedBonoCliente(page, { id: 'bc_test', personaId, bonoId: 'bono_test', sessionsRemaining: 3 });
    await reloadApp(page);

    await page.goto('/#/admin/agenda');
    await page.getByRole('button', { name: 'Consumir bono' }).click();
    modal = page.locator('[role="dialog"]');
    await expect(modal).toContainText('3 sesiones restantes');
    await modal.getByRole('button', { name: /5 sesiones Electro/ }).click();
    await modal.getByRole('button', { name: 'Consumir bono' }).click();
    await page.waitForTimeout(900);

    const reservations = await readStorage<{ id: string; bonoStatus?: string }>(page, 'misport_reservations');
    expect(reservations.find(r => r.id === 'r_cb_pendiente')?.bonoStatus).toBe('consumed');

    const bonos = await readStorage<{ id: string; sessionsRemaining: number }>(page, 'misport_crm_bonos_cliente');
    expect(bonos.find(b => b.id === 'bc_test')?.sessionsRemaining).toBe(2);

    const consumos = await readStorage<{ reservationId: string; bonoClienteId: string; origen: string; usuarioId: string }>(page, 'misport_bono_manual_consumptions');
    expect(consumos).toHaveLength(1);
    expect(consumos[0]).toMatchObject({ reservationId: 'r_cb_pendiente', bonoClienteId: 'bc_test', origen: 'consumo_manual', usuarioId: 'u_admin_master' });

    // No debe generar ningún FinanceEntry adicional (el registro económico ya se creó al completar).
    const entries = await readStorage(page, 'misport_finance_entries');
    expect(entries.filter((e: any) => e.sourceReservationId === 'r_cb_pendiente')).toHaveLength(0);

    const eventos = await readStorage<{ personaId: string; tipo: string }>(page, 'misport_crm_eventos');
    expect(eventos.some(e => e.personaId === personaId && e.tipo === 'Bono consumido manualmente')).toBe(true);
  });
});
