import React, { useMemo } from 'react';
import { Sun, Calendar, AlertTriangle, Ticket, IdCard, Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { toISODate } from '../../../shared/lib/date';

/**
 * "Mi jornada de hoy" (Sprint 15) — zona superior de la Agenda, pensada
 * para crecer hasta convertirse en el resumen diario completo del
 * Director General (próximo cliente, llamadas pendientes, próxima
 * reunión, prioridades del día...). Este Sprint solo puebla los
 * indicadores para los que ya existe un dato real en el sistema; el resto
 * de la visión (seguimiento de empresas/ayuntamientos, prioridades
 * calculadas) queda pendiente de los módulos que aún no existen — no se
 * simula ningún dato.
 */
export const MiJornadaHoyPanel: React.FC = () => {
  const { user, reservations } = useApp();
  const { incidencias, bonosCliente, infoComercial } = useCRM();
  const todayISO = toISODate(new Date());
  const nowTime = new Date().toTimeString().slice(0, 5);

  const sesionesHoy = useMemo(
    () => reservations.filter(r => r.date === todayISO && (r.status === 'CONFIRMED' || r.status === 'COMPLETED')),
    [reservations, todayISO]
  );

  const proximaSesionHoy = useMemo(
    () => sesionesHoy
      .filter(r => r.status === 'CONFIRMED' && r.startTime >= nowTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))[0],
    [sesionesHoy, nowTime]
  );

  const cobrosPendientes = useMemo(
    () => reservations.filter(r => r.bonoStatus === 'pending_regularization').length,
    [reservations]
  );

  const bonosCaducanHoy = useMemo(
    () => bonosCliente.items.filter(b => b.status === 'active' && b.expiryDate?.slice(0, 10) === todayISO).length,
    [bonosCliente.items, todayISO]
  );

  const incidenciasAbiertas = incidencias.items.filter(i => i.estado === 'abierta').length;

  const seguimientosHoy = useMemo(
    () => infoComercial.items.filter(i => i.proximaAccionFecha && i.proximaAccionFecha.slice(0, 10) <= todayISO).length,
    [infoComercial.items, todayISO]
  );

  const slots = [
    { key: 'sesiones', label: 'Sesiones hoy', value: sesionesHoy.length, icon: Calendar },
    { key: 'cobros', label: 'Cobros pendientes', value: cobrosPendientes, icon: AlertTriangle },
    { key: 'bonos', label: 'Bonos que caducan hoy', value: bonosCaducanHoy, icon: Ticket },
    { key: 'incidencias', label: 'Incidencias abiertas', value: incidenciasAbiertas, icon: IdCard },
    { key: 'seguimientos', label: 'Seguimientos comerciales pendientes', value: seguimientosHoy, icon: Clock },
  ];

  return (
    <div className="bg-gradient-to-r from-misportBlue/10 to-transparent rounded-xl border border-gray-800 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sun size={18} className="text-misportOrange" />
        <h2 className="text-lg font-bold text-white">Buenos días{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {slots.map(slot => (
          <div key={slot.key} className="bg-misportDark rounded-lg border border-gray-800 p-3">
            <slot.icon size={14} className="text-misportBlue mb-1.5" />
            <p className="text-xl font-bold text-white leading-tight">{slot.value}</p>
            <p className="text-xs text-gray-500">{slot.label}</p>
          </div>
        ))}
      </div>

      {proximaSesionHoy && (
        <p className="text-sm text-gray-400">
          Tu próxima sesión es a las <span className="text-white font-bold">{proximaSesionHoy.startTime}</span> con <span className="text-white font-bold">{proximaSesionHoy.userName}</span>.
        </p>
      )}
      {!proximaSesionHoy && sesionesHoy.length === 0 && (
        <p className="text-sm text-gray-600">No hay sesiones programadas para hoy.</p>
      )}
    </div>
  );
};
