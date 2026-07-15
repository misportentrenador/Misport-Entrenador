import React from 'react';

export type PersonaFilterId =
  | 'activos'
  | 'inactivos'
  | 'sin_reservas'
  | 'con_bono'
  | 'sin_bono'
  | 'ems'
  | 'trail'
  | 'empresas'
  | 'activa50'
  | 'con_deuda';

const FILTER_LABELS: Record<PersonaFilterId, string> = {
  activos: 'Activos',
  inactivos: 'Inactivos',
  sin_reservas: 'Sin reservas',
  con_bono: 'Con bono',
  sin_bono: 'Sin bono',
  ems: 'EMS',
  trail: 'Trail',
  empresas: 'Empresas',
  activa50: 'ACTIVA+50',
  con_deuda: 'Con deuda',
};

export const FILTER_ORDER: PersonaFilterId[] = ['activos', 'inactivos', 'sin_reservas', 'con_bono', 'sin_bono', 'ems', 'trail', 'empresas', 'activa50', 'con_deuda'];

interface Props {
  active: Set<PersonaFilterId>;
  onToggle: (id: PersonaFilterId) => void;
}

/**
 * Filtros predefinidos (Sprint 12) — chips activables, combinables entre sí
 * (AND). "Con deuda" (Sprint 20) usa personaTieneDeuda: al menos una
 * Factura en estado 'emitida' con importe pendiente > 0 (FinanceContext).
 */
export const PersonaFilters: React.FC<Props> = ({ active, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {FILTER_ORDER.map(id => {
      const isActive = active.has(id);
      return (
        <button
          key={id}
          onClick={() => onToggle(id)}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
            isActive
              ? 'bg-misportBlue text-white border-misportBlue'
              : 'bg-gray-900/40 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-gray-300'
          }`}
        >
          {FILTER_LABELS[id]}
        </button>
      );
    })}
  </div>
);
