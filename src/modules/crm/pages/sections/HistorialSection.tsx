import React, { useMemo, useState } from 'react';
import { CalendarClock, AlertTriangle, MessageSquare, StickyNote, Activity, Plus } from 'lucide-react';
import { useApp } from '../../../../context/AppContext';
import { useCRM } from '../../context/CRMContext';
import { MensajeCanal, MensajeDireccion } from '../../types';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
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

const emptyNotaForm = { contenido: '' };
const emptyIncidenciaForm = { tipo: '', descripcion: '' };
const emptyMensajeForm = { canal: 'whatsapp' as MensajeCanal, direccion: 'saliente' as MensajeDireccion, asunto: '', contenido: '' };

/**
 * Historial — combinación en memoria de varias fuentes. Se formalizará
 * como el hook compartido usePersonaTimeline en el Sprint 11; aquí se
 * construye inline para no adelantar ese Sprint. Los pagos (FinanceEntry)
 * viven en la sección Económica (Sprint 10), no se repiten aquí.
 * Las tres altas (nota/incidencia/mensaje) viven aquí — es la única
 * pantalla que las crea, evitando duplicar el formulario en el dashboard.
 */
export const HistorialSection: React.FC<Props> = ({ personaId }) => {
  const { reservations, centers } = useApp();
  const { incidencias, mensajes, notas, eventos } = useCRM();

  const [notaForm, setNotaForm] = useState(emptyNotaForm);
  const [incidenciaForm, setIncidenciaForm] = useState(emptyIncidenciaForm);
  const [mensajeForm, setMensajeForm] = useState(emptyMensajeForm);

  const loading = incidencias.loading || mensajes.loading || notas.loading || eventos.loading;

  const items = useMemo<TimelineItem[]>(() => {
    const list: TimelineItem[] = [];

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

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notaForm.contenido.trim()) return;
    await notas.create({ personaId, contenido: notaForm.contenido, fecha: new Date().toISOString(), autorUserId: null });
    setNotaForm(emptyNotaForm);
  };

  const handleAddIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenciaForm.descripcion.trim()) return;
    await incidencias.create({ personaId, tipo: incidenciaForm.tipo || 'otro', descripcion: incidenciaForm.descripcion, fecha: new Date().toISOString(), estado: 'abierta', resolucion: null });
    setIncidenciaForm(emptyIncidenciaForm);
  };

  const handleAddMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensajeForm.asunto.trim()) return;
    await mensajes.create({ personaId, canal: mensajeForm.canal, direccion: mensajeForm.direccion, asunto: mensajeForm.asunto, contenido: mensajeForm.contenido, fecha: new Date().toISOString(), autorUserId: null });
    setMensajeForm(emptyMensajeForm);
  };

  if (loading) return <div className="p-12 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Añadir al historial</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <form onSubmit={handleAddNota} className="space-y-2 p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
            <p className="text-xs font-bold text-gray-500 uppercase">Nota</p>
            <Input value={notaForm.contenido} onChange={e => setNotaForm({ contenido: e.target.value })} placeholder="Escribe una nota..." />
            <Button type="submit" variant="ghost" className="w-full"><Plus size={14} /> Añadir nota</Button>
          </form>

          <form onSubmit={handleAddIncidencia} className="space-y-2 p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
            <p className="text-xs font-bold text-gray-500 uppercase">Incidencia</p>
            <Input value={incidenciaForm.tipo} onChange={e => setIncidenciaForm(f => ({ ...f, tipo: e.target.value }))} placeholder="Tipo (opcional)" />
            <Input value={incidenciaForm.descripcion} onChange={e => setIncidenciaForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Descripción" />
            <Button type="submit" variant="ghost" className="w-full"><Plus size={14} /> Registrar incidencia</Button>
          </form>

          <form onSubmit={handleAddMensaje} className="space-y-2 p-3 bg-gray-900/40 border border-gray-800 rounded-lg">
            <p className="text-xs font-bold text-gray-500 uppercase">Mensaje</p>
            <Select value={mensajeForm.canal} onChange={e => setMensajeForm(f => ({ ...f, canal: e.target.value as MensajeCanal }))}>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="telefono">Teléfono</option>
              <option value="presencial">Presencial</option>
              <option value="otro">Otro</option>
            </Select>
            <Input value={mensajeForm.asunto} onChange={e => setMensajeForm(f => ({ ...f, asunto: e.target.value }))} placeholder="Asunto" />
            <Button type="submit" variant="ghost" className="w-full"><Plus size={14} /> Registrar mensaje</Button>
          </form>
        </div>
        <p className="text-xs text-gray-600 mt-3">"Enviar mensaje" registra que la comunicación ocurrió — no envía nada real todavía (integración futura, ver diseño del CRM).</p>
      </Card>

      <Card className="p-5">
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
    </div>
  );
};
