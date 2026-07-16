import React, { useState } from 'react';
import { CalendarClock, Plus, Ticket, UserCheck } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { usePersonaTimeline } from '../../hooks/usePersonaTimeline';
import { MensajeCanal, MensajeDireccion } from '../../types';
import { Reservation } from '../../../../types';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Spinner } from '../../../../components/ui/Spinner';
import { ReprogramarModal } from '../../../../pages/admin/agenda/ReprogramarModal';
import { ConsumirBonoManualModal } from '../../../../pages/admin/agenda/ConsumirBonoManualModal';
import { AsistenciaModal } from '../../../../pages/admin/agenda/AsistenciaModal';

interface Props {
  personaId: string;
}

const emptyNotaForm = { contenido: '' };
const emptyIncidenciaForm = { tipo: '', descripcion: '' };
const emptyMensajeForm = { canal: 'whatsapp' as MensajeCanal, direccion: 'saliente' as MensajeDireccion, asunto: '', contenido: '' };

/**
 * Historial — el timeline combinado ahora vive en usePersonaTimeline
 * (Sprint 12), compartido con el buscador/filtros. Los pagos
 * (FinanceEntry) viven en la sección Económica (Sprint 10), no se repiten
 * aquí. Las tres altas (nota/incidencia/mensaje) viven aquí — es la única
 * pantalla que las crea, evitando duplicar el formulario en el dashboard.
 */
export const HistorialSection: React.FC<Props> = ({ personaId }) => {
  const { incidencias, mensajes, notas } = useCRM();
  const { items, loading } = usePersonaTimeline(personaId);

  const [notaForm, setNotaForm] = useState(emptyNotaForm);
  const [incidenciaForm, setIncidenciaForm] = useState(emptyIncidenciaForm);
  const [mensajeForm, setMensajeForm] = useState(emptyMensajeForm);
  const [reprogramando, setReprogramando] = useState<Reservation | null>(null);
  const [consumiendoBono, setConsumiendoBono] = useState<Reservation | null>(null);
  const [confirmandoAsistencia, setConfirmandoAsistencia] = useState<Reservation | null>(null);

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
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium">{item.label} <span className="text-gray-500 font-normal">· {item.date.slice(0, 10)}</span></p>
                  <p className="text-gray-400 text-sm truncate">{item.detail}</p>
                </div>
                {item.reservation?.status === 'CONFIRMED' && (
                  <Button variant="ghost" className="shrink-0 py-1.5 px-3 text-xs" onClick={() => setReprogramando(item.reservation!)}>
                    <CalendarClock size={14} /> Reprogramar
                  </Button>
                )}
                {item.reservation?.status === 'COMPLETED' && item.reservation?.bonoStatus === 'pending_regularization' && (
                  <Button variant="ghost" className="shrink-0 py-1.5 px-3 text-xs" onClick={() => setConsumiendoBono(item.reservation!)}>
                    <Ticket size={14} /> Consumir bono
                  </Button>
                )}
                {item.reservation && item.reservation.status !== 'CANCELLED' && (
                  <Button variant="ghost" className="shrink-0 py-1.5 px-3 text-xs" onClick={() => setConfirmandoAsistencia(item.reservation!)}>
                    <UserCheck size={14} /> Confirmar asistencia
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {reprogramando && (
        <ReprogramarModal reservation={reprogramando} open onClose={() => setReprogramando(null)} />
      )}
      {consumiendoBono && (
        <ConsumirBonoManualModal reservation={consumiendoBono} open onClose={() => setConsumiendoBono(null)} />
      )}
      {confirmandoAsistencia && (
        <AsistenciaModal reservation={confirmandoAsistencia} canal="ficha_cliente" open onClose={() => setConfirmandoAsistencia(null)} />
      )}
    </div>
  );
};
