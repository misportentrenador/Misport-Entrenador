import { LocalStorageRepository } from '../../../core/data/localStorageRepository';
import { seedIfEmpty } from '../../../core/data/seedIfEmpty';
import { STORAGE_KEYS } from '../../../config/storageKeys';
import {
  RolPersona, PerfilDeportivo, PerfilSanitario, InfoComercial, BonoCliente,
  Incidencia, Mensaje, NotaPersona, PersonaEvento, RelacionPersona,
} from '../types';
import {
  ROL_PERSONA_SEED, PERFIL_DEPORTIVO_SEED, PERFIL_SANITARIO_SEED, INFO_COMERCIAL_SEED, BONO_CLIENTE_SEED,
  INCIDENCIA_SEED, MENSAJE_SEED, NOTA_PERSONA_SEED, PERSONA_EVENTO_SEED, RELACION_PERSONA_SEED,
} from './seed';

seedIfEmpty(STORAGE_KEYS.crmRoles, ROL_PERSONA_SEED);
seedIfEmpty(STORAGE_KEYS.crmPerfilesDeportivos, PERFIL_DEPORTIVO_SEED);
seedIfEmpty(STORAGE_KEYS.crmPerfilesSanitarios, PERFIL_SANITARIO_SEED);
seedIfEmpty(STORAGE_KEYS.crmInfoComercial, INFO_COMERCIAL_SEED);
seedIfEmpty(STORAGE_KEYS.crmBonosCliente, BONO_CLIENTE_SEED);
seedIfEmpty(STORAGE_KEYS.crmIncidencias, INCIDENCIA_SEED);
seedIfEmpty(STORAGE_KEYS.crmMensajes, MENSAJE_SEED);
seedIfEmpty(STORAGE_KEYS.crmNotas, NOTA_PERSONA_SEED);
seedIfEmpty(STORAGE_KEYS.crmEventos, PERSONA_EVENTO_SEED);
seedIfEmpty(STORAGE_KEYS.crmRelaciones, RELACION_PERSONA_SEED);

// Un Repository<T> por entidad — mismo patrón que Catálogo (Sprint 2) y
// Datos Maestros (Sprint 3), swappable por Supabase sin tocar CRMContext.
export const rolPersonaRepo = new LocalStorageRepository<RolPersona>(STORAGE_KEYS.crmRoles);
export const perfilDeportivoRepo = new LocalStorageRepository<PerfilDeportivo>(STORAGE_KEYS.crmPerfilesDeportivos);
export const perfilSanitarioRepo = new LocalStorageRepository<PerfilSanitario>(STORAGE_KEYS.crmPerfilesSanitarios);
export const infoComercialRepo = new LocalStorageRepository<InfoComercial>(STORAGE_KEYS.crmInfoComercial);
export const bonoClienteRepo = new LocalStorageRepository<BonoCliente>(STORAGE_KEYS.crmBonosCliente);
export const incidenciaRepo = new LocalStorageRepository<Incidencia>(STORAGE_KEYS.crmIncidencias);
export const mensajeRepo = new LocalStorageRepository<Mensaje>(STORAGE_KEYS.crmMensajes);
export const notaPersonaRepo = new LocalStorageRepository<NotaPersona>(STORAGE_KEYS.crmNotas);
export const personaEventoRepo = new LocalStorageRepository<PersonaEvento>(STORAGE_KEYS.crmEventos);
export const relacionPersonaRepo = new LocalStorageRepository<RelacionPersona>(STORAGE_KEYS.crmRelaciones);
