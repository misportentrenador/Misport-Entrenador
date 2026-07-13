import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Dumbbell, HeartPulse, Briefcase, Euro, Users, History } from 'lucide-react';
import { useMasterData } from '../../masterdata/context/MasterDataContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Spinner } from '../../../components/ui/Spinner';
import { InformacionBasicaSection } from './sections/InformacionBasicaSection';
import { PerfilDeportivoSection } from './sections/PerfilDeportivoSection';
import { PerfilSanitarioSection } from './sections/PerfilSanitarioSection';
import { InfoComercialSection } from './sections/InfoComercialSection';
import { InformacionEconomicaSection } from './sections/InformacionEconomicaSection';
import { RelacionesSection } from './sections/RelacionesSection';
import { HistorialSection } from './sections/HistorialSection';

type TabId = 'basica' | 'deportiva' | 'sanitaria' | 'comercial' | 'economica' | 'relaciones' | 'historial';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'basica', label: 'Básica', icon: User },
  { id: 'deportiva', label: 'Deportiva', icon: Dumbbell },
  { id: 'sanitaria', label: 'Sanitaria', icon: HeartPulse },
  { id: 'comercial', label: 'Comercial', icon: Briefcase },
  { id: 'economica', label: 'Económica', icon: Euro },
  { id: 'relaciones', label: 'Relaciones', icon: Users },
  { id: 'historial', label: 'Historial', icon: History },
];

/**
 * Ficha única del CRM (Sprint 9). Sin dashboard ni acciones rápidas
 * todavía (Sprint 10). Cada sección es su propio componente — nunca un
 * formulario monolítico.
 */
export const FichaPersonaPage: React.FC = () => {
  const { personaId } = useParams<{ personaId: string }>();
  const { personas } = useMasterData();
  const [tab, setTab] = useState<TabId>('basica');

  if (personas.loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  const persona = personas.items.find(p => p.id === personaId);

  if (!persona) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ficha no encontrada" />
        <EmptyState message="No se encontró esta persona." action={<Link to="/admin/crm"><Button variant="ghost"><ArrowLeft size={16} /> Volver al CRM</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={persona.name}
        subtitle="Ficha CRM"
        actions={<Link to="/admin/crm"><Button variant="ghost"><ArrowLeft size={16} /> Volver al CRM</Button></Link>}
      />

      <div className="flex border-b border-gray-800 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 whitespace-nowrap ${tab === t.id ? 'text-misportBlue' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <t.icon size={16} /> {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-misportBlue shadow-[0_0_10px_rgba(0,123,255,0.5)]"></div>}
          </button>
        ))}
      </div>

      {tab === 'basica' && <InformacionBasicaSection persona={persona} />}
      {tab === 'deportiva' && <PerfilDeportivoSection personaId={persona.id} />}
      {tab === 'sanitaria' && <PerfilSanitarioSection personaId={persona.id} />}
      {tab === 'comercial' && <InfoComercialSection personaId={persona.id} />}
      {tab === 'economica' && <InformacionEconomicaSection personaId={persona.id} />}
      {tab === 'relaciones' && <RelacionesSection personaId={persona.id} />}
      {tab === 'historial' && <HistorialSection personaId={persona.id} />}
    </div>
  );
};
