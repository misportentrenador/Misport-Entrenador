import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { useCatalog } from '../../../modules/catalog/context/CatalogContext';
import { useMasterData } from '../../../modules/masterdata/context/MasterDataContext';

const DAYS_AHEAD = 30;

/**
 * Bonos activos que caducan en los próximos 30 días (Sprint 14) — para
 * poder contactar al cliente antes de que pierda sesiones. Solo lectura
 * sobre BonoCliente (Sprint 8); no introduce ningún cálculo de negocio
 * nuevo, solo un filtro de fecha.
 */
export const BonosPorCaducarPanel: React.FC = () => {
  const { bonosCliente } = useCRM();
  const { bonos } = useCatalog();
  const { personas } = useMasterData();

  const proximos = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const limit = new Date();
    limit.setDate(limit.getDate() + DAYS_AHEAD);
    const limitISO = limit.toISOString().split('T')[0];

    return bonosCliente.items
      .filter(b => b.status === 'active' && b.expiryDate && b.expiryDate.slice(0, 10) >= today && b.expiryDate.slice(0, 10) <= limitISO)
      .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''))
      .slice(0, 6);
  }, [bonosCliente.items]);

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <h3 className="font-bold text-white flex items-center gap-2"><Wallet size={16} className="text-misportBlue" /> Bonos por caducar (30 días)</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {proximos.map(b => {
          const persona = personas.items.find(p => p.id === b.personaId);
          const producto = bonos.items.find(prod => prod.id === b.bonoId);
          return (
            <div key={b.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link to={`/admin/crm/personas/${b.personaId}`} className="text-white font-medium truncate hover:text-misportBlue">{persona?.name ?? 'Persona desconocida'}</Link>
                <p className="text-xs text-gray-500">{producto?.name ?? b.bonoId} · {b.sessionsRemaining} sesiones restantes</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-white">{b.expiryDate?.slice(0, 10)}</p>
              </div>
            </div>
          );
        })}
        {proximos.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-600">Ningún bono caduca en los próximos {DAYS_AHEAD} días.</div>
        )}
      </div>
    </div>
  );
};
