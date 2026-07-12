import { Entity, Timestamps } from '../../core/types';

/**
 * Master Data — a single domain with four entities that share structure,
 * patterns, components, repositories and state management.
 *
 * Persona and Organización are deliberately neutral: no "cliente",
 * "entrenador", "participante" or any other business-specific field lives
 * here. Assigning a role to a Persona (a client of a service, a Trail
 * Evolution runner, an ACTIVA+50 participant, MISPORT's own staff) is the
 * responsibility of whichever future module owns that concept — it
 * references `personaId` from its own entity instead of this domain
 * growing a new field per module. This is what lets Master Data serve any
 * future module without ever needing to change its model.
 */

/**
 * The base identity of any individual MISPORT relates to, in any capacity.
 * Deliberately decoupled from Identity's `User`: a Persona can exist before
 * anyone ever registers a login (a company's employee added by an admin, a
 * walk-in), and `userId` links the two only once/if a real account exists.
 */
export interface Persona extends Entity, Timestamps {
  name: string;
  email: string;
  phone: string;
  docId: string;
  userId: string | null;
  notes: string;
  isActive: boolean;
}

export type OrganizacionTipo = 'empresa' | 'institucion' | 'ong' | 'administracion_publica' | 'otro';

/** Any legal entity MISPORT relates to: a company, an institution, an NGO, a public body. */
export interface Organizacion extends Entity, Timestamps {
  name: string;
  tipo: OrganizacionTipo;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
}

/**
 * The relationship between a Persona and an Organización — nothing more.
 * A Persona can have zero, one or several Contactos (never duplicated as a
 * new Persona record per organización). Deliberately has no "role" field:
 * *why* the relationship exists (employee, client, corredor...) belongs to
 * the module that cares about that distinction, referencing `personaId`
 * (and optionally this `Contacto`'s id) from its own entity.
 */
export interface Contacto extends Entity, Timestamps {
  personaId: string;
  organizacionId: string;
  notes: string;
  isActive: boolean;
}

/**
 * A physical resource at a center (equipment, a room). Moved here from
 * Catálogo in Sprint 3 — see design note on consolidating it into the
 * Master Data domain instead of duplicating it.
 */
export interface Recurso extends Entity, Timestamps {
  name: string;
  category: string;
  centerId: string;
  isActive: boolean;
}
