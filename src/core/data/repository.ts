/**
 * Storage-agnostic persistence contract. Async by design even though today's
 * only implementation (LocalStorageRepository) resolves synchronously —
 * so a future HttpRepository can be dropped in without changing call sites.
 */
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(id: string): Promise<void>;
}
