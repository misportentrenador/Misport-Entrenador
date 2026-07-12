import React, { useState } from 'react';
import { Calendar, CheckCircle2, Filter, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useFinance, financeServiceNameForCatalogServiceId } from '../../context/FinanceContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge, BadgeTone } from '../../components/ui/Badge';
import { Reservation } from '../../types';

const STATUS_LABEL: Record<Reservation['status'], string> = {
  CONFIRMED: 'ACTIVA',
  CANCELLED: 'CANCELADA',
  COMPLETED: 'COMPLETADA',
};
const STATUS_TONE: Record<Reservation['status'], BadgeTone> = {
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'info',
};

export const ReservasPage: React.FC = () => {
  const { reservations, centers, trainers, completeReservation } = useApp();
  const { entries, addEntry } = useFinance();
  const [filterCenter, setFilterCenter] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  // Sprint 7: al completar una reserva, se genera automáticamente su entrada
  // en Finanzas (mismo centro/entrenador/servicio/fecha/tarifa del Catálogo).
  // sourceReservationId evita crear una segunda entrada si se repite la acción.
  const handleComplete = (r: Reservation) => {
    if (r.status !== 'CONFIRMED' || completingIds.has(r.id)) return;
    setCompletingIds(prev => new Set(prev).add(r.id));

    completeReservation(r.id);

    const alreadyRecorded = entries.some(e => e.sourceReservationId === r.id);
    const financeService = financeServiceNameForCatalogServiceId(r.serviceId);
    if (!alreadyRecorded && financeService) {
      const center = centers.find(c => c.id === r.centerId);
      const trainer = trainers.find(t => t.id === r.trainerId);
      addEntry({
        date: r.date,
        trainerName: trainer?.name ?? 'Grupal (sin asignar)',
        centerName: center?.name ?? '',
        service: financeService,
        // Decisión de negocio (Sprint 7): usar siempre la tarifa oficial de
        // Grupo del Catálogo, sin inferir la frecuencia semanal real.
        groupDays: financeService === 'Entrenamiento grupal' ? 1 : undefined,
        quantity: 1,
        sourceReservationId: r.id,
      });
    }
  };

  const filteredReservations = reservations.filter(r => {
    const matchesCenter = filterCenter === 'all' || r.centerId === filterCenter;
    const matchesDate = filterDate === '' || r.date === filterDate;
    return matchesCenter && matchesDate;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Reservas"
        subtitle="Listado completo de reservas de todos los centros"
        actions={
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-misportBlue" />
              <span className="text-xs font-bold text-gray-500 uppercase">Filtros</span>
            </div>
            <select
              className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-48 shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
              value={filterCenter}
              onChange={(e) => setFilterCenter(e.target.value)}
            >
              <option value="all">Todos los Centros</option>
              {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="date"
              className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-auto shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="text-xs text-red-400 hover:text-red-300 underline whitespace-nowrap">
                Limpiar fecha
              </button>
            )}
          </div>
        }
      />

      <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            Listado de Reservas
            {filterDate && <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Fecha: {filterDate}</span>}
          </h3>
          <button className="text-misportBlue hover:text-blue-400 text-sm font-bold flex items-center gap-1 transition-colors"><Plus size={16} /> Nueva</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Centro</th>
                <th className="px-6 py-4">Entrenador</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map(r => {
                const trainer = trainers.find(t => t.id === r.trainerId);
                const center = centers.find(c => c.id === r.centerId);
                return (
                  <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{r.date} <span className="text-gray-500 ml-1">{r.startTime}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{r.userName || r.userId}</span>
                        <span className="text-xs text-gray-500">{r.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{center?.name}</td>
                    <td className="px-6 py-4">{trainer?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleComplete(r)}
                          disabled={completingIds.has(r.id)}
                          className="flex items-center gap-1.5 text-misportBlue hover:text-blue-400 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                        >
                          <CheckCircle2 size={14} /> Marcar completada
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-600">
                    <Calendar className="mx-auto mb-2 opacity-20" size={32} />
                    No hay reservas que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
