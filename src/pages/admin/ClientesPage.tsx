import React from 'react';
import { Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

export const ClientesPage: React.FC = () => {
  const { clients, reservations } = useApp();

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Clientes" subtitle={`${clients.length} cliente(s) registrado(s)`} />

      <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Reservas</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const count = reservations.filter(r => r.userId === client.id).length;
                return (
                  <tr key={client.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4">{client.email}</td>
                    <td className="px-6 py-4 text-right">{count}</td>
                    <td className="px-6 py-4"><Badge tone="success">Activo</Badge></td>
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                    <Users className="mx-auto mb-2 opacity-20" size={32} />
                    Todavía no se ha registrado ningún cliente.
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
