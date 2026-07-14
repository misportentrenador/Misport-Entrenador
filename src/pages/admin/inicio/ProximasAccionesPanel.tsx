import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { useMasterData } from '../../../modules/masterdata/context/MasterDataContext';
import { Badge } from '../../../components/ui/Badge';

/**
 * Próximas acciones comerciales pendientes (Sprint 14) — seguimientos ya
 * vencidos o próximos, ordenados por fecha. Solo lectura sobre
 * InfoComercial.proximaAccionFecha (Sprint 9).
 */
export const ProximasAccionesPanel: React.FC = () => {
  const { infoComercial } = useCRM();
  const { personas } = useMasterData();

  const acciones = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return infoComercial.items
      .filter(i => i.proximaAccionFecha && i.proximaAccion.trim())
      .map(i => ({ ...i, isOverdue: (i.proximaAccionFecha as string).slice(0, 10) < today }))
      .sort((a, b) => (a.proximaAccionFecha ?? '').localeCompare(b.proximaAccionFecha ?? ''))
      .slice(0, 6);
  }, [infoComercial.items]);

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <h3 className="font-bold text-white flex items-center gap-2"><CalendarClock size={16} className="text-misportBlue" /> Próximas acciones comerciales</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {acciones.map(a => {
          const persona = personas.items.find(p => p.id === a.personaId);
          return (
            <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link to={`/admin/crm/personas/${a.personaId}`} className="text-white font-medium truncate hover:text-misportBlue">{persona?.name ?? 'Persona desconocida'}</Link>
                <p className="text-xs text-gray-500 truncate">{a.proximaAccion}</p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="text-sm text-white">{a.proximaAccionFecha?.slice(0, 10)}</p>
                {a.isOverdue && <Badge tone="danger">Vencida</Badge>}
              </div>
            </div>
          );
        })}
        {acciones.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-600">Sin próximas acciones comerciales registradas.</div>
        )}
      </div>
    </div>
  );
};
