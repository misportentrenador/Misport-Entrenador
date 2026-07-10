import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const toISODate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d: Date, n: number) => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};

export const AgendaPage: React.FC = () => {
  const { reservations, centers, trainers } = useApp();
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekEnd = days[6];

  const rangeLabel = `${weekStart.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${weekEnd.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const reservationsByDay = useMemo(() => {
    const map = new Map<string, typeof reservations>();
    days.forEach(d => map.set(toISODate(d), []));
    reservations
      .filter(r => r.status === 'CONFIRMED')
      .forEach(r => {
        if (map.has(r.date)) map.get(r.date)!.push(r);
      });
    map.forEach(list => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [reservations, days]);

  const todayISO = toISODate(new Date());

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Agenda"
        subtitle={rangeLabel}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekStart(w => addDays(w, -7))} className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setWeekStart(getMonday(new Date()))} className="px-4 py-2.5 rounded-lg border border-gray-800 text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-all">
              Hoy
            </button>
            <button onClick={() => setWeekStart(w => addDays(w, 7))} className="p-2.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
        {days.map((d, i) => {
          const iso = toISODate(d);
          const list = reservationsByDay.get(iso) ?? [];
          const isToday = iso === todayISO;
          return (
            <div key={iso} className={`bg-misportDark rounded-xl border overflow-hidden ${isToday ? 'border-misportBlue/50' : 'border-gray-800'}`}>
              <div className={`px-4 py-3 border-b border-gray-800 flex items-center justify-between ${isToday ? 'bg-blue-900/10' : 'bg-gray-900/50'}`}>
                <span className="font-bold text-white text-sm">{DAY_LABELS[i]}</span>
                <span className="text-xs text-gray-500">{d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
              </div>
              <div className="p-3 space-y-2 min-h-[80px]">
                {list.map(r => {
                  const center = centers.find(c => c.id === r.centerId);
                  const trainer = trainers.find(t => t.id === r.trainerId);
                  return (
                    <div key={r.id} className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800">
                      <div className="flex items-center gap-1.5 text-xs text-misportOrange font-bold">
                        <Clock size={12} /> {r.startTime} - {r.endTime}
                      </div>
                      <p className="text-white text-sm font-medium mt-1 truncate">{center?.name ?? '—'}</p>
                      <p className="text-xs text-gray-500 truncate">{trainer?.name ?? 'Sin entrenador'} · {r.userName}</p>
                    </div>
                  );
                })}
                {list.length === 0 && <p className="text-xs text-gray-700 text-center py-4">Sin sesiones</p>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600">
        <Badge tone="info">Vista semanal</Badge> Mostrando 7 días desde el lunes seleccionado.
      </p>
    </div>
  );
};
