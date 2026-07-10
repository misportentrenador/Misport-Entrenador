import React, { useState } from 'react';
import { Calendar, Filter, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const ReservasPage: React.FC = () => {
  const { reservations, centers, trainers } = useApp();
  const [filterCenter, setFilterCenter] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

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
                      <Badge tone={r.status === 'CONFIRMED' ? 'success' : 'danger'}>
                        {r.status === 'CONFIRMED' ? 'ACTIVA' : 'CANCELADA'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
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
