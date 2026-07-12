import React, { useState } from 'react';
import { MapPin, Users, Dumbbell, Euro, Ticket } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { CentrosTab } from './CentrosTab';
import { EntrenadoresTab } from './EntrenadoresTab';
import { ServiciosTab } from './ServiciosTab';
import { TarifasTab } from './TarifasTab';
import { BonosTab } from './BonosTab';

type TabId = 'centros' | 'entrenadores' | 'servicios' | 'tarifas' | 'bonos';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'centros', label: 'Centros', icon: MapPin },
  { id: 'entrenadores', label: 'Entrenadores', icon: Users },
  { id: 'servicios', label: 'Servicios', icon: Dumbbell },
  { id: 'tarifas', label: 'Tarifas', icon: Euro },
  { id: 'bonos', label: 'Bonos', icon: Ticket },
];

/**
 * Master editor for Centros/Entrenadores/Servicios/Tarifas/Bonos. Recursos
 * moved to the Master Data domain (modules/masterdata) in Sprint 3.
 * Bookings and Finanzas do not read from here yet — they keep their own
 * copies until a future sprint migrates them (see Sprint 2 design notes).
 */
export const CatalogoPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('centros');

  return (
    <div className="space-y-6">
      <PageHeader title="Catálogo Maestro" subtitle="Centros, entrenadores, servicios, tarifas y bonos" />

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

      {tab === 'centros' && <CentrosTab />}
      {tab === 'entrenadores' && <EntrenadoresTab />}
      {tab === 'servicios' && <ServiciosTab />}
      {tab === 'tarifas' && <TarifasTab />}
      {tab === 'bonos' && <BonosTab />}
    </div>
  );
};
