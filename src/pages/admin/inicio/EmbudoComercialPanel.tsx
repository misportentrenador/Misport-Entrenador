import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { EstadoComercial } from '../../../modules/crm/types';
import { ESTADO_COMERCIAL_LABELS } from '../../../modules/crm/lib/labels';

const ORDER: EstadoComercial[] = ['lead', 'contactado', 'propuesta', 'cliente', 'perdido'];

/**
 * Embudo comercial (Sprint 14) — cuántas personas hay en cada estado de
 * InfoComercial (Sprint 9). Solo lectura, un conteo por estado.
 */
export const EmbudoComercialPanel: React.FC = () => {
  const { infoComercial } = useCRM();

  const counts = useMemo(() => {
    const map = new Map<EstadoComercial, number>(ORDER.map(e => [e, 0]));
    infoComercial.items.forEach(i => map.set(i.estadoComercial, (map.get(i.estadoComercial) ?? 0) + 1));
    return map;
  }, [infoComercial.items]);

  const total = infoComercial.items.length;

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <h3 className="font-bold text-white flex items-center gap-2"><TrendingUp size={16} className="text-misportBlue" /> Embudo comercial</h3>
      </div>
      <div className="p-5">
        {total === 0 ? (
          <p className="text-center text-gray-600 py-6">Sin seguimiento comercial registrado todavía.</p>
        ) : (
          <div className="space-y-3">
            {ORDER.map(estado => {
              const count = counts.get(estado) ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={estado}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{ESTADO_COMERCIAL_LABELS[estado]}</span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-misportBlue rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
