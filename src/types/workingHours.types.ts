import type { Timestamp, FieldValue } from 'firebase/firestore';

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DaySchedule {
  isClosed: boolean;
  openTime: string;  // "HH:mm", 24h
  closeTime: string; // "HH:mm", 24h
}

export interface LunchBreak {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export type SlotIntervalMinutes = 15 | 30 | 45 | 60;

export interface WorkingHours extends Record<DayKey, DaySchedule> {
  lunchBreak: LunchBreak;
  slotIntervalMinutes: SlotIntervalMinutes;
  updatedAt: Timestamp | FieldValue;
}

// Shape used before write (updatedAt injected by service via serverTimestamp())
export type WorkingHoursDraft = Omit<WorkingHours, 'updatedAt'>;
