import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

/**
 * Sesiones completadas sin bono suficiente (Sprint 11) — pendientes de
 * regularizar el cobro. Solo lectura sobre Reservation.bonoStatus; no
 * introduce ningún cálculo nuevo.
 */
export const PendientesRegularizarPanel: React.FC = () => {
  const { reservations, centers } = useApp();

  const pendientes = useMemo(
    () => reservations
      .filter(r => r.bonoStatus === 'pending_regularization')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6),
    [reservations]
  );

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <h3 className="font-bold text-white flex items-center gap-2"><AlertTriangle size={16} className="text-misportOrange" /> Pendientes de regularizar</h3>
        <Link to="/admin/reservas" className="text-misportBlue text-sm font-bold hover:underline">Ver reservas</Link>
      </div>
      <div className="divide-y divide-gray-800">
        {pendientes.map(r => {
          const center = centers.find(c => c.id === r.centerId);
          return (
            <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                {r.personaId ? (
                  <Link to={`/admin/crm/personas/${r.personaId}`} className="text-white font-medium truncate hover:text-misportBlue">{r.userName}</Link>
                ) : (
                  <p className="text-white font-medium truncate">{r.userName}</p>
                )}
                <p className="text-xs text-gray-500">{center?.name ?? 'Centro desconocido'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-white">{r.date}</p>
              </div>
            </div>
          );
        })}
        {pendientes.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-600">Sin sesiones pendientes de regularizar.</div>
        )}
      </div>
    </div>
  );
};
