import React from 'react';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';

export const ProximamentePage: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <PageHeader title="Próximamente" subtitle="Esta integración todavía no está disponible" />
    <div className="text-center p-16 bg-misportDark rounded-xl border border-gray-800 text-gray-600">
      <Sparkles className="mx-auto mb-3 opacity-30" size={40} />
      Esta funcionalidad está planificada para una fase futura.
    </div>
  </div>
);
