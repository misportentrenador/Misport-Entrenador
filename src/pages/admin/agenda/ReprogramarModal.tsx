import React, { useState, useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useApp } from '../../../context/AppContext';
import { computeTimeSlots } from '../../../shared/lib/scheduling';
import { Reservation } from '../../../types';

interface ReprogramarModalProps {
  reservation: Reservation;
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de "Reprogramar reserva" (Sprint 21) — recibe una Reservation cruda,
 * no un AgendaSession, para poder montarse tanto desde la Agenda (día y
 * semana, vía SessionCard) como desde el Historial de la Ficha CRM sin
 * duplicar la interfaz. Usa el mismo computeTimeSlots que el Booking
 * Wizard y el mismo getOccupancy para no tener una segunda fuente de
 * disponibilidad.
 */
export const ReprogramarModal: React.FC<ReprogramarModalProps> = ({ reservation, open, onClose }) => {
  const { scheduleRules, trainingTypes, getOccupancy, reprogramarReserva } = useApp();
  const [fecha, setFecha] = useState(reservation.date);
  const [hora, setHora] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const service = trainingTypes.find(s => s.id === reservation.serviceId);
  const durationMinutes = service?.durationMinutes ?? 60;

  const timeSlots = useMemo(() => {
    return computeTimeSlots(scheduleRules, reservation.centerId, reservation.serviceId, reservation.trainerId || null, fecha, durationMinutes);
  }, [scheduleRules, reservation.centerId, reservation.serviceId, reservation.trainerId, fecha, durationMinutes]);

  if (!open) return null;

  const handleFechaChange = (value: string) => {
    setFecha(value);
    setHora(null);
    setError(null);
  };

  const handleConfirm = () => {
    if (!hora) return;
    const [h, m] = hora.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(h, m + durationMinutes);
    const nuevoFin = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    const result = reprogramarReserva(reservation.id, fecha, hora, nuevoFin);
    if (!result.success) {
        setError(result.message ?? 'No se pudo reprogramar la reserva.');
        return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Reprogramar reserva · ${reservation.userName}`} maxWidthClassName="max-w-2xl">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Horario actual</p>
          <p className="text-white font-medium mt-1">{reservation.date} · {reservation.startTime} - {reservation.endTime}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva fecha</label>
          <input
            type="date"
            value={fecha}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleFechaChange(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-misportBlue focus:border-transparent focus:outline-none text-white font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Nueva hora</label>
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {timeSlots.map(time => {
                const isCurrentSlot = fecha === reservation.date && time === reservation.startTime;
                const occupancy = getOccupancy(reservation.centerId, reservation.serviceId, reservation.trainerId ?? null, fecha, time);
                const capacity = service?.capacity ?? 1;
                const isFull = !isCurrentSlot && occupancy >= capacity;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isFull && setHora(time)}
                    disabled={isFull}
                    className={`py-2.5 px-2 rounded-lg text-sm font-bold transition-all border flex flex-col items-center justify-center ${
                      hora === time
                        ? 'bg-misportBlue text-white border-misportBlue'
                        : isFull
                          ? 'bg-gray-800 text-gray-600 border-gray-800 cursor-not-allowed opacity-60'
                          : 'bg-gray-900 text-gray-300 border-gray-700 hover:border-misportBlue'
                    }`}
                  >
                    <span>{time}</span>
                    <span className={`text-[10px] mt-0.5 font-normal ${isFull ? 'text-red-500' : 'text-gray-500'}`}>
                      {isFull ? 'COMPLETO' : `(${occupancy}/${capacity})`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay horarios disponibles para esta fecha.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

        <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
          <Button onClick={handleConfirm} disabled={!hora}>
            <CalendarClock size={16} /> Confirmar reprogramación
          </Button>
          {saved && <span className="text-green-400 text-sm font-bold">Reserva reprogramada ✓</span>}
        </div>
      </div>
    </Modal>
  );
};
