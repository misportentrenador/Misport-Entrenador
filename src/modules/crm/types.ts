import { Entity, Timestamps } from '../../core/types';

/**
 * CRM — capa satélite sobre Persona (Datos Maestros). Ninguna entidad de
 * este módulo sustituye o duplica Persona/Organización/Contacto; todas la
 * referencian por personaId. Ver el documento de diseño "CRM Definitivo"
 * (Release 0.3) para la justificación de cada entidad.
 */

export type RolTipo =
  | 'cliente_particular'
  | 'cliente_ems'
  | 'cliente_funcional'
  | 'cliente_trail'
  | 'cliente_empresa'
  | 'activa50'
  | 'entrenador'
  | 'empleado'
  | 'proveedor'
  | 'colaborador'
  | 'contacto_comercial';

/** Una persona puede tener varios roles a la vez — nunca una entidad distinta por rol. */
export interface RolPersona extends Entity, Timestamps {
  personaId: string;
  tipo: RolTipo;
  isActive: boolean;
  fechaAlta: string;
  fechaBaja: string | null;
}

export interface PerfilDeportivo extends Entity, Timestamps {
  personaId: string;
  objetivos: string;
  nivel: string;
  experienciaAnios: number | null;
  /** Ids de Service (Catálogo) — nunca texto libre duplicando el catálogo. */
  modalidades: string[];
  lesiones: string;
  patologias: string;
  limitaciones: string;
  pesoKg: number | null;
  alturaCm: number | null;
  composicionCorporal: string;
  frecuenciaSemanal: number | null;
  disponibilidad: string;
  preferenciasHorarias: string;
}

/**
 * Estructura preparada, sin datos sensibles reales todavía (instrucción
 * explícita de negocio). Aislada en su propia entidad para poder aplicarle
 * en el futuro un permiso de acceso distinto al resto de la ficha.
 */
export interface PerfilSanitario extends Entity, Timestamps {
  personaId: string;
  contraindicacionesEMS: string;
  consentimientos: string;
  documentacionFirmada: string[];
  informes: string[];
  alergias: string;
  medicacion: string;
  observacionesMedicas: string;
}

export type EstadoComercial = 'lead' | 'contactado' | 'propuesta' | 'cliente' | 'perdido';

export interface InfoComercial extends Entity, Timestamps {
  personaId: string;
  origen: string;
  campana: string;
  referencia: string;
  estadoComercial: EstadoComercial;
  probabilidad: number | null;
  ultimoContacto: string | null;
  proximaAccion: string;
  proximaAccionFecha: string | null;
  /** personaId de quien hace seguimiento comercial — nunca un texto libre. */
  responsableComercial: string | null;
  notas: string;
}

export type BonoClienteStatus = 'active' | 'consumed' | 'expired' | 'cancelled';

/**
 * La compra/activación real de un Bono (producto, Catálogo) por una
 * Persona. Bono (Catálogo) sigue siendo el producto; esto es la instancia.
 * El consumo automático de sesiones queda fuera de alcance de este Sprint
 * (mismo criterio que Catálogo dejó Bonos sin lógica de consumo en el
 * Sprint 2) — se prepara la entidad, no se conecta todavía.
 */
export interface BonoCliente extends Entity, Timestamps {
  personaId: string;
  bonoId: string;
  sessionsRemaining: number;
  purchaseDate: string;
  expiryDate: string | null;
  status: BonoClienteStatus;
}

export type IncidenciaEstado = 'abierta' | 'resuelta';

export interface Incidencia extends Entity, Timestamps {
  personaId: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  estado: IncidenciaEstado;
  resolucion: string | null;
}

export type MensajeCanal = 'whatsapp' | 'email' | 'telefono' | 'presencial' | 'otro';
export type MensajeDireccion = 'saliente' | 'entrante';

/** Registro interno de que una comunicación ocurrió — no envía nada todavía. */
export interface Mensaje extends Entity, Timestamps {
  personaId: string;
  canal: MensajeCanal;
  direccion: MensajeDireccion;
  asunto: string;
  contenido: string;
  fecha: string;
  autorUserId: string | null;
}

/**
 * Notas cronológicas múltiples — el sistema definitivo de notas (decisión 4
 * del diseño CRM, Release 0.3). `Persona.notes` se mantiene únicamente por
 * compatibilidad temporal durante la migración y debe eliminarse cuando el
 * CRM quede consolidado.
 */
export interface NotaPersona extends Entity, Timestamps {
  personaId: string;
  contenido: string;
  fecha: string;
  autorUserId: string | null;
}

/**
 * Timeline de "cambios importantes": append-only, se alimenta desde otras
 * acciones del CRM (rol asignado, bono creado, incidencia abierta...);
 * nadie lo edita a mano.
 */
export interface PersonaEvento extends Entity, Timestamps {
  personaId: string;
  tipo: string;
  descripcion: string;
  fecha: string;
}

export type RelacionTipo = 'familiar' | 'entrenador_asignado' | 'otro';

/** Relación Persona ↔ Persona (familia, entrenador asignado...). */
export interface RelacionPersona extends Entity, Timestamps {
  personaAId: string;
  personaBId: string;
  tipo: RelacionTipo;
  notas: string;
}
