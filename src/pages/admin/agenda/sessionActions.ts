import { LucideIcon, CheckCircle2, XCircle, IdCard, Wallet, StickyNote } from 'lucide-react';
import { AgendaSession } from './AgendaSession';

/**
 * Registro declarativo de acciones rápidas de una sesión (Sprint 15) — una
 * tarjeta de sesión no tiene botones hardcodeados, renderiza las entradas
 * de esta lista cuya `isAvailable` sea true. Añadir una acción futura es
 * añadir una entrada aquí — no requiere tocar SessionCard, DayView ni
 * WeekView.
 *
 * Claves reservadas para Sprints futuros (no implementadas: dependen de
 * lógica de negocio o integraciones que todavía no existen):
 * 'consumir_bono' | 'whatsapp' | 'crear_incidencia' | 'reprogramar' |
 * 'confirmar_asistencia' | 'nueva_reserva'.
 */
export interface SessionAction {
  key: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'danger' | 'ghost';
  isAvailable: (session: AgendaSession) => boolean;
  onSelect: (session: AgendaSession) => void;
}

interface BuildSessionActionsArgs {
  onComplete: (session: AgendaSession) => void;
  onCancel: (session: AgendaSession) => void;
  onViewFicha: (session: AgendaSession) => void;
  onRegistrarPago: (session: AgendaSession) => void;
  onAnadirNota: (session: AgendaSession) => void;
}

export function buildSessionActions({ onComplete, onCancel, onViewFicha, onRegistrarPago, onAnadirNota }: BuildSessionActionsArgs): SessionAction[] {
  return [
    {
      key: 'completar',
      label: 'Marcar completada',
      icon: CheckCircle2,
      variant: 'primary',
      isAvailable: (s) => s.origin === 'misport' && s.reservation.status === 'CONFIRMED',
      onSelect: onComplete,
    },
    {
      key: 'cancelar',
      label: 'Cancelar',
      icon: XCircle,
      variant: 'danger',
      isAvailable: (s) => s.origin === 'misport' && s.reservation.status === 'CONFIRMED',
      onSelect: onCancel,
    },
    {
      key: 'ver_ficha',
      label: 'Ver ficha',
      icon: IdCard,
      variant: 'ghost',
      isAvailable: (s) => !!s.reservation.personaId,
      onSelect: onViewFicha,
    },
    {
      key: 'registrar_pago',
      label: 'Registrar pago',
      icon: Wallet,
      variant: 'ghost',
      isAvailable: (s) => !!s.reservation.personaId,
      onSelect: onRegistrarPago,
    },
    {
      key: 'anadir_nota',
      label: 'Añadir nota',
      icon: StickyNote,
      variant: 'ghost',
      isAvailable: (s) => !!s.reservation.personaId,
      onSelect: onAnadirNota,
    },
  ];
}
