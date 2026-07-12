import { LocalStorageRepository } from '../../../core/data/localStorageRepository';
import { STORAGE_KEYS } from '../../../config/storageKeys';
import { Center, Trainer, Service, Rate, Bono, Recurso } from '../types';
import { CENTER_SEED, TRAINER_SEED, SERVICE_SEED, RATE_SEED, BONO_SEED, RECURSO_SEED } from './seed';

/**
 * Seeds a localStorage key the first time it's found empty. Runs once at
 * module load (ES modules are evaluated exactly once and cached) — not
 * inside a React effect, so it can't race with itself the way a
 * check-then-write inside a double-invoked effect (React StrictMode) would.
 */
function seedIfEmpty<T>(key: string, seed: T[]): void {
  if (seed.length === 0) return;
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(seed));
  }
}

seedIfEmpty(STORAGE_KEYS.catalogCenters, CENTER_SEED);
seedIfEmpty(STORAGE_KEYS.catalogTrainers, TRAINER_SEED);
seedIfEmpty(STORAGE_KEYS.catalogServices, SERVICE_SEED);
seedIfEmpty(STORAGE_KEYS.catalogRates, RATE_SEED);
seedIfEmpty(STORAGE_KEYS.catalogBonos, BONO_SEED);
seedIfEmpty(STORAGE_KEYS.catalogRecursos, RECURSO_SEED);

// One Repository<T> per entity — the first real use of the FASE 1
// persistence pattern. Swapping any of these for a Supabase-backed
// implementation later does not require touching CatalogContext.
export const centersRepo = new LocalStorageRepository<Center>(STORAGE_KEYS.catalogCenters);
export const trainersRepo = new LocalStorageRepository<Trainer>(STORAGE_KEYS.catalogTrainers);
export const servicesRepo = new LocalStorageRepository<Service>(STORAGE_KEYS.catalogServices);
export const ratesRepo = new LocalStorageRepository<Rate>(STORAGE_KEYS.catalogRates);
export const bonosRepo = new LocalStorageRepository<Bono>(STORAGE_KEYS.catalogBonos);
export const recursosRepo = new LocalStorageRepository<Recurso>(STORAGE_KEYS.catalogRecursos);
