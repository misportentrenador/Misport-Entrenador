import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { toISODate } from '../../../shared/lib/date';
import { AgendaSession } from './AgendaSession';

interface ProximasSesionesPanelProps {
  sessions: AgendaSession[];
}

export const ProximasSesionesPanel: React.FC<ProximasSesionesPanelProps> = ({ sessions }) => {
  const { centers, trainers } = useApp();
  const nowISO = toISODate(new Date());
  const nowTime = new Date().toTimeString().slice(0, 5);

  const proximas = useMemo(
    () => sessions
      .filter(s => s.reservation.status === 'CONFIRMED' && (s.date > nowISO || (s.date === nowISO && s.startTime >= nowTime)))
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
      .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, nowISO, nowTime]
  );

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center gap-2 bg-gray-900/50">
        <Clock size={16} className="text-misportBlue" />
        <h3 className="font-bold text-white">Próximas sesiones</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {proximas.map(s => {
          const center = centers.find(c => c.id === s.reservation.centerId);
          const trainer = trainers.find(t => t.id === s.reservation.trainerId);
          return (
            <div key={s.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{center?.name ?? 'Centro desconocido'}</p>
                <p className="text-xs text-gray-500 truncate">{trainer?.name ?? 'Sin entrenador'} · {s.reservation.userName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-white">{s.date}</p>
                <p className="text-xs text-gray-500">{s.startTime}</p>
              </div>
            </div>
          );
        })}
        {proximas.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-600">No hay próximas sesiones en esta vista.</div>
        )}
      </div>
    </div>
  );
};
