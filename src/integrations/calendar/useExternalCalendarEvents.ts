import { useCallback, useEffect, useState } from 'react';
import { CalendarSourceAdapter, ExternalCalendarEvent, CalendarDateRange } from './types';
import { googleCalendarAdapter } from './googleCalendarAdapter';

/**
 * Registro de adaptadores de calendario activos (Sprint 18). Añadir un
 * origen nuevo (Outlook, Apple Calendar, Booksy...) es implementar
 * CalendarSourceAdapter y añadirlo aquí — la Agenda y este hook no
 * cambian.
 */
const CALENDAR_ADAPTERS: CalendarSourceAdapter[] = [googleCalendarAdapter];

export function useExternalCalendarEvents(range: CalendarDateRange) {
  const [events, setEvents] = useState<ExternalCalendarEvent[]>([]);
  const [connectionVersion, setConnectionVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const connected = CALENDAR_ADAPTERS.filter(a => a.isConfigured() && a.isConnected());
    if (connected.length === 0) {
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(connected.map(a => a.fetchEvents(range)));
      setEvents(results.flat());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al sincronizar calendarios externos.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end, connectionVersion]);

  useEffect(() => { refresh(); }, [refresh]);

  const connect = useCallback(async (source: string) => {
    const adapter = CALENDAR_ADAPTERS.find(a => a.source === source);
    if (!adapter) return;
    setError(null);
    try {
      await adapter.connect();
      setConnectionVersion(v => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo conectar.');
    }
  }, []);

  const disconnect = useCallback((source: string) => {
    const adapter = CALENDAR_ADAPTERS.find(a => a.source === source);
    adapter?.disconnect();
    setConnectionVersion(v => v + 1);
  }, []);

  return { adapters: CALENDAR_ADAPTERS, events, loading, error, connect, disconnect, refresh };
}
