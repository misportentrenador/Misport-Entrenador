import { Center, Trainer, Service, Rate, Bono } from '../types';

/**
 * Seed data for the Catálogo Maestro, reconciled from today's two
 * disconnected sources:
 *  - Bookings' TrainingType list (src/constants.ts: MOCK_TRAINING_TYPES)
 *  - Finance's service/rate list (src/constants.ts: DEFAULT_FINANCE_PARAMS)
 *
 * This is a DRAFT reconciliation, not a business decision: the two lists
 * don't fully agree (Finance has no rate for "Entrenamiento personal";
 * Bookings has no "Entrenamiento online"). Cowork needs to confirm the
 * definitive service catalog — see Sprint 2 design notes.
 *
 * A fixed baseline date is used for createdAt/updatedAt/effectiveFrom
 * instead of "now", so re-running the seed doesn't produce a different
 * timestamp every time the app starts fresh in a new browser.
 */
const BASELINE = '2026-01-01T00:00:00.000Z';

export const CENTER_SEED: Center[] = [
  { id: 'ctr_cowork', name: 'COWORKGYM', address: 'Calle Luis Doreste Silva, 107', description: 'Espacio multifuncional con tecnología avanzada.', isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'ctr_bodyplay', name: 'BODYPLAY', address: 'Arucas', description: 'Centro funcional amplio para tu mejor versión.', isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'ctr_cda', name: 'CDA', address: 'Arucas', description: 'Sala moderna con equipamiento premium.', isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'ctr_nucleo', name: 'NÚCLEO', address: 'Av. Alcalde José Ramirez Bethencourt, 13', description: 'Especialistas en electroestimulación.', isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'ctr_matula', name: 'CENTRO MISPORT', address: 'La Matula 3B', description: 'Gimnasio boutique elegante.', isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
];

export const SERVICE_SEED: Service[] = [
  { id: 'svc_electro', name: 'Electroestimulación', description: 'Tecnología EMS para máxima eficiencia en sesiones cortas.', durationMinutes: 30, capacity: 1, requiresTrainer: true, isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'svc_personal', name: 'Entrenamiento personal', description: 'Atención 100% personalizada para tus objetivos.', durationMinutes: 60, capacity: 1, requiresTrainer: true, isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'svc_grupal', name: 'Entrenamiento grupal', description: 'Sesiones dinámicas en grupo.', durationMinutes: 60, capacity: 10, requiresTrainer: false, isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'svc_online', name: 'Entrenamiento online', description: 'Sesiones a distancia, sin centro asociado.', durationMinutes: 45, capacity: 1, requiresTrainer: true, isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
];

export const TRAINER_SEED: Trainer[] = [
  { id: 'trn_misael', name: 'Misael', centerIds: ['ctr_cowork', 'ctr_nucleo'], serviceIds: ['svc_electro'], isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'trn_ruben', name: 'Rubén', centerIds: ['ctr_cowork', 'ctr_matula'], serviceIds: ['svc_electro', 'svc_personal', 'svc_grupal'], isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'trn_hugo', name: 'Hugo', centerIds: ['ctr_cowork', 'ctr_bodyplay', 'ctr_cda', 'ctr_matula'], serviceIds: ['svc_electro', 'svc_personal', 'svc_grupal'], isActive: true, createdAt: BASELINE, updatedAt: BASELINE },
];

export const RATE_SEED: Rate[] = [
  { id: 'rate_electro', serviceId: 'svc_electro', variant: null, price: 30, trainerPay: 8, centerPay: 8, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
  // Finance never priced "Entrenamiento personal" — gap carried over honestly instead of inventing a number.
  { id: 'rate_personal', serviceId: 'svc_personal', variant: null, price: 40, trainerPay: 0, centerPay: 0, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'rate_grupal_1', serviceId: 'svc_grupal', variant: '1 día/semana', price: 40, trainerPay: 16, centerPay: 0, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'rate_grupal_2', serviceId: 'svc_grupal', variant: '2 días/semana', price: 50, trainerPay: 20, centerPay: 0, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'rate_grupal_3', serviceId: 'svc_grupal', variant: '3 días/semana', price: 60, trainerPay: 24, centerPay: 0, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
  { id: 'rate_online', serviceId: 'svc_online', variant: null, price: 50, trainerPay: 30, centerPay: 0, effectiveFrom: BASELINE, createdAt: BASELINE, updatedAt: BASELINE },
];

// No existing data to reconcile — left empty for the admin to fill in.
export const BONO_SEED: Bono[] = [];
