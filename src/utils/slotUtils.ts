import { DayHours } from '../types/workingHours';

export interface TimeSlot {
  time: string; // "09:00"
  isBooked: boolean;
}

// Deterministic mock "booked" pattern — gives disabled slots without a backend.
const MOCK_BOOKED_TIMES = new Set(['09:30', '11:00', '15:30', '18:00']);

export function generateSlots(day: DayHours, slotDurationMinutes: number): TimeSlot[] {
  if (day.isClosed) return [];

  const [openH, openM] = day.openTime.split(':').map(Number);
  const [closeH, closeM] = day.closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  const slots: TimeSlot[] = [];
  for (let m = openMinutes; m + slotDurationMinutes <= closeMinutes; m += slotDurationMinutes) {
    const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    slots.push({ time, isBooked: MOCK_BOOKED_TIMES.has(time) });
  }
  return slots;
}