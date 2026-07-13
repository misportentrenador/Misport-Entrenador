import React from 'react';
import { Wallet, StickyNote, AlertTriangle, MessageSquare, Plus, CalendarPlus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useCRM } from '../context/CRMContext';
import { Persona } from '../../masterdata/types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface Props {
  persona: Persona;
  onNavigate: (tab: 'reservar' | 'economica' | 'historial') => void;
}

const todayISO = () => new Date().toISOString().split('T')[0];

/**
 * Resumen y acciones rápidas al abrir la ficha (Sprint 10). Las acciones
 * llevan a la sección que ya posee el formulario correspondiente — el
 * dashboard nunca duplica lógica de creación, solo navega.
 */
export const PersonaDashboardCard: React.FC<Props> = ({ persona, onNavigate }) => {
  const { reservations } = useApp();
  const { bonosCliente, notas } = useCRM();

  const misReservas = reservations.filter(r => r.personaId === persona.id);
  const proximaReserva = misReservas
    .filter(r => r.status === 'CONFIRMED' && r.date >= todayISO())
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const ultimaSesion = misReservas
    .filter(r => r.status === 'COMPLETED')
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const bonosActivos = bonosCliente.items.filter(b => b.personaId === persona.id && b.status === 'active');
  const notasRecientes = notas.items
    .filter(n => n.personaId === persona.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 2);

  return (
    <Card className="p-5 space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 shrink-0 flex items-center justify-center text-gray-500 border border-gray-700">
          {persona.photoUrl ? <img src={persona.photoUrl} alt="" className="w-full h-full object-cover" /> : persona.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-[160px]">
          <p className="text-white font-bold text-lg">{persona.name}</p>
          <Badge tone={persona.isActive ? 'success' : 'neutral'}>{persona.isActive ? 'Activa' : 'Inactiva'}</Badge>
        </div>
        <div className="text-sm text-gray-400">
          <p><span className="text-gray-500">Próxima reserva:</span> {proximaReserva ? `${proximaReserva.date} · ${proximaReserva.startTime}` : 'Sin reservas próximas'}</p>
          <p><span className="text-gray-500">Última sesión:</span> {ultimaSesion ? ultimaSesion.date : 'Sin sesiones completadas'}</p>
        </div>
        <div className="text-sm text-gray-400">
          <p><span className="text-gray-500">Bonos activos:</span> {bonosActivos.length}</p>
          <p><span className="text-gray-500">Notas recientes:</span> {notasRecientes.length === 0 ? '—' : notasRecientes.map(n => n.contenido).join(' · ')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
        <Button variant="ghost" onClick={() => onNavigate('reservar')}><CalendarPlus size={16} /> Reservar</Button>
        <Button variant="ghost" onClick={() => onNavigate('economica')}><Wallet size={16} /> Crear bono</Button>
        <Button variant="ghost" onClick={() => onNavigate('economica')}><Plus size={16} /> Registrar pago</Button>
        <Button variant="ghost" onClick={() => onNavigate('historial')}><MessageSquare size={16} /> Enviar mensaje</Button>
        <Button variant="ghost" onClick={() => onNavigate('historial')}><AlertTriangle size={16} /> Crear incidencia</Button>
        <Button variant="ghost" onClick={() => onNavigate('historial')}><StickyNote size={16} /> Añadir nota</Button>
      </div>
    </Card>
  );
};
