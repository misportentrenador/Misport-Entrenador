/**
 * Every localStorage key MISPORT OS uses, named once. Existing values are
 * unchanged (same strings as before) — this only removes the risk of a
 * typo'd literal silently creating a second, disconnected copy of the data.
 */
export const STORAGE_KEYS = {
  session: 'misport_session',
  reservations: 'misport_reservations',
  reservationReschedules: 'misport_reservation_reschedules',
  bonoManualConsumptions: 'misport_bono_manual_consumptions',
  attendanceLogs: 'misport_attendance_logs',
  registeredUsers: 'misport_db_users',
  financeParams: 'misport_finance_params',
  agendaConfig: 'misport_agenda_config',
  financeEntries: 'misport_finance_entries',
  financeFacturas: 'misport_finance_facturas',
  financeCobros: 'misport_finance_cobros',
  fiscalConfig: 'misport_fiscal_config',
  catalogCenters: 'misport_catalog_centers',
  catalogTrainers: 'misport_catalog_trainers',
  catalogServices: 'misport_catalog_services',
  catalogRates: 'misport_catalog_rates',
  catalogBonos: 'misport_catalog_bonos',
  masterDataPersonas: 'misport_masterdata_personas',
  masterDataOrganizaciones: 'misport_masterdata_organizaciones',
  masterDataContactos: 'misport_masterdata_contactos',
  masterDataRecursos: 'misport_masterdata_recursos',
  crmRoles: 'misport_crm_roles',
  crmPerfilesDeportivos: 'misport_crm_perfiles_deportivos',
  crmPerfilesSanitarios: 'misport_crm_perfiles_sanitarios',
  crmInfoComercial: 'misport_crm_info_comercial',
  crmBonosCliente: 'misport_crm_bonos_cliente',
  crmIncidencias: 'misport_crm_incidencias',
  crmMensajes: 'misport_crm_mensajes',
  crmNotas: 'misport_crm_notas',
  crmEventos: 'misport_crm_eventos',
  crmRelaciones: 'misport_crm_relaciones',
} as const;
