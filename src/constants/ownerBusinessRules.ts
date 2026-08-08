import type { OwnerService } from '../types/owner.types';

/**
 * Owner-approved schedule (supersedes earlier Phase-2.1 7-day assumption).
 * dayOfWeek: 0 = Sunday ... 6 = Saturday (JS Date convention).
 */
export const WORKING_DAYS: Record<number, boolean> = {
  0: true, // Sunday
  1: false, // Monday - closed
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
};

export const OPEN_TIME = '09:30';
export const CLOSE_TIME = '20:00';

export const LUNCH_BREAK_START = '14:00';
export const LUNCH_BREAK_END = '15:30';

export const OWNER_SERVICES: OwnerService[] = [
  { id: 'hair-cut', name: 'Hair Cut', durationMins: 30 },
  { id: 'hair-cut-beard', name: 'Hair Cut + Beard', durationMins: 45 },
  { id: 'beard-dressing', name: 'Beard Dressing', durationMins: 15 },
  { id: 'facial', name: 'Facial', durationMins: 90 },
  { id: 'face-clean-up', name: 'Face Clean Up', durationMins: 30 },
  { id: 'd-tan', name: 'D-Tan', durationMins: 30 },
];

export const isSalonOpenOnDate = (date: Date): boolean => WORKING_DAYS[date.getDay()];
