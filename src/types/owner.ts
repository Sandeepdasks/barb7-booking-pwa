// BARB7 Owner App — domain types
// Mirrors 03-Database.md schema + frozen architecture decisions:
// - status enum keeps cancelled split by actor (cancelled_by_customer / cancelled_by_owner)
// - "blocked" is NOT an appointment status; the 'owner_blocked' subset of `slotLocks` is the
//   sole source of truth for blocked time (see SlotLock below; collection confirmed 2026-08-08)
// - collection name is `appointments` (not `bookings` — PRD v1.0 used "bookings", superseded by Database.md)

export type AppointmentStatus =
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_owner'
  | 'no_show';

export const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = ['confirmed', 'in_progress'];

// Statuses that belong on the operational Owner Schedule calendar. Cancelled appointments
// (by either actor) are excluded — they stay in Firestore for history/reporting, but never
// render as a schedule event. (2026-08-08 fix — Owner Schedule previously showed everything.)
export const OPERATIONAL_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'confirmed',
  'in_progress',
  'completed',
  'no_show',
];

export type BookingSource = 'online' | 'walk-in' | 'phone' | 'whatsapp' | 'manual';

export const BOOKING_SOURCE_LABEL: Record<BookingSource, string> = {
  online: 'Customer App',
  'walk-in': 'Owner Added',
  phone: 'Owner Added',
  whatsapp: 'Owner Added',
  manual: 'Owner Added',
};

export interface Appointment {
  appointmentId: string; // deterministic: {salonId}_{date}_{time}
  salonId: string;
  customerId: string | null;
  guestId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail?: string | null;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD, IST
  time: string; // HH:mm, IST 24h
  endTime: string; // HH:mm, IST 24h — derived from time + durationMins
  durationMins: number; // snapshotted at creation
  status: AppointmentStatus;
  bookingSource: BookingSource;
  createdBy: string;
  createdAt: unknown; // Firestore Timestamp
  cancelledAt?: unknown | null;
  cancelledBy?: string | null;
}

// A single 15-min sub-slot lock — the shared collision-protection unit used by BOTH customer
// bookings (via the customer Cloud Function, not in this codebase) and owner-side writes here.
// `type` distinguishes a normal booking's occupancy from an explicit owner block; the Owner
// Schedule UI must only ever render `type === 'owner_blocked'` docs as "Owner Blocked" — every
// other type still occupies the slot but is never rendered from this collection (the matching
// `appointments` doc is what renders it). (2026-08-08: renamed from BlockedSlot/`blockedSlots`
// to SlotLock/`slotLocks` — confirmed as the real shared collision-guard collection.)
export type SlotLockType = 'appointment' | 'owner_blocked';

export interface SlotLock {
  lockId: string; // {salonId}_{date}_{time} — one doc per 15-min increment
  salonId: string;
  date: string;
  time: string;
  durationMins: number; // always 15, atomic unit
  type: SlotLockType;
  sourceAppointmentId: string | null; // groups sub-locks belonging to the same appointment/block
  reason?: string | null;
  createdBy: string;
  createdAt: unknown;
}

// A merged run of contiguous, `type === 'owner_blocked'` SlotLock sub-docs, collapsed into one
// visual calendar event. This is what the UI renders and what Release / Add-Booking-on-blocked-
// time operate on. Never built from `type === 'appointment'` locks (see SlotLock doc comment).
export interface BlockedEventGroup {
  sourceAppointmentId: string | null;
  salonId: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMins: number;
  reason: string | null;
  lockIds: string[]; // every sub-doc id in this group, in time order
}

export interface WorkingHoursDay {
  start: string; // HH:mm
  end: string; // HH:mm
  closed: boolean;
}

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WorkingHours {
  salonId: string;
  monday: WorkingHoursDay;
  tuesday: WorkingHoursDay;
  wednesday: WorkingHoursDay;
  thursday: WorkingHoursDay;
  friday: WorkingHoursDay;
  saturday: WorkingHoursDay;
  sunday: WorkingHoursDay;
  breakStart: string; // HH:mm
  breakEnd: string; // HH:mm
  updatedAt: unknown;
}

export interface SpecialClosure {
  closureId: string;
  salonId: string;
  date: string; // YYYY-MM-DD
  label: string;
  allDay: boolean;
  startTime?: string | null; // required if !allDay
  endTime?: string | null;
  createdAt: unknown;
}

export interface Service {
  serviceId: string;
  name: string;
  durationMins: number;
  icon?: string;
  active: boolean;
}

export interface OwnerProfile {
  uid: string;
  role: 'owner';
  salonId: string;
  name: string;
  email: string;
  authProviders: string[];
}

export interface DashboardStats {
  bookingsToday: number;
  pending: number;
  inProgress: number;
  completed: number;
}

// A positioned event for the Google-Calendar-style day grid. Purely a client-side render
// model derived from Appointment / BlockedEventGroup / working hours — not a new persisted
// representation (no 4th Firestore collection; see integration notes).
export type ScheduleRenderEvent =
  | { kind: 'appointment'; startTime: string; endTime: string; durationMins: number; appointment: Appointment }
  | { kind: 'blocked'; startTime: string; endTime: string; durationMins: number; group: BlockedEventGroup }
  | { kind: 'lunch'; startTime: string; endTime: string; durationMins: number };
