import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useCompleteReservation } from '../../../hooks/useCompleteReservation';
import { AgendaSession } from './AgendaSession';
import { buildSessionActions } from './sessionActions';

interface UseSessionActionsArgs {
  onOpenRegistrarPago: (session: AgendaSession) => void;
  onOpenAnadirNota: (session: AgendaSession) => void;
  onOpenCrearIncidencia: (session: AgendaSession) => void;
}

/** Conecta el registro declarativo de acciones con la lógica real ya existente. */
export function useSessionActions({ onOpenRegistrarPago, onOpenAnadirNota, onOpenCrearIncidencia }: UseSessionActionsArgs) {
  const { cancelReservation } = useApp();
  const { handleComplete, completingIds } = useCompleteReservation();
  const navigate = useNavigate();

  const actions = buildSessionActions({
    onComplete: (session) => handleComplete(session.reservation),
    onCancel: (session) => {
      if (window.confirm('¿Seguro que quieres cancelar esta reserva? Esta acción no se puede deshacer.')) {
        cancelReservation(session.reservation.id);
      }
    },
    onViewFicha: (session) => {
      if (session.reservation.personaId) navigate(`/admin/crm/personas/${session.reservation.personaId}`);
    },
    onRegistrarPago: onOpenRegistrarPago,
    onAnadirNota: onOpenAnadirNota,
    onCrearIncidencia: onOpenCrearIncidencia,
  });

  return { actions, completingIds };
}
