import { useMemo } from 'react';
import { CalendarClock, AlertTriangle, MessageSquare, StickyNote, Activity } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useCRM } from '../context/CRMContext';

export interface PersonaTimelineItem {
  key: string;
  date: string;
  icon: React.ElementType;
  label: string;
  detail: string;
}

/**
 * Combinación cronológica en memoria de Reservas + Incidencias + Mensajes +
 * Notas + Eventos de una Persona (Sprint 12 — formaliza como hook
 * compartido lo que HistorialSection construía inline desde el Sprint 9).
 * Los pagos (FinanceEntry) viven en la sección Económica, no se repiten
 * aquí. No persiste nada — es una vista calculada.
 */
export function usePersonaTimeline(personaId: string) {
  const { reservations, centers } = useApp();
  const { incidencias, mensajes, notas, eventos } = useCRM();

  const loading = incidencias.loading || mensajes.loading || notas.loading || eventos.loading;

  const items = useMemo<PersonaTimelineItem[]>(() => {
    const list: PersonaTimelineItem[] = [];

    reservations.filter(r => r.personaId === personaId).forEach(r => {
      const center = centers.find(c => c.id === r.centerId);
      const completedLabel = r.bonoStatus === 'pending_regularization' ? 'Sesión completada (pendiente de regularizar)' : 'Sesión completada';
      list.push({
        key: `res_${r.id}`,
        date: r.date,
        icon: CalendarClock,
        label: r.status === 'COMPLETED' ? completedLabel : r.status === 'CANCELLED' ? 'Reserva cancelada' : 'Reserva confirmada',
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

  return { items, loading };
}
