import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign } from 'lucide-react';
import { useFinance, getImportePendiente } from '../../../context/FinanceContext';
import { formatEUR } from '../../../shared/lib/format';

/**
 * Cobros pendientes (Sprint 20) — facturas emitidas con importe pendiente
 * > 0. Misma definición de "deuda" que el filtro "Con deuda" del CRM
 * (personaTieneDeuda, FinanceContext) para que ambos coincidan siempre.
 */
export const CobrosPendientesPanel: React.FC = () => {
  const { facturas, cobros } = useFinance();

  const pendientes = useMemo(
    () => facturas.filter(f => f.estado === 'emitida' && getImportePendiente(f, cobros) > 0),
    [facturas, cobros]
  );

  const importeTotal = useMemo(
    () => pendientes.reduce((sum, f) => sum + getImportePendiente(f, cobros), 0),
    [pendientes, cobros]
  );

  return (
    <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
        <h3 className="font-bold text-white flex items-center gap-2"><CircleDollarSign size={16} className="text-misportOrange" /> Cobros pendientes</h3>
        <Link to="/admin/crm?filtro=con_deuda" className="text-misportBlue text-sm font-bold hover:underline">Ver listado</Link>
      </div>
      <div className="p-5 flex items-center gap-8">
        <div>
          <p className="text-2xl font-bold text-white">{pendientes.length}</p>
          <p className="text-xs text-gray-500">Facturas pendientes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-misportOrange">{formatEUR(importeTotal)}</p>
          <p className="text-xs text-gray-500">Importe total pendiente</p>
        </div>
      </div>
      {pendientes.length === 0 && (
        <p className="px-5 pb-5 text-sm text-gray-600">Sin cobros pendientes.</p>
      )}
    </div>
  );
};
