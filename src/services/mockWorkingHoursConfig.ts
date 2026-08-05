import { WorkingHoursConfig, DaySessions } from "../types/workingHours";

// REAL BARB7 operating schedule (replaces earlier placeholder mock hours).
// Two bookable sessions per open day — Morning and Evening — split by an
// unbookable lunch break (2:00 PM–3:30 PM), which is simply the gap between
// morning.end and evening.start and needs no entry of its own. Monday is
// fully closed. Base grid granularity dropped from 30 to 15 minutes so
// 15-minute services (Beard Dressing) and 45-minute services (Hair Cut +
// Beard Dressing) both land on exact slot boundaries.
const openDay: DaySessions = {
  morning: { start: "09:30", end: "14:00" },
  evening: { start: "15:30", end: "20:00" },
  isClosed: false,
};

const monday: DaySessions = {
  isClosed: true,
};

export const mockWorkingHoursConfig: WorkingHoursConfig = {
  baseSlotIntervalMinutes: 15,
  monday,
  tuesday: openDay,
  wednesday: openDay,
  thursday: openDay,
  friday: openDay,
  saturday: openDay,
  sunday: openDay,
};