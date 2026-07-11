/** Full precision — used wherever an exact monetary amount is shown (Finanzas). */
export const formatEUR = (n: number): string =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

/** Rounded to whole euros — used in compact KPI displays (dashboards). */
export const formatEURCompact = (n: number): string =>
  n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
