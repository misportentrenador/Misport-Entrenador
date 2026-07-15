import React, { useMemo, useState } from 'react';
import { CalendarRange, CalendarDays } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCatalog } from '../../modules/catalog/context/CatalogContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { toISODate, getMonday, addDays } from '../../shared/lib/date';
import { reservationToAgendaSession, externalEventToAgendaSession } from './agenda/AgendaSession';
import { AgendaFilters, AgendaFilterValues } from './agenda/AgendaFilters';
import { WeekView } from './agenda/WeekView';
import { DayView } from './agenda/DayView';
import { MiJornadaHoyPanel } from './agenda/MiJornadaHoyPanel';
import { ProximasSesionesPanel } from './agenda/ProximasSesionesPanel';
import { AvisosDelDiaPanel } from './agenda/AvisosDelDiaPanel';
import { AgendaConfigForm } from './agenda/AgendaConfigForm';
import { IntegrationsPanel } from './agenda/IntegrationsPanel';
import { useExternalCalendarEvents } from '../../integrations/calendar/useExternalCalendarEvents';

type ViewMode = 'day' | 'week';

export const AgendaPage: React.FC = () => {
  const { reservations, centers, trainers } = useApp();
  const { services } = useCatalog();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [filters, setFilters] = useState<AgendaFilterValues>({ centerId: 'all', trainerId: 'all', serviceId: 'all' });

  const misportSessions = useMemo(
    () => reservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .filter(r => filters.centerId === 'all' || r.centerId === filters.centerId)
      .filter(r => filters.trainerId === 'all' || r.trainerId === filters.trainerId)
      .filter(r => filters.serviceId === 'all' || r.serviceId === filters.serviceId)
      .map(reservationToAgendaSession),
    [reservations, filters]
  );

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      const iso = toISODate(selectedDay);
      return { start: iso, end: iso };
    }
    return { start: toISODate(weekStart), end: toISODate(addDays(weekStart, 6)) };
  }, [viewMode, selectedDay, weekStart]);

  const { adapters, events: externalEvents, connect, disconnect, loading: loadingExternal, error: externalError } = useExternalCalendarEvents(dateRange);

  const mergedSessions = useMemo(
    () => [...misportSessions, ...externalEvents.map(externalEventToAgendaSession)],
    [misportSessions, externalEvents]
  );

  const visibleRangeSessions = useMemo(() => {
    if (viewMode === 'day') {
      const iso = toISODate(selectedDay);
      return mergedSessions.filter(s => s.date === iso);
    }
    const weekDays = new Set(Array.from({ length: 7 }, (_, i) => toISODate(addDays(weekStart, i))));
    return mergedSessions.filter(s => weekDays.has(s.date));
  }, [mergedSessions, viewMode, selectedDay, weekStart]);

  // Los avisos y próximas sesiones son conceptos propios de MISPORT (bonos,
  // entrenador asignado, pendiente de regularizar) — no aplican a eventos
  // de un calendario externo de solo lectura.
  const visibleMisportSessions = useMemo(
    () => visibleRangeSessions.filter(s => s.origin === 'misport'),
    [visibleRangeSessions]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Agenda"
        subtitle="Centro operativo diario de MISPORT"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-misportBlue border-misportBlue text-white' : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'}`}
            >
              <CalendarDays size={16} /> Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-misportBlue border-misportBlue text-white' : 'border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'}`}
            >
              <CalendarRange size={16} /> Semana
            </button>
          </div>
        }
      />

      <MiJornadaHoyPanel />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <AgendaFilters centers={centers} trainers={trainers} services={services.items} values={filters} onChange={setFilters} />
        <div className="flex items-center gap-4">
          <IntegrationsPanel adapters={adapters} connect={connect} disconnect={disconnect} loading={loadingExternal} error={externalError} />
          <AgendaConfigForm />
        </div>
      </div>

      {viewMode === 'day' ? (
        <DayView day={selectedDay} onDayChange={setSelectedDay} sessions={mergedSessions} />
      ) : (
        <WeekView weekStart={weekStart} onWeekStartChange={setWeekStart} sessions={mergedSessions} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProximasSesionesPanel sessions={visibleMisportSessions} />
        <AvisosDelDiaPanel sessions={visibleMisportSessions} />
      </div>
    </div>
  );
};
