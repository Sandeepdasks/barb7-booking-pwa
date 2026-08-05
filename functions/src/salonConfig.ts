// Mirrors src/services/mockSalonService.ts (services) and
// src/services/mockWorkingHoursConfig.ts (sessions) — this is the
// SERVER-AUTHORITATIVE copy used to validate every booking request; the
// client's copies are for UI display only and are never trusted here.
//
// FLAG: when the owner app can edit services/hours, this hardcoded config
// must move into a `salons/{salonId}` Firestore doc that both the client (for
// display) and these Functions (for validation, via a doc read) load from —
// today it's still mock data on both sides, so a plain constant is fine.
//
// SYNCED to the real BARB7 schedule — this file was NOT in this phase's
// listed file set, but leaving it on the old placeholder hours/services would
// make the createBooking Cloud Function reject every real booking (wrong
// working hours) or validate against a service catalog that no longer
// exists. Keep this in lockstep with the two client files above.

export interface ServiceConfig {
  id: string;
  name: string;
  durationMinutes: number;
}

export const SALON_ID = "barb7-vayanasala";

export const SERVICE_CATALOG: ServiceConfig[] = [
  { id: "hair-cut", name: "Hair Cut", durationMinutes: 30 },
  { id: "hair-cut-beard", name: "Hair Cut + Beard Dressing", durationMinutes: 45 },
  { id: "beard-dressing", name: "Beard Dressing", durationMinutes: 15 },
  { id: "facial", name: "Facial", durationMinutes: 90 },
  { id: "face-cleanup", name: "Face Clean Up", durationMinutes: 30 },
  { id: "d-tan", name: "D-Tan", durationMinutes: 30 },
];

export interface SessionWindow {
  start: string;
  end: string;
}
// "afternoon" removed — the salon's midday gap (2:00 PM–3:30 PM) is a lunch
// break, not a bookable session. Matches src/types/workingHours.ts.
export interface DaySessions {
  morning?: SessionWindow;
  evening?: SessionWindow;
  isClosed: boolean;
}

const openDay: DaySessions = {
  morning: { start: "09:30", end: "14:00" },
  evening: { start: "15:30", end: "20:00" },
  isClosed: false,
};

const monday: DaySessions = {
  isClosed: true,
};

export const BASE_SLOT_INTERVAL_MINUTES = 15;

export const WORKING_HOURS: Record<string, DaySessions> = {
  monday,
  tuesday: openDay,
  wednesday: openDay,
  thursday: openDay,
  friday: openDay,
  saturday: openDay,
  sunday: openDay,
};

export const WEEKDAY_KEYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export const DEFAULT_CANCELLATION_WINDOW_MINUTES = 120;