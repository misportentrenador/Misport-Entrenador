import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useCRM } from '../../../modules/crm/context/CRMContext';
import { AgendaSession } from './AgendaSession';

interface AnadirNotaModalProps {
  session: AgendaSession;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Añadir nota" desde la Agenda (Sprint 16) — llama a
 * useCRM().notas.create, la misma función que ya usa la Ficha CRM
 * (HistorialSection, Sprint 9/10).
 */
export const AnadirNotaModal: React.FC<AnadirNotaModalProps> = ({ session, open, onClose }) => {
  const { notas } = useCRM();
  const r = session.reservation;
  const [contenido, setContenido] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim() || !r.personaId) return;
    await notas.create({ personaId: r.personaId, contenido, fecha: new Date().toISOString(), autorUserId: null });
    setContenido('');
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Añadir nota · ${r.userName}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribe una nota..." autoFocus />
        <div className="flex items-center gap-4 pt-2">
          <Button type="submit"><Plus size={16} /> Añadir nota</Button>
          {saved && <span className="text-green-400 text-sm font-bold">Nota añadida ✓</span>}
        </div>
      </form>
    </Modal>
  );
};
