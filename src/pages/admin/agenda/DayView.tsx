import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { toISODate, addDays } from '../../../shared/lib/date';
import { AgendaSession } from './AgendaSession';
import { SessionCard } from './SessionCard';

interface DayViewProps {
  day: Date;
  onDayChange: (date: Date) => void;
  sessions: AgendaSession[];
}

export const DayView: React.FC<DayViewProps> = ({ day, onDayChange, sessions }) => {
  const iso = toISODate(day);
  const dayLabel = day.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const isToday = iso === toISODate(new Date());

  const daySessions = useMemo(
    () => sessions.filter(s => s.date === iso).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions, iso]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 capitalize">{dayLabel} {isToday && <span className="text-misportBlue font-bold">· Hoy</span>}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onDayChange(addDays(day, -1))} aria-label="Día anterior" className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => onDayChange(new Date())} className="px-4 py-2.5 rounded-lg border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            Hoy
          </button>
          <button onClick={() => onDayChange(addDays(day, 1))} aria-label="Día siguiente" className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="bg-misportDark rounded-xl border border-gray-800 overflow-hidden">
        <div className="divide-y divide-gray-800">
          {daySessions.map(s => (
            <div key={s.id} className="p-4">
              <SessionCard session={s} canal="agenda_dia" />
            </div>
          ))}
          {daySessions.length === 0 && (
            <div className="px-5 py-16 text-center text-gray-600">
              <CalendarDays className="mx-auto mb-2 opacity-20" size={32} />
              Sin sesiones este día.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
