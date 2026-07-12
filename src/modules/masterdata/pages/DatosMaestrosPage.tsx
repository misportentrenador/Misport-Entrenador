import React, { useState } from 'react';
import { Contact, Building2, Link2, Box } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { PersonasTab } from './PersonasTab';
import { OrganizacionesTab } from './OrganizacionesTab';
import { ContactosTab } from './ContactosTab';
import { RecursosTab } from './RecursosTab';

type TabId = 'personas' | 'organizaciones' | 'contactos' | 'recursos';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'personas', label: 'Personas', icon: Contact },
  { id: 'organizaciones', label: 'Organizaciones', icon: Building2 },
  { id: 'contactos', label: 'Contactos', icon: Link2 },
  { id: 'recursos', label: 'Recursos', icon: Box },
];

/**
 * Master Data domain: Persona, Organización, Contacto and Recurso share
 * this one page (and one context, one repository pattern, one Design
 * System) instead of being independent modules. Persona/Organización stay
 * neutral — no business role lives here; Contacto only records that a
 * relationship exists, never why.
 */
export const DatosMaestrosPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('personas');

  return (
    <div className="space-y-6">
      <PageHeader title="Datos Maestros" subtitle="Personas, organizaciones, contactos y recursos" />

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

      {tab === 'personas' && <PersonasTab />}
      {tab === 'organizaciones' && <OrganizacionesTab />}
      {tab === 'contactos' && <ContactosTab />}
      {tab === 'recursos' && <RecursosTab />}
    </div>
  );
};
