import React, { useState } from 'react';
import { Clock, UserCheck, UserX, FileCheck, LucideIcon } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useApp } from '../../../context/AppContext';
import { getAsistencia } from '../../../shared/lib/reservationLabels';
import { Reservation, AsistenciaEstado, AsistenciaCanal } from '../../../types';

interface AsistenciaModalProps {
  reservation: Reservation;
  canal: AsistenciaCanal;
  open: boolean;
  onClose: () => void;
}

const OPCIONES: { estado: AsistenciaEstado; label: string; icon: LucideIcon }[] = [
  { estado: 'pendiente', label: 'Pendiente', icon: Clock },
  { estado: 'asistio', label: 'Asistió', icon: UserCheck },
  { estado: 'no_asistio', label: 'No asistió', icon: UserX },
  { estado: 'justificada', label: 'Justificada', icon: FileCheck },
];

/**
 * Modal de "Confirmar asistencia" (Sprint 23) — selector de los 4 estados,
 * libremente asignable en cualquier momento (no es una secuencia
 * obligatoria). Recibe una Reservation cruda y el canal desde el que se
 * abre (Agenda día/semana o Ficha del cliente), igual que ReprogramarModal
 * y ConsumirBonoManualModal, para reutilizar una única implementación en
 * los tres puntos de entrada sin duplicar interfaz.
 */
export const AsistenciaModal: React.FC<AsistenciaModalProps> = ({ reservation, canal, open, onClose }) => {
  const { marcarAsistencia } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const actual = getAsistencia(reservation);

  const handleSelect = (estado: AsistenciaEstado) => {
    const result = marcarAsistencia(reservation.id, estado, canal);
    if (!result.success) {
      setError(result.message ?? 'No se pudo actualizar la asistencia.');
      return;
    }
    setError(null);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Confirmar asistencia · ${reservation.userName}`} maxWidthClassName="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Sesión del <span className="text-white font-medium">{reservation.date}</span> a las <span className="text-white font-medium">{reservation.startTime}</span>.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {OPCIONES.map(({ estado, label, icon: Icon }) => (
            <button
              key={estado}
              type="button"
              onClick={() => handleSelect(estado)}
              className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg text-sm font-bold border transition-all ${
                actual === estado
                  ? 'bg-misportBlue text-white border-misportBlue'
                  : 'bg-gray-900/40 text-gray-300 border-gray-800 hover:border-gray-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
        {saved && <p className="text-green-400 text-sm font-bold">Asistencia actualizada ✓</p>}
      </div>
    </Modal>
  );
};
