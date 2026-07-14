import { Reservation } from '../../../types';

/**
 * Modelo de vista de la Agenda (Sprint 15) — ningún componente de la
 * Agenda lee `Reservation` directamente. Hoy el único origen es
 * `origin: 'misport'`; cuando exista una integración con Google Calendar o
 * Booksy, un adaptador propio producirá más `AgendaSession[]` con su
 * `origin` correspondiente y se fusionarán en la misma lista — la interfaz
 * (DayView, WeekView, SessionCard) no cambia.
 */
export type AgendaSessionOrigin = 'misport' | 'google_calendar' | 'booksy';

export interface AgendaSession {
  id: string;
  origin: AgendaSessionOrigin;
  reservation: Reservation;
  date: string;
  startTime: string;
  endTime: string;
}

export function reservationToAgendaSession(r: Reservation): AgendaSession {
  return {
    id: r.id,
    origin: 'misport',
    reservation: r,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
  };
}
