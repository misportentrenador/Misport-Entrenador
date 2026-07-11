/**
 * Base, business-agnostic types shared by every future module.
 * Existing domain types (User, Reservation, FinanceEntry...) are not
 * migrated to these yet — this file only makes the shapes available.
 */

/** Anything persisted has an id. */
export interface Entity {
  id: string;
}

/**
 * Optional creation/update bookkeeping for persisted entities.
 * ISO 8601 strings (not epoch numbers) so this maps directly onto a
 * Postgres/Supabase `timestamptz` column with no conversion step.
 */
export interface Timestamps {
  createdAt: string;
  updatedAt?: string;
}

/**
 * Uniform outcome shape for an operation that can *expectedly* fail
 * (validation, a business rule, a lookup that finds nothing) — the caller
 * checks `.success` and handles both branches, nothing is thrown.
 *
 * This is the standard going forward: new services should return a
 * `Result<T, E>` instead of inventing their own ad hoc shape (the
 * `{ success, message }` objects `login`/`register` return today predate
 * this and are intentionally left as-is — see FASE 1 review).
 *
 * `AppError` (core/errors/AppError.ts) is for the opposite case: an
 * *unexpected* failure that is thrown/caught (a bug, a network error) and
 * surfaces via a try/catch or the ErrorBoundary. Result and AppError are
 * complementary, not alternatives for the same problem.
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T, E = string>(data: T): Result<T, E> {
  return { success: true, data };
}

export function fail<T = never, E = string>(error: E): Result<T, E> {
  return { success: false, error };
}
