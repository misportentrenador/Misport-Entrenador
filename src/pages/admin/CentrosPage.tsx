import React from 'react';
import { MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const CentrosPage: React.FC = () => {
  const { centers, trainers } = useApp();

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Centros" subtitle={`${centers.length} centro(s) registrado(s)`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {centers.map(center => {
          const trainerCount = trainers.filter(t => t.centerIds.includes(center.id)).length;
          return (
            <div key={center.id} className="bg-misportDark rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white text-lg">{center.name}</h3>
                  <Badge tone={center.isActive ? 'success' : 'neutral'}>{center.isActive ? 'Activo' : 'Inactivo'}</Badge>
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-1.5"><MapPin size={14} className="text-misportOrange" /> {center.address}</p>
                <p className="text-sm text-gray-500">{center.description}</p>
                <p className="text-xs text-gray-600 pt-2 border-t border-gray-800 mt-3">{trainerCount} entrenador(es) asignado(s)</p>
              </div>
            </div>
          );
        })}
        {centers.length === 0 && (
          <div className="col-span-full text-center p-12 bg-misportDark rounded-xl border border-gray-800 text-gray-600">
            No hay centros registrados.
          </div>
        )}
      </div>
    </div>
  );
};
