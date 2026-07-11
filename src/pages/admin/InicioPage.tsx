import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Euro, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFinance } from '../../context/FinanceContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { formatEURCompact } from '../../shared/lib/format';

export const InicioPage: React.FC = () => {
  const { reservations, centers, trainers } = useApp();
  const { entries, computeTotals } = useFinance();

  const finance = useMemo(() => entries.reduce((acc, entry) => {
    const t = computeTotals(entry);
    return { billingBase: acc.billingBase + t.billingBase, netProfit: acc.netProfit + t.netProfit };
  }, { billingBase: 0, netProfit: 0 }), [entries, computeTotals]);

  const upcoming = [...reservations]
    .filter(r => r.status === 'CONFIRMED')
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Inicio" subtitle="Resumen general de MISPORT" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Reservas totales" value={reservations.length} icon={Calendar} tone="blue" />
        <StatCard label="Centros activos" value={centers.filter(c => c.isActive).length} icon={MapPin} tone="orange" />
        <StatCard label="Entrenadores" value={trainers.length} icon={Users} tone="green" />
        <StatCard label="Facturación base" value={formatEURCompact(finance.billingBase)} icon={Euro} tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatCard label="Beneficio neto empresa" value={formatEURCompact(finance.netProfit)} icon={TrendingUp} signed={finance.netProfit} />
        </div>

        <div className="lg:col-span-2 bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
            <h3 className="font-bold text-white flex items-center gap-2"><Clock size={16} className="text-misportBlue" /> Próximas reservas</h3>
            <Link to="/admin/reservas" className="text-misportBlue text-sm font-bold hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-800">
            {upcoming.map(r => {
              const center = centers.find(c => c.id === r.centerId);
              const trainer = trainers.find(t => t.id === r.trainerId);
              return (
                <div key={r.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{center?.name ?? 'Centro desconocido'}</p>
                    <p className="text-xs text-gray-500">{trainer?.name ?? 'Sin entrenador'} · {r.userName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-white">{r.date}</p>
                    <p className="text-xs text-gray-500">{r.startTime}</p>
                  </div>
                </div>
              );
            })}
            {upcoming.length === 0 && (
              <div className="px-5 py-10 text-center text-gray-600">No hay reservas próximas.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
