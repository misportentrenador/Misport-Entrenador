import { LocalStorageRepository } from '../../../core/data/localStorageRepository';
import { seedIfEmpty } from '../../../core/data/seedIfEmpty';
import { STORAGE_KEYS } from '../../../config/storageKeys';
import { Center, Trainer, Service, Rate, Bono } from '../types';
import { CENTER_SEED, TRAINER_SEED, SERVICE_SEED, RATE_SEED, BONO_SEED } from './seed';

seedIfEmpty(STORAGE_KEYS.catalogCenters, CENTER_SEED);
seedIfEmpty(STORAGE_KEYS.catalogTrainers, TRAINER_SEED);
seedIfEmpty(STORAGE_KEYS.catalogServices, SERVICE_SEED);
seedIfEmpty(STORAGE_KEYS.catalogRates, RATE_SEED);
seedIfEmpty(STORAGE_KEYS.catalogBonos, BONO_SEED);

// One Repository<T> per entity — the first real use of the FASE 1
// persistence pattern. Swapping any of these for a Supabase-backed
// implementation later does not require touching CatalogContext.
export const centersRepo = new LocalStorageRepository<Center>(STORAGE_KEYS.catalogCenters);
export const trainersRepo = new LocalStorageRepository<Trainer>(STORAGE_KEYS.catalogTrainers);
export const servicesRepo = new LocalStorageRepository<Service>(STORAGE_KEYS.catalogServices);
export const ratesRepo = new LocalStorageRepository<Rate>(STORAGE_KEYS.catalogRates);
export const bonosRepo = new LocalStorageRepository<Bono>(STORAGE_KEYS.catalogBonos);
