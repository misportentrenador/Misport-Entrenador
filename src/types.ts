
export type UserRole = 'ADMIN' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  description: string;
  isActive: boolean;
  image: string;
}

export interface TrainingType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  capacity: number;
  requiresTrainer: boolean;
  price: number;
}

export interface Trainer {
  id: string;
  name: string;
  centerIds: string[]; // Centers where they work
  specialties: string[]; // Training Type IDs they can teach
  isActive: boolean;
  avatar: string;
}

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  userId: string;
  userName: string; // Added for easier Admin display
  userEmail: string; // Added for easier Admin display
  centerId: string;
  serviceId: string;
  personaId: string | null; // Linked Master Data Persona, if the account has one (Sprint 5)
  trainerId?: string; // Optional if training doesn't require specific trainer
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ReservationStatus;
  createdAt: number;
  /**
   * Resultado del consumo automático de bonos al completar la sesión
   * (Sprint 11) — independiente del registro económico (FinanceEntry),
   * que se genera siempre. 'consumed': se descontó un bono compatible.
   * 'pending_regularization': no había saldo suficiente, el entrenador
   * fue avisado antes de completar la sesión. Ausente si el concepto no
   * aplica (p. ej. personaId null).
   */
  bonoStatus?: 'consumed' | 'pending_regularization';
}

// Configuration for complex schedules
export interface ScheduleRule {
  centerId: string;
  serviceId: string;
  trainerId?: string; // If undefined/null, applies to the service in general (e.g. Group classes)
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  ranges: { start: string; end: string }[]; // HH:mm format
}

// Flow state for the booking wizard
export interface BookingState {
  step: number;
  centerId: string | null;
  serviceId: string | null;
  trainerId: string | null;
  selectedDate: string; // YYYY-MM-DD
  selectedTime: string | null; // HH:mm
}

// --- FINANCE MODULE (Panel de control económico) ---

export type FinanceServiceName = 'Electroestimulación' | 'Entrenamiento personal' | 'Entrenamiento online' | 'Entrenamiento grupal';

export interface ServiceRate {
  price: number;
  trainerPay: number;
  centerPay: number;
}

export interface GroupRate extends ServiceRate {
  days: 1 | 2 | 3;
}

// Ajustes fiscales de Finanzas. Las tarifas por servicio (precio, pago
// entrenador, pago centro) viven en el Catálogo Maestro (Rate) desde el
// Sprint 6 — Finanzas ya no guarda su propia copia para no duplicar datos.
export interface FinanceParams {
  igic: number; // e.g. 0.07
  profitTax: number; // e.g. 0.2
}

// A logged block of sessions, equivalent to one row in the "Registro" sheet
export interface FinanceEntry {
  id: string;
  date: string; // YYYY-MM-DD
  trainerName: string;
  centerName: string;
  service: FinanceServiceName;
  groupDays?: 1 | 2 | 3; // only for 'Entrenamiento grupal'
  quantity: number;
  manualPrice?: number;
  manualTrainerPay?: number;
  manualCenterPay?: number;
  notes?: string;
  createdAt: number;
  /** Reserva de origen si esta entrada se generó automáticamente al completar una sesión (Sprint 7). */
  sourceReservationId?: string;
  /** Persona (Master Data) a quien se factura, cuando existe esa relación (CRM, Sprint 10, decisión 3). */
  personaId?: string;
}

// Computed totals for a single FinanceEntry
export interface FinanceEntryTotals {
  unitPrice: number;
  unitTrainerPay: number;
  unitCenterPay: number;
  billingBase: number;
  trainerTotal: number;
  centerTotal: number;
  margin: number;
  igicAmount: number;
  profitTaxAmount: number;
  netProfit: number;
  totalCharged: number;
}

/**
 * Datos fiscales de MISPORT como emisor de sus propias facturas (Sprint 19).
 * Se rellenan una vez desde Finanzas; sin ellos, "Generar factura" queda
 * bloqueado — son un dato real obligatorio en cualquier factura, no un
 * valor por defecto inventado.
 */
export interface DatosFiscalesEmpresa {
  razonSocial: string;
  nif: string;
  direccion: string;
}

/**
 * Factura (Sprint 19, fase 1) — emitida a partir de una única FinanceEntry
 * ya registrada. Numeración correlativa única (serie AAAA-NNNN, se reinicia
 * cada año natural), decisión de negocio aprobada. Generada y descargada
 * en PDF desde el propio navegador, sin backend ni servicio externo.
 */
export interface Factura {
  id: string;
  numero: string; // "2026-0001"
  anio: number;
  fecha: string; // YYYY-MM-DD, fecha de emisión
  personaId: string;
  financeEntryId: string;
  baseImponible: number;
  igicAmount: number;
  total: number;
  createdAt: number;
}
