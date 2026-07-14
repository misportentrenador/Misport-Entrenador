import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toISODate, addDays, getMonday } from '../../../shared/lib/date';
import { AgendaSession } from './AgendaSession';
import { SessionCard } from './SessionCard';

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface WeekViewProps {
  weekStart: Date;
  onWeekStartChange: (date: Date) => void;
  sessions: AgendaSession[];
}

export const WeekView: React.FC<WeekViewProps> = ({ weekStart, onWeekStartChange, sessions }) => {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = days[6];
  const rangeLabel = `${weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  const todayISO = toISODate(new Date());

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, AgendaSession[]>();
    days.forEach(d => map.set(toISODate(d), []));
    sessions.forEach(s => {
      if (map.has(s.date)) map.get(s.date)!.push(s);
    });
    map.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [sessions, days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{rangeLabel}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onWeekStartChange(addDays(weekStart, -7))} className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => onWeekStartChange(getMonday(new Date()))} className="px-4 py-2.5 rounded-lg border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            Hoy
          </button>
          <button onClick={() => onWeekStartChange(addDays(weekStart, 7))} className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
        {days.map((d, i) => {
          const iso = toISODate(d);
          const list = sessionsByDay.get(iso) ?? [];
          const isToday = iso === todayISO;
          return (
            <div key={iso} className={`bg-misportDark rounded-xl border overflow-hidden ${isToday ? 'border-misportBlue/50' : 'border-gray-800'}`}>
              <div className={`px-4 py-3 border-b border-gray-800 flex items-center justify-between ${isToday ? 'bg-blue-900/10' : 'bg-gray-900/50'}`}>
                <span className="font-bold text-white text-sm">{DAY_LABELS[i]}</span>
                <span className="text-xs text-gray-500">{d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[80px]">
                {list.map(s => <SessionCard key={s.id} session={s} compact />)}
                {list.length === 0 && <p className="text-xs text-gray-700 text-center py-4">Sin sesiones</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
