export const toISODate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Returns the Monday (00:00) of the week containing `d`. */
export const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDays = (d: Date, n: number): Date => {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
};
