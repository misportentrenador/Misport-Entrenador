import React from 'react';
import { Building2, Users } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useMasterData } from '../../../masterdata/context/MasterDataContext';
import { Card } from '../../../../components/ui/Card';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

/**
 * Relaciones — solo lectura en este Sprint. Empresa ya existe (Contacto,
 * Datos Maestros); la gestión de RelacionPersona (familia, entrenador
 * asignado) llega en el Sprint 12.
 */
export const RelacionesSection: React.FC<Props> = ({ personaId }) => {
  const { contactos, organizaciones } = useMasterData();
  const { relaciones } = useCRM();

  const empresas = contactos.items
    .filter(c => c.personaId === personaId)
    .map(c => organizaciones.items.find(o => o.id === c.organizacionId))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const misRelaciones = relaciones.items.filter(r => r.personaAId === personaId || r.personaBId === personaId);

  if (contactos.loading || organizaciones.loading || relaciones.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Empresas</h3>
        {empresas.length === 0 ? (
          <EmptyState icon={Building2} message="Sin organizaciones vinculadas. Se gestionan desde Datos Maestros (Contactos)." />
        ) : (
          <ul className="space-y-2">
            {empresas.map(o => (
              <li key={o.id} className="text-white text-sm p-3 bg-gray-900/40 border border-gray-800 rounded-lg">{o.name}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Familia / Entrenador asignado</h3>
        {misRelaciones.length === 0 ? (
          <EmptyState icon={Users} message="Sin relaciones registradas todavía. La gestión de relaciones (familia, entrenador asignado) llega en el Sprint 12." />
        ) : (
          <ul className="space-y-2">
            {misRelaciones.map(r => (
              <li key={r.id} className="text-white text-sm p-3 bg-gray-900/40 border border-gray-800 rounded-lg">{r.tipo} — {r.notas}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
