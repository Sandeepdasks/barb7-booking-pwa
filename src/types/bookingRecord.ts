import { toIstEpochMs } from "../utils/dateUtils";

// CONFLICT NOTE (status enum):
// 01-Requirements.md / 02-Features.md / 03-Database.md freeze the enum as
//   confirmed | completed | cancelled | blocked | no_show
// This phase's spec asks for
//   confirmed | cancelled_by_customer | cancelled_by_owner | completed
// Reconciled as a SUPERSET: `cancelled` is split into the two attributed
// variants (the spec needs to know WHO cancelled, to route notifications),
// while `blocked` and `no_show` are retained because the owner/admin app
// still needs them and dropping them would break the frozen schema.
// Update 03-Database.md to match before the owner app is built.
export type BookingStatus =
  | "confirmed"
  | "cancelled_by_customer"
  | "cancelled_by_owner"
  | "completed"
  | "blocked"
  | "no_show";

export const CANCELLED_STATUSES: BookingStatus[] = [
  "cancelled_by_customer",
  "cancelled_by_owner",
];

// A booking is "active" in the STATUS sense only — pure enum check, used
// where only status matters (e.g. Firestore availability queries already
// filter `where status == "confirmed"` server-side). This does NOT mean the
// booking belongs in the Upcoming tab — see isUpcomingBooking below for that.
export function isActiveStatus(status: BookingStatus): boolean {
  return status === "confirmed";
}

export interface BookedService {
  serviceId: string;
  serviceName: string;
  durationMinutes: number; // snapshotted at booking time — later owner edits
                           // to service config never alter existing bookings
                           // (per 01-Requirements.md duration-snapshot rule)
}

export interface Booking {
  bookingId: string; // Firestore doc ID
  salonId: string;
  salonName: string;
  customerId: string; // Firebase uid — required; every booking is authenticated
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  services: BookedService[];
  totalDurationMinutes: number;
  appointmentDate: string; // YYYY-MM-DD (IST)
  appointmentTime: string; // HH:mm 24h (IST) — start
  appointmentEndTime: string; // HH:mm 24h (IST) — start + totalDurationMinutes
  status: BookingStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  cancelledAt?: string | null;
}

// THE My Bookings tab classifier. A `confirmed` booking whose end time has
// already passed still belongs in Past — status alone (isActiveStatus) is
// necessary but not sufficient. Comparison is against absolute epoch time via
// toIstEpochMs, so this is correct regardless of the viewer's device
// timezone and stays correct across refreshes (no stored "is upcoming" flag
// to go stale — it's recomputed from appointmentDate/appointmentEndTime +
// current time every render).
export function isUpcomingBooking(booking: Booking, nowMs: number = Date.now()): boolean {
  if (!isActiveStatus(booking.status)) return false;
  return toIstEpochMs(booking.appointmentDate, booking.appointmentEndTime) > nowMs;
}