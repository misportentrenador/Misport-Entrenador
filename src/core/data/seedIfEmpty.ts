/**
 * Seeds a localStorage key the first time it's found empty. Runs once at
 * module load (ES modules are evaluated exactly once and cached) — not
 * inside a React effect, so it can't race with itself the way a
 * check-then-write inside a double-invoked effect (React StrictMode) would.
 * Shared by every module's data/repositories.ts (Catálogo, Master Data, ...).
 */
export function seedIfEmpty<T>(key: string, seed: T[]): void {
  if (seed.length === 0) return;
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, JSON.stringify(seed));
  }
}
