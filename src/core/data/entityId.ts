/**
 * Generates an id for a new entity, prefixed for readability in devtools
 * (e.g. "per_..." for Persona, "ctr_..." for Center). Shared by
 * useEntityCollection and any code that builds a new entity envelope
 * directly against a Repository<T> without going through that hook
 * (e.g. AppContext creating a Persona from a different domain).
 */
export function createEntityId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
