import React from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const EntrenadoresPage: React.FC = () => {
  const { trainers, centers } = useApp();

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Entrenadores" subtitle={`${trainers.length} entrenador(es) registrado(s)`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map(trainer => {
          const trainerCenters = centers.filter(c => trainer.centerIds.includes(c.id));
          return (
            <div key={trainer.id} className="bg-misportDark rounded-xl border border-gray-800 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-bold text-white text-lg">{trainer.name}</h3>
                <Badge tone={trainer.isActive ? 'success' : 'neutral'}>{trainer.isActive ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Centros</p>
                <div className="flex flex-wrap gap-1.5">
                  {trainerCenters.map(c => <Badge key={c.id} tone="info">{c.name}</Badge>)}
                  {trainerCenters.length === 0 && <span className="text-xs text-gray-600">Sin centro asignado</span>}
                </div>
              </div>
            </div>
          );
        })}
        {trainers.length === 0 && (
          <div className="col-span-full text-center p-12 bg-misportDark rounded-xl border border-gray-800 text-gray-600">
            No hay entrenadores registrados.
          </div>
        )}
      </div>
    </div>
  );
};
