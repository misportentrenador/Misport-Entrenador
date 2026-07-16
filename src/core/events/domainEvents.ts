import { AsistenciaEstado, AsistenciaCanal, FormaPago } from '../../types';

/**
 * Bus de eventos internos de dominio (Sprint 21) — mecanismo mínimo para
 * que una acción de negocio (reprogramar una reserva, consumir un bono
 * manualmente, confirmar asistencia, registrar un cobro, y las que vengan
 * después) emita un hecho consumible por quien lo necesite, sin acoplar
 * quién lo emite a quién lo escucha.
 *
 * Hoy ya tiene listeners reales: CRMContext y FinanceContext se suscriben
 * para alimentar el Historial de la Ficha (necesario porque AppProvider y
 * FinanceProvider están por encima de CRMProvider en el árbol y no pueden
 * llamar a useCRM() directamente). Está pensado también para: (a) las
 * futuras integraciones con Google Calendar, Booksy u otros proveedores
 * (Sprint 18) — el adaptador correspondiente se suscribe aquí y empuja el
 * cambio al proveedor externo; (b) futuros módulos de Tesorería, KPIs,
 * Contabilidad, un ERP externo, recordatorios automáticos, informes,
 * automatizaciones e IA (Sprints 23-24) — todos sin tocar la lógica de
 * negocio que emite el evento.
 */
export interface ReservationRescheduledEvent {
  type: 'ReservationRescheduled';
  reservationId: string;
  personaId: string | null;
  centerId: string;
  serviceId: string;
  trainerId?: string;
  previous: { date: string; startTime: string; endTime: string };
  next: { date: string; startTime: string; endTime: string };
  changedBy: { userId: string; userName: string };
  occurredAt: string; // ISO datetime
}

/**
 * Regularización manual de una reserva COMPLETED que quedó con
 * bonoStatus 'pending_regularization' (Sprint 22) — consume un BonoCliente
 * concreto (ya elegido y validado por quien emite) y deja constancia del
 * cambio para el Historial de la Ficha.
 */
export interface BonoConsumedManuallyEvent {
  type: 'BonoConsumedManually';
  reservationId: string;
  personaId: string;
  bonoClienteId: string;
  changedBy: { userId: string; userName: string };
  occurredAt: string; // ISO datetime
}

/**
 * Cambio de asistencia de una reserva (Sprint 23) — se emite en cada
 * cambio, no solo al marcar "No asistió", para que un futuro suscriptor
 * (KPIs, recordatorios, informes, automatizaciones, IA) tenga el historial
 * completo de transiciones sin tener que reconstruirlo de otra forma.
 * `canal` identifica desde dónde se hizo el cambio (útil para analizar el
 * uso real del sistema, no solo para auditoría).
 */
export interface AttendanceUpdatedEvent {
  type: 'AttendanceUpdated';
  reservationId: string;
  personaId: string | null;
  centerId: string;
  serviceId: string;
  previous: AsistenciaEstado;
  next: AsistenciaEstado;
  canal: AsistenciaCanal;
  changedBy: { userId: string; userName: string };
  occurredAt: string; // ISO datetime
}

/**
 * Cobro registrado sobre una Factura (Sprint 24) — parcial o completo.
 * Lleva `cobroId`, el identificador único y permanente del CobroFactura
 * (inmutable, nunca se edita ni se borra), para que cualquier futuro
 * suscriptor pueda referenciar exactamente ese cobro sin tener que volver
 * a consultarlo. Diseñado desde el principio para que, sin modificar
 * `registrarCobro`, puedan suscribirse en el futuro módulos de Tesorería
 * (conciliación bancaria, remesas), KPIs, Contabilidad, un ERP externo,
 * Automatizaciones o IA.
 */
export interface CobroRegisteredEvent {
  type: 'CobroRegistered';
  cobroId: string;
  facturaId: string;
  personaId: string;
  importe: number;
  formaPago?: FormaPago;
  referencia?: string;
  pendienteRestante: number;
  changedBy: { userId: string; userName: string };
  occurredAt: string; // ISO datetime
}

// Únelo aquí cuando se añadan más tipos de evento de dominio.
export type DomainEvent = ReservationRescheduledEvent | BonoConsumedManuallyEvent | AttendanceUpdatedEvent | CobroRegisteredEvent;

type DomainEventListener<E extends DomainEvent = DomainEvent> = (event: E) => void;

class DomainEventBus {
  private listeners: DomainEventListener[] = [];

  emit(event: DomainEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  /** Devuelve una función para darse de baja. */
  subscribe(listener: DomainEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const domainEventBus = new DomainEventBus();
