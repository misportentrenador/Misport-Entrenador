export type ErrorSeverity = 'info' | 'warning' | 'error';

export class AppError extends Error {
  readonly severity: ErrorSeverity;
  readonly cause?: unknown;

  constructor(message: string, options?: { severity?: ErrorSeverity; cause?: unknown }) {
    super(message);
    this.name = 'AppError';
    this.severity = options?.severity ?? 'error';
    this.cause = options?.cause;
  }
}

/** Normalizes any thrown value into an AppError, for consistent handling. */
export function toAppError(error: unknown, fallbackMessage = 'Ha ocurrido un error inesperado.'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(error.message || fallbackMessage, { cause: error });
  return new AppError(fallbackMessage, { cause: error });
}
