import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Badge } from '../../../components/ui/Badge';
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_TONE } from '../../../shared/lib/reservationLabels';
import { AgendaSession } from './AgendaSession';
import { useSessionActions } from './useSessionActions';
import { RegistrarPagoModal } from './RegistrarPagoModal';
import { AnadirNotaModal } from './AnadirNotaModal';

interface SessionCardProps {
  session: AgendaSession;
  compact?: boolean;
}

type ActiveModal = 'registrar_pago' | 'anadir_nota' | null;

export const SessionCard: React.FC<SessionCardProps> = ({ session, compact }) => {
  const { centers, trainers } = useApp();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const { actions, completingIds } = useSessionActions({
    onOpenRegistrarPago: () => setActiveModal('registrar_pago'),
    onOpenAnadirNota: () => setActiveModal('anadir_nota'),
  });
  const r = session.reservation;
  const center = centers.find(c => c.id === r.centerId);
  const trainer = trainers.find(t => t.id === r.trainerId);
  const availableActions = actions.filter(a => a.isAvailable(session));

  return (
    <div className={`rounded-lg border ${r.status === 'COMPLETED' ? 'bg-blue-900/10 border-blue-900/30' : 'bg-gray-900/60 border-gray-800'} ${compact ? 'p-2.5' : 'p-3.5'}`}>
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex items-center gap-1.5 text-xs text-misportOrange font-bold">
          <Clock size={12} /> {r.startTime} - {r.endTime}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge tone={RESERVATION_STATUS_TONE[r.status]}>{RESERVATION_STATUS_LABEL[r.status]}</Badge>
          {r.bonoStatus === 'pending_regularization' && <Badge tone="danger">Pendiente de regularizar</Badge>}
        </div>
      </div>
      <p className="text-white text-sm font-medium mt-1 truncate">{center?.name ?? '—'}</p>
      <p className="text-xs text-gray-500 truncate">{trainer?.name ?? 'Sin entrenador'} · {r.userName}</p>

      {availableActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-gray-800/70">
          {availableActions.map(action => (
            <button
              key={action.key}
              onClick={() => action.onSelect(session)}
              disabled={action.key === 'completar' && completingIds.has(r.id)}
              className={`flex items-center gap-1 text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                action.variant === 'primary' ? 'text-misportBlue hover:text-blue-400' :
                action.variant === 'danger' ? 'text-red-400 hover:text-red-300' :
                'text-gray-400 hover:text-white'
              }`}
            >
              <action.icon size={12} /> {action.label}
            </button>
          ))}
        </div>
      )}

      <RegistrarPagoModal session={session} open={activeModal === 'registrar_pago'} onClose={() => setActiveModal(null)} />
      <AnadirNotaModal session={session} open={activeModal === 'anadir_nota'} onClose={() => setActiveModal(null)} />
    </div>
  );
};
