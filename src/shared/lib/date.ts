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

/** Edad a partir de una fecha de nacimiento ISO — nunca se almacena, siempre se calcula. */
export const calculateAge = (birthDateISO: string): number => {
  const birth = new Date(birthDateISO);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
