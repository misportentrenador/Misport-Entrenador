import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { useMasterData } from '../../../modules/masterdata/context/MasterDataContext';
import { useCatalog } from '../../../modules/catalog/context/CatalogContext';
import { useAgendaConfig } from '../../../context/AgendaConfigContext';
import { AgendaSession } from './AgendaSession';

interface AvisosDelDiaPanelProps {
  /** El llamador (AgendaPage) filtra a origin === 'misport' antes de pasarlas — un evento externo de solo lectura no tiene bono/entrenador/pago que avisar. */
  sessions: AgendaSession[];
}

/**
 * Avisos accionables sobre lo que hay visible en la Agenda ahora mismo
 * (Sprint 15). Umbrales y activación vienen de AgendaConfig — nada
 * hardcodeado. Independiente del panel "Bonos por caducar" del Dashboard
 * (Sprint 14, ventana fija de 30 días): este es el aviso operativo del día
 * a día, con su propio umbral configurable.
 */
export const AvisosDelDiaPanel: React.FC<AvisosDelDiaPanelProps> = ({ sessions }) => {
  const { bonosCliente } = useCRM();
  const { personas } = useMasterData();
  const { services } = useCatalog();
  const { config } = useAgendaConfig();

  const bonosPorCaducar = useMemo(() => {
    const today = new Date();
    const limit = new Date(today);
    limit.setDate(limit.getDate() + config.diasAvisoBonoPorCaducar);
    return bonosCliente.items
      .filter(b => b.status === 'active' && b.expiryDate && new Date(b.expiryDate) >= today && new Date(b.expiryDate) <= limit)
      .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''));
  }, [bonosCliente.items, config.diasAvisoBonoPorCaducar]);

  const pendientesRegularizar = useMemo(
    () => sessions.filter(s => s.reservation!.bonoStatus === 'pending_regularization'),
    [sessions]
  );

  const sinEntrenador = useMemo(() => {
    if (!config.avisarSesionesSinEntrenador) return [];
    return sessions.filter(s => {
      if (s.reservation!.status !== 'CONFIRMED' || s.reservation!.trainerId) return false;
      const service = services.items.find(sv => sv.id === s.reservation!.serviceId);
      return service?.requiresTrainer === true;
    });
  }, [sessions, services.items, config.avisarSesionesSinEntrenador]);

  const total = bonosPorCaducar.length + pendientesRegularizar.length + sinEntrenador.length;

  if (total === 0) {
    return (
      <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 p-5 text-center text-gray-600">
        Sin avisos importantes en esta vista.
      </div>
    );
  }

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center gap-2 bg-gray-900/50">
        <AlertTriangle size={16} className="text-misportOrange" />
        <h3 className="font-bold text-white">Avisos importantes</h3>
      </div>
      <div className="divide-y divide-gray-800 text-sm">
        {bonosPorCaducar.map(b => {
          const persona = personas.items.find(p => p.id === b.personaId);
          return (
            <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <Link to={`/admin/crm/personas/${b.personaId}`} className="text-white hover:text-misportBlue truncate">{persona?.name ?? 'Persona desconocida'}</Link>
              <span className="text-xs text-gray-500 shrink-0">Bono caduca el {b.expiryDate?.slice(0, 10)}</span>
            </div>
          );
        })}
        {pendientesRegularizar.map(s => (
          <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
            {s.reservation!.personaId ? (
              <Link to={`/admin/crm/personas/${s.reservation!.personaId}`} className="text-white hover:text-misportBlue truncate">{s.reservation!.userName}</Link>
            ) : (
              <span className="text-white truncate">{s.reservation!.userName}</span>
            )}
            <span className="text-xs text-gray-500 shrink-0">Pendiente de regularizar · {s.date}</span>
          </div>
        ))}
        {sinEntrenador.map(s => (
          <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
            <span className="text-white truncate">{s.reservation!.userName}</span>
            <span className="text-xs text-gray-500 shrink-0">Sin entrenador asignado · {s.date} {s.startTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
