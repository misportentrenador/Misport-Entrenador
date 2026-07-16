
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
  /**
   * Asistencia (Sprint 23) — informativo, independiente de `status`,
   * `bonoStatus`, cobros y facturación (ninguno de esos sistemas lee ni
   * escribe este campo). Opcional para no exigir una migración de datos:
   * las reservas ya existentes sin este campo se tratan como 'pendiente'
   * (ver `getAsistencia` en shared/lib/reservationLabels.ts) — esa función
   * es la única fuente de verdad sobre el valor por defecto.
   */
  asistencia?: AsistenciaEstado;
}

/**
 * Los cuatro estados de asistencia (Sprint 23) — un literal, no un
 * booleano ni un string libre, para que "Justificada" no se pueda
 * confundir nunca con "No asistió" en ningún filtro o informe futuro.
 * Libremente asignable en cualquier orden (no es una máquina de estados
 * secuencial): se puede pasar de 'pendiente' a 'justificada' directamente.
 */
export type AsistenciaEstado = 'pendiente' | 'asistio' | 'no_asistio' | 'justificada';

/**
 * Canal desde el que se realizó un cambio de asistencia (Sprint 23) — para
 * auditoría y para analizar el uso real del sistema (¿se usa más desde la
 * vista diaria, la semanal o la Ficha del cliente?).
 */
export type AsistenciaCanal = 'agenda_dia' | 'agenda_semana' | 'ficha_cliente';

/**
 * Auditoría de cambios de asistencia (Sprint 23) — un registro por cada
 * cambio (no solo el último estado), para poder reconstruir el historial
 * completo y alimentar futuras estadísticas de asistencia/absentismo sin
 * añadir ni modificar ningún campo del modelo cuando llegue ese Sprint.
 */
export interface AsistenciaLog {
  id: string;
  reservationId: string;
  personaId: string | null;
  estadoAnterior: AsistenciaEstado;
  estadoNuevo: AsistenciaEstado;
  canal: AsistenciaCanal;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: number;
}

/**
 * Auditoría de reprogramaciones (Sprint 21) — un registro estructurado por
 * cada cambio de fecha/hora de una reserva, independiente de que tenga
 * Persona vinculada, para poder consultarlo después (no depende de parsear
 * el texto del historial del CRM, que solo cubre reservas con personaId).
 */
export interface ReservationRescheduleLog {
  id: string;
  reservationId: string;
  fechaAnterior: string;
  horaInicioAnterior: string;
  horaFinAnterior: string;
  fechaNueva: string;
  horaInicioNueva: string;
  horaFinNueva: string;
  usuarioId: string;
  usuarioNombre: string;
  createdAt: number;
}

/**
 * Origen de un BonoManualConsumptionLog — hoy solo existe 'consumo_manual'
 * (Sprint 22); un literal (no un string libre) para que añadir un origen
 * futuro siga siendo un cambio de tipo explícito, no un typo silencioso.
 */
export type BonoManualConsumptionOrigen = 'consumo_manual';

/**
 * Auditoría de consumos manuales de bono (Sprint 22) — regulariza una
 * reserva COMPLETED que quedó con bonoStatus 'pending_regularization' por
 * falta de saldo en el momento de completarla. `motivo` ya existe en el
 * modelo pero es opcional y no se exige todavía: una futura versión puede
 * pasar a exigirlo en la UI sin necesitar ningún cambio de esquema.
 */
export interface BonoManualConsumptionLog {
  id: string;
  reservationId: string;
  bonoClienteId: string;
  personaId: string;
  usuarioId: string;
  usuarioNombre: string;
  origen: BonoManualConsumptionOrigen;
  motivo?: string;
  createdAt: number;
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
 * Ciclo de vida de una Factura (Sprint 20, decisión de negocio aprobada).
 * Este Sprint solo produce facturas directamente en 'emitida' (mismo
 * comportamiento que "Generar factura" del Sprint 19) y las mueve a
 * 'cobrada'; 'borrador' y 'anulada' quedan modeladas para cuando se
 * apruebe un flujo de edición/anulación, sin necesitar cambiar el tipo.
 */
export type FacturaEstado = 'borrador' | 'emitida' | 'cobrada' | 'anulada';

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
  estado: FacturaEstado;
  createdAt: number;
  /** Auditoría (Sprint 24) — quién generó la factura. Opcional: las facturas de los Sprints 19-20 no lo tienen y no se migran. */
  usuarioId?: string;
  usuarioNombre?: string;
}

/**
 * Forma de pago de un cobro (Sprint 20; exigida en la UI desde el Sprint
 * 24). El campo se mantiene opcional en el tipo porque los cobros creados
 * antes del Sprint 24 (el antiguo "Marcar como cobrada") no la tienen.
 */
export type FormaPago = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

/**
 * Cobro aplicado a una Factura (Sprint 20, fase 2 en el Sprint 24). Se
 * modela como registros independientes — en vez de un simple booleano en
 * Factura — para admitir varios cobros por factura (parciales o
 * completos), cada uno con su propio método de pago.
 *
 * INMUTABLE (Sprint 24, decisión de negocio): una vez creado, un
 * CobroFactura no se edita ni se borra — no existe ninguna función
 * updateCobro/deleteCobro. Un error se corrige en el futuro con una
 * operación de corrección/reversión explícita (p. ej. un cobro negativo
 * o un estado 'anulado' propio), nunca modificando el registro original.
 *
 * `id` es el identificador único y permanente (Sprint 24, requisito de
 * negocio) al que se enlazará en el futuro cualquier medio de cobro
 * externo (conciliación bancaria, TPV, Bizum, Stripe, transferencia...)
 * — el campo `referencia` ya permite anotar hoy, en texto libre, el dato
 * de ese medio externo; un campo dedicado (p. ej. `stripePaymentId`) se
 * añadiría más adelante sin romper los cobros ya existentes.
 */
export interface CobroFactura {
  id: string;
  facturaId: string;
  fecha: string; // ISO datetime — fecha y hora del cobro
  importe: number;
  formaPago?: FormaPago;
  /** Nota/referencia libre del medio de pago (p. ej. nº de operación bancaria). */
  referencia?: string;
  /** Auditoría (Sprint 24) — quién registró el cobro. Opcional: los cobros del Sprint 20 no lo tienen. */
  usuarioId?: string;
  usuarioNombre?: string;
  createdAt: number;
}
