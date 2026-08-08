import type { DayKey, SlotIntervalMinutes, WorkingHoursDraft } from '../types/workingHours.types';

export const DAY_KEYS: DayKey[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const SLOT_INTERVAL_OPTIONS: SlotIntervalMinutes[] = [15, 30, 45, 60];

export const MIN_WORKING_DURATION_MINUTES = 60;

// Owner-confirmed default schedule (locked business config).
export const DEFAULT_WORKING_HOURS: WorkingHoursDraft = {
  monday: { isClosed: true, openTime: '09:30', closeTime: '20:00' },
  tuesday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  wednesday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  thursday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  friday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  saturday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  sunday: { isClosed: false, openTime: '09:30', closeTime: '20:00' },
  lunchBreak: { start: '14:00', end: '15:30' },
  slotIntervalMinutes: 30,
};
