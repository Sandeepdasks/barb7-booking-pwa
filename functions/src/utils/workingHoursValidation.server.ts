/**
 * Server-side mirror of src/utils/availabilitySlots.ts#isWithinWorkingHours.
 * Duplicated (not imported) because functions/ ships as a separate bundle
 * from the client app — see note in the original Milestone-2 delivery.
 *
 * Wire this into the booking-creation Cloud Function's time-window check.
 * Fetch BOTH docs server-side before validating a booking request:
 *   - workingHours/{salonId}
 *   - specialClosures/{salonId}_{date}   (may not exist -> pass null)
 */

interface DaySchedule {
  isClosed: boolean;
  openTime: string;
  closeTime: string;
}

interface LunchBreak {
  start: string;
  end: string;
}

interface WorkingHoursDoc {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  lunchBreak: LunchBreak;
  slotIntervalMinutes: number;
}

type DayKey = keyof Pick<
  WorkingHoursDoc,
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
>;

interface SpecialClosureDoc {
  type: 'full_day' | 'partial_day';
  startTime: string | null;
  endTime: string | null;
}

const DAY_KEY_BY_JS_INDEX: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * `istDate` must already be resolved to IST (Asia/Kolkata) before calling,
 * same as the rest of the booking function's server-time logic.
 */
export function isWithinWorkingHours(
  istDate: Date,
  time: string,
  durationMins: number,
  workingHours: WorkingHoursDoc,
  closure: SpecialClosureDoc | null
): boolean {
  if (closure?.type === 'full_day') return false;

  const dayKey = DAY_KEY_BY_JS_INDEX[istDate.getDay()];
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
