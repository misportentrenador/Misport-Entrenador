import React, { useState } from 'react';
import { Ticket } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useCatalog } from '../../../modules/catalog/context/CatalogContext';
import { useConsumirBonoManual } from '../../../hooks/useConsumirBonoManual';
import { Reservation } from '../../../types';

interface ConsumirBonoManualModalProps {
  reservation: Reservation;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Consumir bono" (Sprint 22) — regulariza una reserva COMPLETED
 * con bonoStatus 'pending_regularization', dejando elegir entre los bonos
 * de la Persona compatibles con el servicio de la reserva (mismo criterio
 * que el consumo automático). Reservation cruda, no AgendaSession, para
 * poder montarse tanto desde la Agenda (día y semana) como desde el
 * Historial de la Ficha sin duplicar la interfaz.
 */
export const ConsumirBonoManualModal: React.FC<ConsumirBonoManualModalProps> = ({ reservation, open, onClose }) => {
  const { bonos } = useCatalog();
  const { getBonosCompatibles, handleConsumirBono } = useConsumirBonoManual();
  const [selectedBonoId, setSelectedBonoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const compatibles = getBonosCompatibles(reservation);

  const handleConfirm = async () => {
    if (!selectedBonoId) return;
    const result = await handleConsumirBono(reservation, selectedBonoId);
    if (!result.success) {
      setError(result.message ?? 'No se pudo regularizar la reserva.');
      return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Consumir bono · ${reservation.userName}`} maxWidthClassName="max-w-lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Sesión del <span className="text-white font-medium">{reservation.date}</span> a las <span className="text-white font-medium">{reservation.startTime}</span>, pendiente de regularizar por falta de saldo en su momento.
        </p>

        {compatibles.length === 0 ? (
          <p className="text-sm text-gray-500">Esta persona no tiene ningún bono compatible con saldo para este servicio. Da de alta o recarga un bono desde su Ficha y vuelve a intentarlo.</p>
        ) : (
          <div className="space-y-2">
            {compatibles.map(b => {
              const producto = bonos.items.find(p => p.id === b.bonoId);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBonoId(b.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedBonoId === b.id
                      ? 'bg-misportBlue/10 border-misportBlue'
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className="text-white font-medium">{producto?.name ?? b.bonoId}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.sessionsRemaining} sesiones restantes{b.expiryDate ? ` · Caduca: ${b.expiryDate.slice(0, 10)}` : ''}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

        {compatibles.length > 0 && (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
            <Button onClick={handleConfirm} disabled={!selectedBonoId}>
              <Ticket size={16} /> Consumir bono
            </Button>
            {saved && <span className="text-green-400 text-sm font-bold">Reserva regularizada ✓</span>}
          </div>
        )}
      </div>
    </Modal>
  );
};
