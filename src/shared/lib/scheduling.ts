import { ScheduleRule } from '../../types';

/**
 * Genera las franjas horarias candidatas de un centro/servicio/entrenador
 * en una fecha dada, a partir de las ScheduleRule aplicables — extraído
 * del Booking Wizard (Sprint 21) para que el modal de "Reprogramar" use
 * exactamente el mismo cálculo, sin una segunda fuente de horarios.
 * Pura: no depende de ocupación (eso lo resuelve getOccupancy aparte).
 */
export function computeTimeSlots(
  scheduleRules: ScheduleRule[],
  centerId: string,
  serviceId: string,
  trainerId: string | null,
  dateISO: string,
  durationMinutes: number
): string[] {
  if (!dateISO || !centerId || !serviceId) return [];

  const date = new Date(dateISO);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...

  const applicableRules = scheduleRules.filter(rule => {
    const matchCenter = rule.centerId === centerId;
    const matchType = rule.serviceId === serviceId;
    const matchTrainer = trainerId ? rule.trainerId === trainerId : !rule.trainerId;
    const matchDay = rule.daysOfWeek.includes(dayOfWeek);
    return matchCenter && matchType && matchTrainer && matchDay;
  });

  const slots: string[] = [];

  applicableRules.forEach(rule => {
    rule.ranges.forEach(range => {
      const [startH, startM] = range.start.split(':').map(Number);
      const [endH, endM] = range.end.split(':').map(Number);

      let currentMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      while (currentMin + durationMinutes <= endMin) {
        const h = Math.floor(currentMin / 60);
        const m = currentMin % 60;
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        if (!slots.includes(timeString)) {
          slots.push(timeString);
        }
        currentMin += durationMinutes;
      }
    });
  });

  return slots.sort();
}
