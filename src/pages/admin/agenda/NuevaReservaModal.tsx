import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { BookingWizard } from '../../../components/BookingWizard';
import { AgendaSession } from './AgendaSession';

interface NuevaReservaModalProps {
  session: AgendaSession;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Nueva reserva" desde la Agenda (Sprint 18) — renderiza el
 * mismo BookingWizard que ya usa la Ficha CRM (Sprint 10), con
 * onBehalfOfPersonaId, para reservar otra sesión al mismo cliente sin
 * salir de la Agenda. Mismo motor de reservas, ninguna lógica nueva.
 */
export const NuevaReservaModal: React.FC<NuevaReservaModalProps> = ({ session, open, onClose }) => {
  // SessionCard solo monta este modal para sesiones origin === 'misport' con personaId.
  const r = session.reservation!;

  return (
    <Modal open={open} onClose={onClose} title={`Nueva reserva · ${r.userName}`} maxWidthClassName="max-w-3xl">
      <BookingWizard onBehalfOfPersonaId={r.personaId} />
    </Modal>
  );
};
