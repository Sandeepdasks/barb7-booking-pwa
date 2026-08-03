import { WorkingHoursConfig, DaySessions } from "../types/workingHours";

// Session-based schema per Phase-2.2 booking-page spec — distinct from the
// simpler openTime/closeTime/isClosed shape in 03-Database.md's `workingHours`
// collection (used by the landing page's useWorkingHours hook). Reconciled here
// on the same open/close bounds (Mon-Sat 09:00-20:00, Sun 09:00-19:00), split
// into morning/afternoon/evening sessions with a 13:00-14:30 lunch gap.
// Flag for owner-config phase: pick ONE schema before wiring to Firestore.
const weekday: DaySessions = {
  morning: { start: "09:00", end: "12:00" },
  afternoon: { start: "14:30", end: "17:30" },
  evening: { start: "18:00", end: "20:00" },
  isClosed: false,
};

const sunday: DaySessions = {
  morning: { start: "09:00", end: "12:00" },
  afternoon: { start: "14:30", end: "17:30" },
  evening: { start: "18:00", end: "19:00" },
  isClosed: false,
};

export const mockWorkingHoursConfig: WorkingHoursConfig = {
  baseSlotIntervalMinutes: 30,
  monday: weekday,
  tuesday: weekday,
  wednesday: weekday,
  thursday: weekday,
  friday: weekday,
  saturday: weekday,
  sunday,
};