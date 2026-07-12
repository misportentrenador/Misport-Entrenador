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
  catalogCenters: 'misport_catalog_centers',
  catalogTrainers: 'misport_catalog_trainers',
  catalogServices: 'misport_catalog_services',
  catalogRates: 'misport_catalog_rates',
  catalogBonos: 'misport_catalog_bonos',
  masterDataPersonas: 'misport_masterdata_personas',
  masterDataOrganizaciones: 'misport_masterdata_organizaciones',
  masterDataContactos: 'misport_masterdata_contactos',
  masterDataRecursos: 'misport_masterdata_recursos',
} as const;
