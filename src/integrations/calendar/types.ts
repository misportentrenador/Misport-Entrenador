/**
 * Capa de integración de calendarios externos (Sprint 18) — contrato
 * único que debe cumplir cualquier origen (Google Calendar, Outlook,
 * Apple Calendar, Booksy...). La Agenda de MISPORT OS solo conoce este
 * contrato, nunca un proveedor concreto; añadir un origen nuevo es
 * implementar esta misma interfaz, sin tocar el núcleo de la Agenda.
 *
 * FASE ACTUAL: SOLO LECTURA. No existe (ni debe añadirse sin una nueva
 * decisión de negocio) ningún método de escritura — nunca se crea, edita
 * ni elimina un evento externo desde MISPORT OS.
 */
export type CalendarSourceId = 'google_calendar' | 'outlook' | 'apple_calendar' | 'booksy';

export interface ExternalCalendarEvent {
  id: string;
  source: CalendarSourceId;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  /** Enlace para abrir el evento en su calendario original, si el origen lo ofrece. */
  sourceUrl?: string;
}

export interface CalendarDateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface CalendarSourceAdapter {
  readonly source: CalendarSourceId;
  readonly label: string;
  /** true si existen las credenciales necesarias (variables de entorno) para poder conectar. */
  isConfigured(): boolean;
  /** true si ya se completó la autorización con este origen. */
  isConnected(): boolean;
  /** Inicia el flujo de autorización del origen externo. */
  connect(): Promise<void>;
  /** Revoca la conexión local (no revoca el acceso concedido en el proveedor externo). */
  disconnect(): void;
  /** Trae los eventos de este origen dentro del rango de fechas dado. Nunca modifica nada. */
  fetchEvents(range: CalendarDateRange): Promise<ExternalCalendarEvent[]>;
}
