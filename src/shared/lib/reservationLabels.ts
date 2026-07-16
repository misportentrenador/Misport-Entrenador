import { Reservation, AsistenciaEstado } from '../../types';
import { BadgeTone } from '../../components/ui/Badge';

export const RESERVATION_STATUS_LABEL: Record<Reservation['status'], string> = {
  CONFIRMED: 'ACTIVA',
  CANCELLED: 'CANCELADA',
  COMPLETED: 'COMPLETADA',
};

export const RESERVATION_STATUS_TONE: Record<Reservation['status'], BadgeTone> = {
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'info',
};

/**
 * Único punto de verdad sobre el valor por defecto de la asistencia
 * (Sprint 23): las reservas creadas antes de este Sprint no tienen el
 * campo `asistencia` en localStorage — su ausencia se trata como
 * 'pendiente' aquí, no en cada sitio que lo consulta.
 */
export function getAsistencia(r: Reservation): AsistenciaEstado {
  return r.asistencia ?? 'pendiente';
}

export const ASISTENCIA_ESTADO_LABEL: Record<AsistenciaEstado, string> = {
  pendiente: 'Pendiente',
  asistio: 'Asistió',
  no_asistio: 'No asistió',
  justificada: 'Justificada',
};

export const ASISTENCIA_ESTADO_TONE: Record<AsistenciaEstado, BadgeTone> = {
  pendiente: 'neutral',
  asistio: 'success',
  no_asistio: 'danger',
  justificada: 'info',
};
