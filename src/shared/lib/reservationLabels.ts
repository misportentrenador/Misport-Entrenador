import { Reservation } from '../../types';
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
