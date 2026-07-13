import React from 'react';
import { Wallet } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useCatalog } from '../../../catalog/context/CatalogContext';
import { BONO_CLIENTE_STATUS_LABELS } from '../../lib/labels';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

/**
 * Información económica — solo lectura en este Sprint. La gestión de altas
 * de BonoCliente queda para el Sprint 12; el historial de pagos depende de
 * FinanceEntry.personaId, previsto para el Sprint 10 (decisión 3).
 */
export const InformacionEconomicaSection: React.FC<Props> = ({ personaId }) => {
  const { bonosCliente } = useCRM();
  const { bonos } = useCatalog();

  const misBonos = bonosCliente.items.filter(b => b.personaId === personaId);

  if (bonosCliente.loading || bonos.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Bonos</h3>
        {misBonos.length === 0 ? (
          <EmptyState icon={Wallet} message="Sin bonos registrados todavía. La gestión de altas de bonos llega en el Sprint 12." />
        ) : (
          <div className="space-y-3">
            {misBonos.map(b => {
              const producto = bonos.items.find(p => p.id === b.bonoId);
              return (
                <div key={b.id} className="flex items-center justify-between p-4 bg-gray-900/40 border border-gray-800 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{producto?.name ?? b.bonoId}</p>
                    <p className="text-xs text-gray-500 mt-1">Comprado: {b.purchaseDate.slice(0, 10)} · {b.sessionsRemaining} sesiones restantes</p>
                  </div>
                  <Badge tone={b.status === 'active' ? 'success' : 'neutral'}>{BONO_CLIENTE_STATUS_LABELS[b.status]}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Historial de pagos</h3>
        <p className="text-sm text-gray-500">Pendiente de la decisión 3 (Sprint 10): el historial económico de Finanzas se vinculará aquí mediante <code className="bg-black/20 px-1 rounded">FinanceEntry.personaId</code>.</p>
      </Card>
    </div>
  );
};
