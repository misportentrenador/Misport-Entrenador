import { LocalStorageRepository } from '../../../core/data/localStorageRepository';
import { seedIfEmpty } from '../../../core/data/seedIfEmpty';
import { STORAGE_KEYS } from '../../../config/storageKeys';
import { Persona, Organizacion, Contacto, Recurso } from '../types';
import { PERSONA_SEED, ORGANIZACION_SEED, CONTACTO_SEED, RECURSO_SEED } from './seed';

seedIfEmpty(STORAGE_KEYS.masterDataPersonas, PERSONA_SEED);
seedIfEmpty(STORAGE_KEYS.masterDataOrganizaciones, ORGANIZACION_SEED);
seedIfEmpty(STORAGE_KEYS.masterDataContactos, CONTACTO_SEED);
seedIfEmpty(STORAGE_KEYS.masterDataRecursos, RECURSO_SEED);

// Same Repository<T> pattern as Catálogo (Sprint 2) — one per entity,
// swappable for a Supabase-backed implementation without touching
// MasterDataContext or any of the four tabs.
export const personasRepo = new LocalStorageRepository<Persona>(STORAGE_KEYS.masterDataPersonas);
export const organizacionesRepo = new LocalStorageRepository<Organizacion>(STORAGE_KEYS.masterDataOrganizaciones);
export const contactosRepo = new LocalStorageRepository<Contacto>(STORAGE_KEYS.masterDataContactos);
export const recursosRepo = new LocalStorageRepository<Recurso>(STORAGE_KEYS.masterDataRecursos);
