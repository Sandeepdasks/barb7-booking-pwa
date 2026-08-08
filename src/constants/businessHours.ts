import type { WorkingHoursDay } from '@/types/owner';

// Defaults only — actual source of truth is Firestore `workingHours/{salonId}`,
// owner-editable via Settings > Working Hours. These seed a salon on first setup.
//
// Sunday close time resolved to 19:00 (2026-08-06 decision) — overrides the
// 20:00 uniform figure previously recorded, per BARB7_OWNER_PORTAL_PRD_v1.0 §10.
// 03-Database.md / prior memory ("Tue–Sun 09:30–20:00 uniform") is now stale on this point.

const OPEN: Omit<WorkingHoursDay, 'end'> = { start: '09:30', closed: false };

export const DEFAULT_WORKING_HOURS = {
  monday: { start: '09:30', end: '20:00', closed: true } as WorkingHoursDay,
  tuesday: { ...OPEN, end: '20:00' } as WorkingHoursDay,
  wednesday: { ...OPEN, end: '20:00' } as WorkingHoursDay,
  thursday: { ...OPEN, end: '20:00' } as WorkingHoursDay,
  friday: { ...OPEN, end: '20:00' } as WorkingHoursDay,
  saturday: { ...OPEN, end: '20:00' } as WorkingHoursDay,
  sunday: { ...OPEN, end: '19:00' } as WorkingHoursDay, // resolved: 19:00, not 20:00
  breakStart: '14:00',
  breakEnd: '15:30',
};

// Fixed globally — no per-salon UI control (Working Hours screen explicitly omits slot interval).
export const SLOT_INTERVAL_MINUTES = 15;

// Customer-side rule, carried here only for cross-reference in owner UI (e.g. schedule window copy).
export const MAX_BOOKING_DAYS_AHEAD = 2;

// NOTE: unresolved discrepancy (flagged previously, not part of 2026-08-06 conflict resolution):
// 01-Requirements.md default cancellation window = 60 min; memory records salon's actual configured
// value as 120 min. Owner app does not enforce a cancellation window (owner may cancel any booking
// at any time) so this constant is not consumed here — surfaced only so it isn't silently lost.
export const KNOWN_UNRESOLVED_CANCELLATION_WINDOW_CONFLICT = {
  specDefaultMinutes: 60,
  configuredMinutes: 120,
};
