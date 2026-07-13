import { RolTipo, EstadoComercial, BonoClienteStatus, IncidenciaEstado } from '../types';

/** Etiquetas en español para los enumerados del CRM — un solo lugar para no repetir el texto en cada componente. */
export const ROL_LABELS: Record<RolTipo, string> = {
  cliente_particular: 'Cliente particular',
  cliente_ems: 'Cliente EMS',
  cliente_funcional: 'Cliente funcional',
  cliente_trail: 'Cliente Trail Running',
  cliente_empresa: 'Cliente Empresa',
  activa50: 'Participante ACTIVA+50',
  entrenador: 'Entrenador',
  empleado: 'Empleado',
  proveedor: 'Proveedor',
  colaborador: 'Colaborador',
  contacto_comercial: 'Contacto comercial',
};

export const ESTADO_COMERCIAL_LABELS: Record<EstadoComercial, string> = {
  lead: 'Lead',
  contactado: 'Contactado',
  propuesta: 'Propuesta',
  cliente: 'Cliente',
  perdido: 'Perdido',
};

export const BONO_CLIENTE_STATUS_LABELS: Record<BonoClienteStatus, string> = {
  active: 'Activo',
  consumed: 'Consumido',
  expired: 'Caducado',
  cancelled: 'Cancelado',
};

export const INCIDENCIA_ESTADO_LABELS: Record<IncidenciaEstado, string> = {
  abierta: 'Abierta',
  resuelta: 'Resuelta',
};
