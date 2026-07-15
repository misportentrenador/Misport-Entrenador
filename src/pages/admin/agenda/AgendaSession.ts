import { Reservation } from '../../../types';
import { ExternalCalendarEvent, CalendarSourceId } from '../../../integrations/calendar/types';

/**
 * Modelo de vista de la Agenda (Sprint 15, generalizado en el Sprint 18)
 * — ningún componente de la Agenda lee `Reservation` ni un origen externo
 * concreto directamente. `reservation` solo existe cuando origin ===
 * 'misport'; `externalEvent` solo existe en cualquier otro origen. Añadir
 * un origen nuevo (Outlook, Apple Calendar, Booksy...) es implementar un
 * `CalendarSourceAdapter` (ver integrations/calendar) — esta vista y sus
 * componentes no cambian.
 */
export type AgendaSessionOrigin = 'misport' | CalendarSourceId;

export interface AgendaSession {
  id: string;
  origin: AgendaSessionOrigin;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  /** Solo presente cuando origin === 'misport'. */
  reservation?: Reservation;
  /** Solo presente cuando origin !== 'misport'. */
  externalEvent?: ExternalCalendarEvent;
}

export function reservationToAgendaSession(r: Reservation): AgendaSession {
  return {
    id: r.id,
    origin: 'misport',
    reservation: r,
    date: r.date,
    startTime: r.startTime,
    endTime: r.endTime,
    title: r.userName,
  };
}

export function externalEventToAgendaSession(e: ExternalCalendarEvent): AgendaSession {
  return {
    id: `${e.source}_${e.id}`,
    origin: e.source,
    externalEvent: e,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    title: e.title,
    subtitle: e.location,
  };
}
