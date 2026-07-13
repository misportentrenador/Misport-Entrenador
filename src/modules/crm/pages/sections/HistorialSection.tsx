import React, { useMemo } from 'react';
import { CalendarClock, AlertTriangle, MessageSquare, StickyNote, Activity } from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import { useCRM } from '../../context/CRMContext';
import { Card } from '../../../../components/ui/Card';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Spinner } from '../../../../components/ui/Spinner';

interface Props {
  personaId: string;
}

type TimelineItem = {
  key: string;
  date: string;
  icon: React.ElementType;
  label: string;
  detail: string;
};

/**
 * Historial — combinación en memoria de varias fuentes, solo lectura en
 * este Sprint. Se formalizará como el hook compartido usePersonaTimeline en
 * el Sprint 11; aquí se construye inline para no adelantar ese Sprint.
 * Los pagos (FinanceEntry) no aparecen todavía — dependen de la decisión 3
 * (Sprint 10).
 */
export const HistorialSection: React.FC<Props> = ({ personaId }) => {
  const { reservations, centers } = useApp();
  const { incidencias, mensajes, notas, eventos } = useCRM();

  const loading = incidencias.loading || mensajes.loading || notas.loading || eventos.loading;

  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

    reservations.filter(r => r.personaId === personaId).forEach(r => {
      const center = centers.find(c => c.id === r.centerId);
      list.push({
        key: `res_${r.id}`,
        date: r.date,
        icon: CalendarClock,
        label: r.status === 'COMPLETED' ? 'Sesión completada' : r.status === 'CANCELLED' ? 'Reserva cancelada' : 'Reserva confirmada',
        detail: `${center?.name ?? '—'} · ${r.startTime}`,
      });
    });

    incidencias.items.filter(i => i.personaId === personaId).forEach(i => {
      list.push({ key: `inc_${i.id}`, date: i.fecha, icon: AlertTriangle, label: 'Incidencia', detail: i.descripcion });
    });

    mensajes.items.filter(m => m.personaId === personaId).forEach(m => {
      list.push({ key: `msg_${m.id}`, date: m.fecha, icon: MessageSquare, label: `Mensaje (${m.canal})`, detail: m.asunto });
    });

    notas.items.filter(n => n.personaId === personaId).forEach(n => {
      list.push({ key: `nota_${n.id}`, date: n.fecha, icon: StickyNote, label: 'Nota', detail: n.contenido });
    });

    eventos.items.filter(e => e.personaId === personaId).forEach(e => {
      list.push({ key: `evt_${e.id}`, date: e.fecha, icon: Activity, label: e.tipo, detail: e.descripcion });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [reservations, centers, incidencias.items, mensajes.items, notas.items, eventos.items, personaId]);

  if (loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <Card className="p-5">
      <p className="text-xs text-gray-500 mb-4">Pagos: pendiente de la decisión 3 (Sprint 10) para vincularse aquí.</p>
      {items.length === 0 ? (
        <EmptyState icon={CalendarClock} message="Sin actividad registrada todavía." />
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.key} className="flex items-start gap-3 p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
              <item.icon size={16} className="text-misportBlue mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{item.label} <span className="text-gray-500 font-normal">· {item.date.slice(0, 10)}</span></p>
                <p className="text-gray-400 text-sm truncate">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
