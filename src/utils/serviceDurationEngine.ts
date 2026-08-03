import { Service } from "../types/salon";
import { toMinutes, toTimeStr } from "./slotGenerator";

// This file is the pluggable engine for "Future Service Duration Architecture"
// (Phase spec item 2). It is NOT wired into BookingPage's visual grid yet:
// in the current UI, service selection happens inside the Confirm-Your-Booking
// modal, AFTER the customer already picked a time slot — reordering that is
// out of scope for this phase ("keep the visual slot list" / "do not replace
// the booking flow already implemented"). These functions are the ready-to-call
// building blocks for whichever phase flips that order (service-first) or adds
// post-selection server-side validation.

// Sums each selected service's own duration. If the owner later defines an
// explicit combo service (e.g. "Hair + Beard" = 45 min as ONE priced service),
// that's just another Service the customer picks instead of two — this sum is
// only the fallback for independently combining standalone services.
export function getTotalDurationMinutes(selectedServices: Service[]): number {
  return selectedServices.reduce((total, s) => total + s.durationMinutes, 0);
}

// Given an appointment starting at `startTime24` running `totalDurationMinutes`,
// returns every base-interval slot start time it occupies internally.
// Example: start "18:00", duration 120, interval 30
//   -> ["18:00", "18:30", "19:00", "19:30"]
// This is "the booking engine reserves all required consecutive slots
// internally" — the customer still only ever picks the single start time.
export function computeOccupiedSlots(
  startTime24: string,
  totalDurationMinutes: number,
  slotIntervalMinutes: number
): string[] {
  const startMinutes = toMinutes(startTime24);
  const slots: string[] = [];
  for (
    let t = startMinutes;
    t < startMinutes + totalDurationMinutes;
    t += slotIntervalMinutes
  ) {
    slots.push(toTimeStr(t));
  }
  return slots;
}

// Whether a candidate start time has enough uninterrupted room for the full
// service duration: the run must finish by the session's close, and none of
// its occupied slots may already be taken. `takenSlots` is deliberately a
// plain string set (not a Firestore query) so this stays swappable — pass
// booked/blocked slot times here once appointments/blockedSlots are wired.
export function isConsecutiveRunAvailable(
  startTime24: string,
  totalDurationMinutes: number,
  slotIntervalMinutes: number,
  sessionEndTime24: string,
  takenSlots: ReadonlySet<string> = new Set()
): boolean {
  const required = computeOccupiedSlots(startTime24, totalDurationMinutes, slotIntervalMinutes);
  const sessionEndMinutes = toMinutes(sessionEndTime24);
  const lastSlotStart = toMinutes(required[required.length - 1]);
  const lastSlotEnd = lastSlotStart + slotIntervalMinutes;

  if (lastSlotEnd > sessionEndMinutes) return false; // wouldn't finish before close
  return required.every((slot) => !takenSlots.has(slot));
}

// Filters a list of candidate start times (e.g. from generateSlotsForSession)
// down to only those with enough room for the given service duration. This is
// the single entry point a future service-first UI or owner-dashboard preview
// would call — everything above is a building block for this.
export function filterStartTimesForDuration(
  candidateStartTimes: string[],
  totalDurationMinutes: number,
  slotIntervalMinutes: number,
  sessionEndTime24: string,
  takenSlots: ReadonlySet<string> = new Set()
): string[] {
  return candidateStartTimes.filter((start) =>
    isConsecutiveRunAvailable(
      start,
      totalDurationMinutes,
      slotIntervalMinutes,
      sessionEndTime24,
      takenSlots
    )
  );
}