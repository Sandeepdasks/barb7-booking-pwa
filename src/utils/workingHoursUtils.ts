import { DayHours, DayKey, WorkingHours } from '../types/workingHours';

const DAY_KEYS_BY_JS_INDEX: DayKey[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export function getDayKeyForDate(date: Date): DayKey {
  return DAY_KEYS_BY_JS_INDEX[date.getDay()];
}

export function getTodayHours(wh: WorkingHours, now: Date = new Date()): DayHours {
  return wh[getDayKeyForDate(now)];
}

export function formatTime12h(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

export interface OpenStatus {
  isOpen: boolean;
  label: 'Open now' | 'Closed now' | 'Closed today';
}

export function computeOpenStatus(day: DayHours, now: Date = new Date()): OpenStatus {
  if (day.isClosed) return { isOpen: false, label: 'Closed today' };

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = day.openTime.split(':').map(Number);
  const [closeH, closeM] = day.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const isOpen = minutesNow >= openMinutes && minutesNow < closeMinutes;
  return { isOpen, label: isOpen ? 'Open now' : 'Closed now' };
}
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}