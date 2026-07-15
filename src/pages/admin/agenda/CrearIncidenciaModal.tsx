import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { AgendaSession } from './AgendaSession';

interface CrearIncidenciaModalProps {
  session: AgendaSession;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Crear incidencia" desde la Agenda (Sprint 17) — llama a
 * useCRM().incidencias.create, la misma función que ya usa la Ficha CRM
 * (HistorialSection, Sprint 9/10). Mismo patrón que AnadirNotaModal
 * (Sprint 16).
 */
export const CrearIncidenciaModal: React.FC<CrearIncidenciaModalProps> = ({ session, open, onClose }) => {
  const { incidencias } = useCRM();
  // SessionCard solo monta este modal para sesiones origin === 'misport', que siempre tienen reservation.
  const r = session.reservation!;
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim() || !r.personaId) return;
    await incidencias.create({ personaId: r.personaId, tipo: tipo || 'otro', descripcion, fecha: new Date().toISOString(), estado: 'abierta', resolucion: null });
    setTipo('');
    setDescripcion('');
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Crear incidencia · ${r.userName}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Tipo (opcional)" />
        <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" autoFocus />
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit"><AlertTriangle size={16} /> Crear incidencia</Button>
          {saved && <span className="text-green-400 text-sm font-bold">Incidencia creada ✓</span>}
        </div>
      </form>
    </Modal>
  );
};
