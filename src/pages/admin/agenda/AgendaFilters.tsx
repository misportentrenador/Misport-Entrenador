import React from 'react';
import { Filter } from 'lucide-react';
import { Center, Trainer, Service } from '../../../modules/catalog/types';

export interface AgendaFilterValues {
  centerId: string;
  trainerId: string;
  serviceId: string;
}

interface AgendaFiltersProps {
  centers: Center[];
  trainers: Trainer[];
  services: Service[];
  values: AgendaFilterValues;
  onChange: (values: AgendaFilterValues) => void;
}

export const AgendaFilters: React.FC<AgendaFiltersProps> = ({ centers, trainers, services, values, onChange }) => (
  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800">
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-misportBlue" />
      <span className="text-xs font-bold text-gray-500 uppercase">Filtros</span>
    </div>
    <select
      className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-44 shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
      value={values.centerId}
      onChange={(e) => onChange({ ...values, centerId: e.target.value })}
    >
      <option value="all">Todos los centros</option>
      {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
    <select
      className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-44 shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
      value={values.trainerId}
      onChange={(e) => onChange({ ...values, trainerId: e.target.value })}
    >
      <option value="all">Todos los entrenadores</option>
      {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
    <select
      className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-44 shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
      value={values.serviceId}
      onChange={(e) => onChange({ ...values, serviceId: e.target.value })}
    >
      <option value="all">Todos los servicios</option>
      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  </div>
);
