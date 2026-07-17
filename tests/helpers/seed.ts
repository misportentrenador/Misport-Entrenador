import { Page } from '@playwright/test';

/** Recarga la app para que los Providers relean localStorage tras sembrar datos directamente. */
export async function reloadApp(page: Page) {
  await page.reload();
  await page.waitForTimeout(700);
}

/** Persona (Master Data) que `register()` crea automáticamente para un email de cliente ya registrado. */
export async function getLinkedPersonaId(page: Page, email: string): Promise<string> {
  return page.evaluate(async (email) => {
    const users = JSON.parse(localStorage.getItem('misport_db_users') || '[]');
    const client = users.find((u: { email: string }) => u.email === email);
    // @ts-expect-error — resuelto por Vite en el navegador (page.evaluate), no por nuestro tsc de Node.
    const masterdataMod = await import('/src/modules/masterdata/data/repositories.ts');
    const personas = await masterdataMod.personasRepo.list();
    const linked = personas.find((p: { userId: string | null }) => p.userId === client.id);
    return linked.id;
  }, email);
}

/** Crea una Persona directamente (sin pasar por un registro de cliente) — para escenarios que no necesitan una cuenta CLIENT real. */
export async function seedPersona(page: Page, data: { id: string; name: string; email: string; docId?: string }) {
  await page.evaluate(async (data) => {
    // @ts-expect-error — resuelto por Vite en el navegador (page.evaluate), no por nuestro tsc de Node.
    const masterdataMod = await import('/src/modules/masterdata/data/repositories.ts');
    await masterdataMod.personasRepo.create({
      id: data.id, userId: null, name: data.name, email: data.email, phone: '',
      docId: data.docId ?? '', notes: '', isActive: true, createdAt: new Date().toISOString(),
    });
  }, data);
}

export interface SeedReservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  centerId: string;
  serviceId: string;
  trainerId?: string;
  personaId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  bonoStatus?: 'consumed' | 'pending_regularization';
}

/** Sustituye por completo `misport_reservations` — usar con la lista completa que necesite el test. */
export async function seedReservations(page: Page, reservations: SeedReservation[]) {
  await page.evaluate((reservations) => {
    const withDefaults = reservations.map(r => ({ ...r, createdAt: Date.now() }));
    localStorage.setItem('misport_reservations', JSON.stringify(withDefaults));
  }, reservations);
}

export async function seedFiscalConfig(page: Page, data: { razonSocial: string; nif: string; direccion: string }) {
  await page.evaluate((data) => {
    localStorage.setItem('misport_fiscal_config', JSON.stringify(data));
  }, data);
}

export interface SeedFinanceEntry {
  id: string;
  date: string;
  trainerName: string;
  centerName: string;
  service: string;
  personaId?: string;
  quantity?: number;
}

export async function seedFinanceEntry(page: Page, entry: SeedFinanceEntry) {
  await page.evaluate((entry) => {
    const entries = JSON.parse(localStorage.getItem('misport_finance_entries') || '[]');
    entries.push({ quantity: 1, ...entry, createdAt: Date.now() });
    localStorage.setItem('misport_finance_entries', JSON.stringify(entries));
  }, entry);
}

export async function seedBonoCliente(page: Page, data: { id: string; personaId: string; bonoId: string; sessionsRemaining: number; expiryDate?: string | null }) {
  await page.evaluate((data) => {
    const now = new Date().toISOString();
    const bonos = JSON.parse(localStorage.getItem('misport_crm_bonos_cliente') || '[]');
    bonos.push({
      id: data.id, personaId: data.personaId, bonoId: data.bonoId,
      sessionsRemaining: data.sessionsRemaining, purchaseDate: now.slice(0, 10),
      expiryDate: data.expiryDate ?? null, status: 'active', createdAt: now, updatedAt: now,
    });
    localStorage.setItem('misport_crm_bonos_cliente', JSON.stringify(bonos));
  }, data);
}

export async function seedCatalogBono(page: Page, data: { id: string; name: string; serviceId: string; sessionsIncluded: number; price: number }) {
  await page.evaluate((data) => {
    const now = new Date().toISOString();
    const bonos = JSON.parse(localStorage.getItem('misport_catalog_bonos') || '[]');
    bonos.push({ ...data, validityDays: 90, isActive: true, createdAt: now, updatedAt: now });
    localStorage.setItem('misport_catalog_bonos', JSON.stringify(bonos));
  }, data);
}

/** Lee cualquier colección persistida en localStorage, ya parseada. */
export async function readStorage<T = unknown>(page: Page, key: string): Promise<T[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), key);
}
