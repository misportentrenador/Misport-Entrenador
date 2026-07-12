import { Entity, Timestamps } from '../../core/types';

/**
 * Catálogo Maestro — single source of truth for Centros, Entrenadores,
 * Servicios, Tarifas, Bonos y Recursos. Base entities only: no redemption
 * logic for Bonos, no scheduling logic for Recursos — that is deliberately
 * out of scope for this module (see Sprint 2 design).
 */

export interface Center extends Entity, Timestamps {
  name: string;
  address: string;
  description: string;
  isActive: boolean;
}

export interface Trainer extends Entity, Timestamps {
  name: string;
  centerIds: string[];
  serviceIds: string[];
  isActive: boolean;
}

export interface Service extends Entity, Timestamps {
  name: string;
  description: string;
  durationMinutes: number;
  capacity: number;
  requiresTrainer: boolean;
  isActive: boolean;
}

/**
 * A priced variant of a service (e.g. "1 día/semana" for entrenamiento
 * grupal). `null` for services with a single, unvaried price.
 */
export type RateVariant = string | null;

/**
 * `effectiveFrom` makes rates versionable by date instead of overwriting a
 * single "current price" — the gap flagged in the FASE 1 architecture
 * review. Nothing computes historical prices from this yet (that's a
 * future Finance concern); the module just stores the date honestly.
 */
export interface Rate extends Entity, Timestamps {
  serviceId: string;
  variant: RateVariant;
  price: number;
  trainerPay: number;
  centerPay: number;
  effectiveFrom: string; // ISO date
}

export interface Bono extends Entity, Timestamps {
  name: string;
  serviceId: string;
  sessionsIncluded: number;
  price: number;
  validityDays: number | null;
  isActive: boolean;
}

export interface Recurso extends Entity, Timestamps {
  name: string;
  category: string;
  centerId: string;
  isActive: boolean;
}
