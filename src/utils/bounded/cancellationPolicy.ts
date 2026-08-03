import { Booking } from "../../types/bookingRecord";
import { toMinutes } from "../slotGenerator";

// CONFLICT NOTE (cancellation window):
// 01-Requirements.md / 02-Features.md specify a configurable window defaulting
// to 60 minutes (settings.cancellationWindowMinutes). This phase's spec asks
// for a strict 2 hours. Implemented as 120 here, but kept as a single named
// constant + injectable parameter so the owner-configurable `settings` doc can
// override it without touching call sites. Update 01-Requirements.md's stated
// default to 120 (or wire the settings read) to close the gap.
export const DEFAULT_CANCELLATION_WINDOW_MINUTES = 120;

export interface CancellationEligibility {
  canCancel: boolean;
  reason?: string;
}

// NOTE: evaluated against the client device clock. 02-Features.md requires
// this check to run server-side against IST — enforce it again in Firestore
// Rules / a Cloud Function before production. This client check is UX only.
export function getCancellationEligibility(
  booking: Booking,
  now: Date = new Date(),
  windowMinutes: number = DEFAULT_CANCELLATION_WINDOW_MINUTES
): CancellationEligibility {
  if (booking.status !== "confirmed") {
    return { canCancel: false };
  }

  const [year, month, day] = booking.appointmentDate.split("-").map(Number);
  const startMinutes = toMinutes(booking.appointmentTime);
  const appointmentStart = new Date(
    year,
    month - 1,
    day,
    Math.floor(startMinutes / 60),
    startMinutes % 60,
    0,
    0
  );

  const minutesUntilStart = (appointmentStart.getTime() - now.getTime()) / 60000;

  if (minutesUntilStart < windowMinutes) {
    const hours = windowMinutes / 60;
    return {
      canCancel: false,
      reason: `Bookings can only be cancelled up to ${hours} hours before the appointment.`,
    };
  }

  return { canCancel: true };
}