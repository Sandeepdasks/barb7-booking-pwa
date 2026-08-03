import { Booking } from "../types/bookingRecord";
import { SessionWindow } from "../types/workingHours";
import { computeOccupiedSlots } from "./serviceDurationEngine";
import { generateSlotsForSession, toMinutes } from "./slotGenerator";

// Every base-grid slot time reserved by the given CONFIRMED bookings.
// Cancelled bookings are excluded upstream by the Firestore query, so they
// free their slots automatically.
export function getOccupiedSlots(
  bookings: Booking[],
  baseSlotIntervalMinutes: number
): Set<string> {
  const occupied = new Set<string>();
  bookings.forEach((b) => {
    computeOccupiedSlots(
      b.appointmentTime,
      b.totalDurationMinutes,
      baseSlotIntervalMinutes
    ).forEach((slot) => occupied.add(slot));
  });
  return occupied;
}

export interface AvailabilitySlot {
  time24: string;
  isPast: boolean;
  isBooked: boolean; // overlaps an existing confirmed booking
  isOverflow: boolean; // wouldn't finish before the session closes
}

export function isSlotSelectable(slot: AvailabilitySlot): boolean {
  return !slot.isPast && !slot.isBooked && !slot.isOverflow;
}

interface BuildSlotsArgs {
  session: SessionWindow;
  baseSlotIntervalMinutes: number;
  totalDurationMinutes: number; // sum of selected services; 0 = none selected yet
  occupiedSlots: ReadonlySet<string>;
  isToday: boolean;
  nowMinutes: number;
  blockedSlots?: ReadonlySet<string>; // future: owner-blocked slots / manual holds
}

// Duration-aware slot builder (Priority 5). A start time is only valid if the
// WHOLE appointment fits: every base slot it would occupy must be free, and
// the run must finish by the session's close time.
//
// Example: session ends 20:00, base interval 60, total duration 120.
//   18:00 -> occupies 18:00,19:00, ends 20:00  -> OK
//   19:00 -> occupies 19:00,20:00, ends 21:00  -> overflow, rejected
//
// Owner-editable service durations, owner-blocked slots, and manual
// reservations all flow through here without further changes: durations come
// from the caller's summed services, blocks come in via `blockedSlots`.
export function buildSessionSlots({
  session,
  baseSlotIntervalMinutes,
  totalDurationMinutes,
  occupiedSlots,
  isToday,
  nowMinutes,
  blockedSlots,
}: BuildSlotsArgs): AvailabilitySlot[] {
  const sessionEndMinutes = toMinutes(session.end);
  // Effective duration: before any service is picked, treat one base interval
  // as the minimum so the grid still renders sensibly.
  const duration = totalDurationMinutes > 0 ? totalDurationMinutes : baseSlotIntervalMinutes;

  return generateSlotsForSession(session, baseSlotIntervalMinutes).map((time24) => {
    const startMinutes = toMinutes(time24);
    const required = computeOccupiedSlots(time24, duration, baseSlotIntervalMinutes);

    const isBooked = required.some(
      (slot) => occupiedSlots.has(slot) || blockedSlots?.has(slot)
    );

    // The run must END by the session's close time. Per this phase's worked
    // example (closes 20:00, duration 120 -> 18:00 valid, 19:00 invalid),
    // session.end is CLOSING TIME, not the last bookable start.
    //
    // SIDE EFFECT / FLAG: generateSlotsForSession is inclusive of `end`, so
    // the final generated chip (e.g. 20:00) is now always overflow-blocked
    // for any duration. That is correct under the closing-time reading, but
    // it means mockWorkingHoursConfig's session `end` values should be read
    // as closing times — confirm with the owner before the owner dashboard
    // exposes them for editing.
    const isOverflow = startMinutes + duration > sessionEndMinutes;

    return {
      time24,
      isPast: isToday && startMinutes <= nowMinutes,
      isBooked,
      isOverflow,
    };
  });
}