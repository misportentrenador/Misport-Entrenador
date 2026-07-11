/**
 * Every localStorage key MISPORT OS uses, named once. Existing values are
 * unchanged (same strings as before) — this only removes the risk of a
 * typo'd literal silently creating a second, disconnected copy of the data.
 */
export const STORAGE_KEYS = {
  session: 'misport_session',
  reservations: 'misport_reservations',
  registeredUsers: 'misport_db_users',
  financeParams: 'misport_finance_params',
  financeEntries: 'misport_finance_entries',
} as const;
