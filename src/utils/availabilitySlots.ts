import type { DayKey, WorkingHours } from '../types/workingHours.types';
import type { SpecialClosure } from '../types/specialClosure.types';

const DAY_KEY_BY_JS_INDEX: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

export function dayKeyForDate(date: Date): DayKey {
  return DAY_KEY_BY_JS_INDEX[date.getDay()];
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Generates raw slot start-times (HH:mm) for one calendar date, from the
 * salon's default recurring workingHours doc only. Does NOT know about
 * specialClosures — use generateAvailableSlots() below for the real
 * customer-facing / owner-facing grid.
 */
export function generateBaseSlotGrid(date: Date, workingHours: WorkingHours): string[] {
  const dayKey = dayKeyForDate(date);
  const day = workingHours[dayKey];
  if (day.isClosed) return [];

  const openMin = timeToMinutes(day.openTime);
  const closeMin = timeToMinutes(day.closeTime);
  const lunchStartMin = timeToMinutes(workingHours.lunchBreak.start);
  const lunchEndMin = timeToMinutes(workingHours.lunchBreak.end);
  const interval = workingHours.slotIntervalMinutes;

  const slots: string[] = [];
  for (let t = openMin; t + interval <= closeMin; t += interval) {
    const slotEnd = t + interval;
    const overlapsLunch = t < lunchEndMin && slotEnd > lunchStartMin;
    if (overlapsLunch) continue;
    slots.push(minutesToTime(t));
  }
  return slots;
}

/**
 * Resolution order (per spec):
 *  1. specialClosures for the date
 *     - full_day    -> no slots at all
 *     - partial_day -> default grid, minus slots overlapping [startTime,endTime)
 *  2. else -> default recurring weekly working hours (generateBaseSlotGrid)
 *
 * `closure` should be null when no specialClosures doc exists for the date.
 * Caller still intersects the result against slotLocks/blockedSlots same
 * as before — this function only resolves the *default* bookable grid.
 */
export function generateAvailableSlots(
  date: Date,
  workingHours: WorkingHours,
  closure: SpecialClosure | null
): string[] {
  if (closure?.type === 'full_day') return [];

  const base = generateBaseSlotGrid(date, workingHours);

  if (closure?.type === 'partial_day' && closure.startTime && closure.endTime) {
    const closureStart = timeToMinutes(closure.startTime);
    const closureEnd = timeToMinutes(closure.endTime);
    const interval = workingHours.slotIntervalMinutes;

    return base.filter((slot) => {
      const start = timeToMinutes(slot);
      const end = start + interval;
      const overlapsClosure = start < closureEnd && end > closureStart;
      return !overlapsClosure;
    });
  }

  return base;
}

/**
 * Closure-aware version of the single-slot working-hours check, for
 * pre-validating a specific booking request client-side (server mirror
 * lives in functions/src/utils/workingHoursValidation.server.ts).
 */
export function isWithinWorkingHours(
  date: Date,
  time: string,
  durationMins: number,
  workingHours: WorkingHours,
  closure: SpecialClosure | null
): boolean {
  if (closure?.type === 'full_day') return false;

  const dayKey = dayKeyForDate(date);
  const day = workingHours[dayKey];
  if (day.isClosed) return false;

  const openMin = timeToMinutes(day.openTime);
  const closeMin = timeToMinutes(day.closeTime);
  const lunchStartMin = timeToMinutes(workingHours.lunchBreak.start);
  const lunchEndMin = timeToMinutes(workingHours.lunchBreak.end);

  const start = timeToMinutes(time);
  const end = start + durationMins;

  if (start < openMin || end > closeMin) return false;
  if (start < lunchEndMin && end > lunchStartMin) return false;

  if (closure?.type === 'partial_day' && closure.startTime && closure.endTime) {
    const closureStart = timeToMinutes(closure.startTime);
    const closureEnd = timeToMinutes(closure.endTime);
    if (start < closureEnd && end > closureStart) return false;
  }

  return true;
}
