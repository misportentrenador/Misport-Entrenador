import { UserRole } from '../../types';

/**
 * Actions that exist today, inferred from the current route guards.
 * This is intentionally not a granular business permission model —
 * Cowork hasn't defined one — just a single place to express "who can do
 * what" instead of scattered `role === 'ADMIN'` checks.
 *
 * IMPORTANT: this is a client-side UI gate only (it decides what renders),
 * not access control. Nothing stops a modified client from ignoring it —
 * real enforcement has to live server-side once a backend exists (see the
 * architecture doc, "Candidatos a backend" / Identity). Do not rely on
 * `can()` to protect sensitive data or actions.
 */
export type Action = 'admin:access' | 'booking:manage-own';

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  ADMIN: ['admin:access', 'booking:manage-own'],
  CLIENT: ['booking:manage-own'],
};

export function can(role: UserRole | undefined | null, action: Action): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}
